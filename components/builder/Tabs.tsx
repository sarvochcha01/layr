"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs?: Tab[];
  defaultTab?: number;
  variant?: "underline" | "pills" | "bordered";
  backgroundColor?: string;
  tabHeadingColor?: string;
  contentTextColor?: string;
  activeTabColor?: string;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function Tabs({
  tabs = [
    { label: "Tab 1", content: "Content for tab 1" },
    { label: "Tab 2", content: "Content for tab 2" },
    { label: "Tab 3", content: "Content for tab 3" },
  ],
  defaultTab = 0,
  variant = "underline",
  backgroundColor = "#0d0d0d",
  tabHeadingColor = "#9ca3af",
  contentTextColor = "#e5e7eb",
  activeTabColor = "#3b82f6",
  width,
  height,
  ...rest
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const baseStyle = buildComponentStyle({
    backgroundColor:
      rest.backgroundType === "gradient" ? undefined : backgroundColor,
    backgroundType: rest.backgroundType,
    gradientStart: rest.gradientStart,
    gradientEnd: rest.gradientEnd,
    gradientDirection: rest.gradientDirection,
    gradientAngle: rest.gradientAngle,
    backgroundGradient: rest.backgroundGradient, // Fallback for old format
    width,
    height,
    ...rest,
  });

  return (
    <div style={baseStyle} className="w-full rounded-lg">
      {/* Tab Headers */}
      <div
        className={cn(
          "flex gap-1",
          variant === "bordered" && "border-b border-border",
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;

          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-2.5 font-medium transition-all duration-200 text-sm relative",
                variant === "underline" && "border-b-2",
                variant === "pills" && "rounded-lg",
                variant === "bordered" && "border-b-2 -mb-px",
              )}
              style={{
                borderColor:
                  isActive && variant !== "pills"
                    ? activeTabColor
                    : "transparent",
                color: isActive ? activeTabColor : tabHeadingColor,
                backgroundColor:
                  isActive && variant === "pills"
                    ? `${activeTabColor}20`
                    : "transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="py-6 px-1 leading-relaxed"
        style={{ color: contentTextColor }}
      >
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
