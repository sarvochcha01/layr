"use client";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SwitchFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id?: string;
}

export function SwitchField({
  value,
  onChange,
  label,
  id,
}: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted border border-border/50">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground cursor-pointer"
      >
        {label}
      </Label>
      <Switch
        id={id}
        checked={value || false}
        onCheckedChange={onChange}
        className="scale-75 origin-right"
      />
    </div>
  );
}
