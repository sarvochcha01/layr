"use client";

import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
import { useBackendContext } from "@/contexts/BackendContext";
import { useState, useRef } from "react";
import { BackendAction } from "@/types/backend";
import { toast } from "sonner";

interface FormField {
  id: string;
  type: "text" | "email" | "password" | "tel" | "number" | "textarea" | "select" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormProps {
  title?: string;
  description?: string;
  fields?: FormField[];
  submitText?: string;
  action?: string;
  method?: "GET" | "POST";
  className?: string;
  layout?: "vertical" | "horizontal";
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  themeStyle?: ThemeStyleVariant;
  /** Backend action config — when set, form submits to the endpoint */
  backendAction?: BackendAction;
  /** Project ID for backend calls */
  projectId?: string;
  /** Callback for internal page navigation */
  onNavigate?: (slug: string) => void;
  [key: string]: any;
}

export function Form({
  title,
  description,
  fields = [],
  submitText = "Submit",
  action,
  method = "POST",
  className,
  layout = "vertical",
  width,
  height,
  backgroundColor,
  textColor,
  themeStyle,
  backendAction,
  projectId,
  onNavigate,
  ...rest
}: FormProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get projectId from context (provided by BackendProvider in EditorLayout)
  const { projectId: ctxProjectId } = useBackendContext();
  const resolvedProjectId = projectId || ctxProjectId;

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || "var(--theme-surface)",
    color: textColor || "var(--theme-text)",
    borderRadius: "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    padding: "24px",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...getUserStyleOverrides(rest),
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--theme-input-bg)",
    color: "var(--theme-text)",
    border: "1px solid var(--theme-border)",
    borderRadius: "var(--theme-radius)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 200ms ease, box-shadow 200ms ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--theme-text)",
    marginBottom: "6px",
    letterSpacing: "var(--theme-letter-spacing)",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const payload: Record<string, any> = {};

    // Collect all form values
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    // If backendAction is configured, send to endpoint
    if (backendAction?.endpointId && resolvedProjectId) {
      setIsSubmitting(true);

      try {
        // Build mapped body
        let body: Record<string, any> = {};
        if (
          backendAction.payloadMapping &&
          Object.keys(backendAction.payloadMapping).length > 0
        ) {
          for (const [sourceKey, targetKey] of Object.entries(
            backendAction.payloadMapping
          )) {
            if (sourceKey in payload) {
              body[targetKey] = payload[sourceKey];
            }
          }
        } else {
          // No mapping — send payload as-is
          body = payload;
        }

        // POST to the actual endpoint path (e.g. /api/backend/login)
        const path = backendAction.endpointPath?.startsWith("/")
          ? backendAction.endpointPath
          : `/${backendAction.endpointPath || ""}`;
        const response = await fetch(`/api/backend${path}`, {
          method: backendAction.endpointMethod || "POST",
          headers: {
            "Content-Type": "application/json",
          "x-project-id": resolvedProjectId,
          },
          body: JSON.stringify(body),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          // Parse error details from pipeline validation
          let errMsg = `Request failed (${response.status})`;
          if (data?.error) errMsg = data.error;
          if (data?.details && Array.isArray(data.details)) {
            errMsg += ": " + data.details.join(", ");
          }
          throw new Error(errMsg);
        }

        // Save preview auth session if payload returned user details
        if (data && (data.uid || data.token)) {
          if (typeof window !== "undefined" && resolvedProjectId) {
            localStorage.setItem(`preview-user-${resolvedProjectId}`, JSON.stringify(data));
          }
        }

        // Clear preview session if signing out
        if (path.toLowerCase().endsWith("/signout")) {
          if (typeof window !== "undefined" && resolvedProjectId) {
            localStorage.removeItem(`preview-user-${resolvedProjectId}`);
          }
        }

        // Handle success behavior
        toast.success(backendAction.successMessage || "Submitted successfully!");

        if (backendAction.onSuccess === "reset") {
          formRef.current.reset();
        } else if (backendAction.onSuccess === "redirect" && backendAction.redirectUrl) {
          const url = backendAction.redirectUrl;
          if (url.startsWith("/") && !url.startsWith("//") && onNavigate) {
            // Internal page — use onNavigate for SPA routing
            const slug = url.replace(/^\/+/, ""); // strip leading slash
            onNavigate(slug);
          } else {
            window.location.href = url;
          }
        }
      } catch (err) {
        const failMode = backendAction.onFail || "toast";

        if (failMode === "redirect" && backendAction.failRedirectUrl) {
          window.location.href = backendAction.failRedirectUrl;
          return;
        }

        if (failMode !== "none") {
          toast.error(backendAction.failMessage || (err as Error).message);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.id}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={fieldId} style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: "var(--theme-accent)", marginLeft: 4 }}>*</span>}
            </label>
            <textarea
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="focus:ring-2 focus:ring-[color:var(--theme-accent)]"
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={fieldId} style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: "var(--theme-accent)", marginLeft: 4 }}>*</span>}
            </label>
            <select
              id={fieldId}
              name={field.id}
              required={field.required}
              style={inputStyle}
            >
              <option value="" style={{ background: "var(--theme-surface)", color: "var(--theme-text-muted)" }}>
                Select an option
              </option>
              {field.options?.map((option, index) => (
                <option key={index} value={option} style={{ background: "var(--theme-surface)", color: "var(--theme-text)" }}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id={fieldId}
              name={field.id}
              required={field.required}
              style={{
                width: 18,
                height: 18,
                accentColor: "var(--theme-accent)",
                cursor: "pointer",
              }}
            />
            <label htmlFor={fieldId} style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>
              {field.label}
            </label>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-1.5">
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: "var(--theme-accent)", marginLeft: 4 }}>*</span>}
            </label>
            <div className="space-y-2 pl-1">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={`${fieldId}-${index}`}
                    name={field.id}
                    value={option}
                    required={field.required}
                    style={{ accentColor: "var(--theme-accent)", width: 16, height: 16, cursor: "pointer" }}
                  />
                  <label
                    htmlFor={`${fieldId}-${index}`}
                    style={{ fontSize: "14px", color: "var(--theme-text)", cursor: "pointer" }}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-1.5">
            <label htmlFor={fieldId} style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: "var(--theme-accent)", marginLeft: 4 }}>*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="focus:ring-2 focus:ring-[color:var(--theme-accent)]"
              style={inputStyle}
            />
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full", className)} style={rootStyle}>
      {title && (
        <h2
          className="text-2xl mb-2"
          style={{
            fontWeight: "var(--theme-heading-weight)" as any,
            color: "var(--theme-text)",
            letterSpacing: "var(--theme-letter-spacing)",
            fontFamily: "var(--theme-heading-font)",
          }}
        >
          {title}
        </h2>
      )}
      {description && (
        <p className="mb-6 text-sm" style={{ color: "var(--theme-text-muted)" }}>
          {description}
        </p>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {fields.map((field) => renderField(field))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 text-sm font-bold tracking-wider transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: "var(--theme-accent)",
            color: "var(--theme-accent-fg)",
            borderRadius: "var(--theme-radius)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
            boxShadow: "var(--theme-hard-shadow, none)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Submitting..." : submitText}
        </button>
      </form>
    </div>
  );
}

