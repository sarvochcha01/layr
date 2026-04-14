"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Text input with local state management.
 * Uses local state + sync on blur/Enter to prevent keystroke lag.
 * The value from parent is synced when the component ID or key changes.
 */
export function TextField({
  value,
  onChange,
  id,
  placeholder,
  className,
}: TextFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const prevValueRef = useRef(value);

  // Sync from parent when external value changes (e.g., different component selected)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setLocalValue(value || "");
      prevValueRef.current = value;
    }
  }, [value]);

  const commitValue = () => {
    if (localValue !== value) {
      onChange(localValue);
      prevValueRef.current = localValue;
    }
  };

  return (
    <Input
      id={id}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commitValue();
          (e.target as HTMLInputElement).blur();
        }
      }}
      placeholder={placeholder}
      className={className || "h-8 text-sm"}
    />
  );
}
