"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BackendAction, ApiEndpoint } from "@/types/backend";

interface UseBackendActionOptions {
  action: BackendAction;
  endpoint: ApiEndpoint | undefined;
  projectId: string | null;
  /** Whether the action is live (preview mode / exported) */
  isActive: boolean;
  /** Callback after successful execution */
  onSuccess?: (data: any) => void;
  /** Callback on error */
  onError?: (error: string) => void;
}

interface UseBackendActionReturn {
  /** Manually execute the action with the given payload */
  execute: (payload?: Record<string, any>) => Promise<any>;
  /** Whether a request is currently in-flight */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
  /** Last successful response */
  result: any;
  /** Reset state */
  reset: () => void;
}

/**
 * Hook for executing backend actions.
 * Handles all trigger types: submit, click, interval, mount.
 * Manages loading/error/success state.
 */
export function useBackendAction({
  action,
  endpoint,
  projectId,
  isActive,
  onSuccess,
  onError,
}: UseBackendActionOptions): UseBackendActionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Execute the action — sends data to the endpoint.
   * @param payload Optional payload to send. If not provided,
   *   uses staticPayload for "static" source, or empty object.
   */
  const execute = useCallback(
    async (payload?: Record<string, any>) => {
      // Resolve path and method from endpoint or from stored action config
      const path = endpoint?.path || action.endpointPath;
      const method = endpoint?.method || action.endpointMethod;

      if (!path || !projectId) {
        const msg = "Endpoint or project not configured";
        setError(msg);
        onError?.(msg);
        return null;
      }

      // Build the request body
      let body: Record<string, any> = {};

      if (action.payloadSource === "static") {
        body = action.staticPayload || {};
      } else if (payload) {
        // Map payload keys using payloadMapping
        if (
          action.payloadMapping &&
          Object.keys(action.payloadMapping).length > 0
        ) {
          for (const [sourceKey, targetKey] of Object.entries(
            action.payloadMapping
          )) {
            if (sourceKey in payload) {
              body[targetKey] = payload[sourceKey];
            }
          }
        } else {
          // No mapping — pass payload as-is
          body = payload;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = `/api/backend${path.startsWith("/") ? path : `/${path}`}`;
        const response = await fetch(url, {
          method: method || "POST",
          headers: {
            "Content-Type": "application/json",
            "x-project-id": projectId,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const msg =
            data?.error || `Request failed with status ${response.status}`;
          setError(msg);
          onError?.(msg);
          return null;
        }

        setResult(data);
        onSuccess?.(data);
        return data;
      } catch (err) {
        const msg = (err as Error).message;
        setError(msg);
        onError?.(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [action, endpoint, projectId, onSuccess, onError]
  );

  // ── Interval trigger ──────────────────────────────────────
  useEffect(() => {
    if (
      !isActive ||
      action.trigger !== "interval" ||
      !endpoint ||
      !projectId
    ) {
      return;
    }

    const ms = action.intervalMs || 5000;
    intervalRef.current = setInterval(() => {
      execute();
    }, ms);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, action.trigger, action.intervalMs, endpoint, projectId, execute]);

  // ── Mount trigger ─────────────────────────────────────────
  useEffect(() => {
    if (
      !isActive ||
      action.trigger !== "mount" ||
      !endpoint ||
      !projectId ||
      mountedRef.current
    ) {
      return;
    }

    mountedRef.current = true;
    execute();
  }, [isActive, action.trigger, endpoint, projectId, execute]);

  // Reset mounted ref when action changes
  useEffect(() => {
    mountedRef.current = false;
  }, [action.id]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { execute, isLoading, error, result, reset };
}
