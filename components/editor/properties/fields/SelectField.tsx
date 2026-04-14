"use client";
import React from "react";
import { SelectOption } from "../types";

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  className?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  id,
}: SelectFieldProps) {
  return (
    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-primary">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 text-xs bg-transparent appearance-none focus:outline-none"
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-background text-foreground"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
