import { useState, useEffect, useCallback } from "react";
import { HttpMethod } from "@/types/backend";

interface UseBackendDataOptions {
  /** HTTP method — defaults to GET */
  method?: HttpMethod;
  /** Request body for POST/PUT/PATCH */
  body?: any;
  /** Project ID — required for the x-project-id header */
  projectId?: string;
  /** Whether to fetch immediately — defaults to true */
  enabled?: boolean;
  /** Re-fetch interval in ms — set to 0 to disable */
  refetchInterval?: number;
}

interface UseBackendDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching data from backend endpoints
 * defined in the Backend Editor.
 *
 * Usage:
 *   const { data, isLoading, error } = useBackendData("/products", {
 *     projectId: "abc123",
 *   });
 *
 * The hook fetches from /api/backend/{path} with the
 * x-project-id header set to the project ID.
 */
export function useBackendData<T = any>(
  endpointPath: string,
  options: UseBackendDataOptions = {}
): UseBackendDataResult<T> {
  const {
    method = "GET",
    body,
    projectId,
    enabled = true,
    refetchInterval = 0,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId || !endpointPath) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/backend${endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`}`;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-project-id": projectId,
        },
      };

      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [endpointPath, method, body, projectId]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Optional polling
  useEffect(() => {
    if (!enabled || refetchInterval <= 0) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [enabled, refetchInterval, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
