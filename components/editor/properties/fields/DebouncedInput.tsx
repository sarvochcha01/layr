"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

/**
 * Input with local state management.
 * Prevents keystroke lag by buffering locally and committing on blur/Enter.
 * Use this anywhere you'd normally write:
 *   <Input value={...} onChange={(e) => updateProp(..., e.target.value)} />
 */
export function DebouncedInput({
  value,
  onChange,
  type = "text",
  id,
  placeholder,
  className,
  min,
  max,
  step,
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const prevValueRef = useRef(value);

  // Sync from parent when external value changes (e.g., different component selected)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setLocalValue(value ?? "");
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
      type={type}
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
      className={className || "h-8 text-xs"}
      min={min}
      max={max}
      step={step}
    />
  );
}
