"use client";
import React from "react";
import { Label } from "@/components/ui/label";

interface SliderFieldProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  formatDisplay?: (value: number) => string;
}

export function SliderField({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  step = 0.01,
  formatDisplay,
}: SliderFieldProps) {
  const displayText = formatDisplay
    ? formatDisplay(value)
    : `${Math.round(value * 100)}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground">{displayText}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}
