"use client";
import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * Textarea with local state management.
 * Prevents keystroke lag by only committing to parent on blur.
 */
export function TextareaField({
  value,
  onChange,
  id,
  placeholder,
  rows = 3,
  className,
}: TextareaFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const prevValueRef = useRef(value);

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
    <Textarea
      id={id}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={commitValue}
      placeholder={placeholder}
      rows={rows}
      className={className || "text-sm resize-none"}
    />
  );
}
