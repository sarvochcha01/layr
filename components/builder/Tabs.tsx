"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

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
  themeStyle?: ThemeStyleVariant;
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
  themeStyle,
  ...rest
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [prevTab, setPrevTab] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleTabChange = (index: number) => {
    if (index === activeTab || animating) return;
    setPrevTab(activeTab);
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(index);
      setAnimating(false);
      setPrevTab(null);
    }, 160);
  };

  const baseStyle = buildComponentStyle({
    backgroundColor: rest.backgroundType === "gradient" ? undefined : backgroundColor,
    backgroundType: rest.backgroundType,
    gradientStart: rest.gradientStart,
    gradientEnd: rest.gradientEnd,
    gradientDirection: rest.gradientDirection,
    gradientAngle: rest.gradientAngle,
    backgroundGradient: rest.backgroundGradient,
    width,
    height,
    ...rest,
  });
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);


  return (
    <div style={{ ...baseStyle, ...cssVars }} className="rounded-lg">
      {/* Tab Headers */}
      <div
        className={cn(
        "flex gap-1 relative",
          variant === "bordered" && "border-b border-border",
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;

          return (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={cn(
                "px-4 py-2.5 font-medium text-sm relative transition-colors duration-200",
                variant === "underline" && "border-b-2",
                variant === "pills" && "rounded-lg",
                variant === "bordered" && "border-b-2 -mb-px",
              )}
              style={{
                borderColor: isActive && variant !== "pills" ? activeTabColor : "transparent",
                color: isActive ? activeTabColor : tabHeadingColor,
                backgroundColor:
                  isActive && variant === "pills" ? `${activeTabColor}20` : "transparent",
                transition: "color 200ms ease, background-color 200ms ease, border-color 200ms ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content with fade transition */}
      <div
        className="py-6 px-1 leading-relaxed"
        style={{
          color: contentTextColor,
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(4px)" : "translateY(0)",
          transition: "opacity 160ms ease, transform 160ms ease",
        }}
      >
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
