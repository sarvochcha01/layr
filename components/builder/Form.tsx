"use client";

import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { getUserStyleOverrides } from "@/lib/buildStyle";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
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
  [key: string]: any;
}

export function Form({
  title,
  description,
  fields = [],
  submitText = "Submit",
  action = "#",
  method = "POST",
  className,
  layout = "vertical",
  width,
  height,
  backgroundColor,
  textColor,
  themeStyle,
  ...rest
}: FormProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

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

      <form action={action} method={method} className="space-y-5">
        {fields.map((field) => renderField(field))}

        <button
          type="submit"
          className="w-full py-3 text-sm font-bold tracking-wider transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "var(--theme-accent)",
            color: "var(--theme-accent-fg)",
            borderRadius: "var(--theme-radius)",
            border: `var(--theme-border-width) solid var(--theme-border)`,
            boxShadow: "var(--theme-hard-shadow, none)",
            cursor: "pointer",
          }}
        >
          {submitText}
        </button>
      </form>
    </div>
  );
}
