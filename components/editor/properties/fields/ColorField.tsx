"use client";
import React from "react";
import { Input } from "@/components/ui/input";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  defaultColor?: string;
}

export function ColorField({
  value,
  onChange,
  id,
  defaultColor = "#000000",
}: ColorFieldProps) {
  const displayValue = value || defaultColor;

  return (
    <div className="flex gap-2 items-center">
      <Input
        id={id}
        type="color"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
      />
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 text-xs font-mono"
      />
    </div>
  );
}
