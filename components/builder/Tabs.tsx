"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  backgroundColor,
  tabHeadingColor,
  contentTextColor,
  activeTabColor,
  width,
  height,
  themeStyle,
  ...rest
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [animating, setAnimating] = useState(false);

  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const handleTabChange = (index: number) => {
    if (index === activeTab || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(index);
      setAnimating(false);
    }, 160);
  };

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || "var(--theme-bg)",
    color: contentTextColor || "var(--theme-text)",
    borderRadius: "var(--theme-radius)",
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div style={rootStyle} className="overflow-hidden">
      {/* Tab Headers */}
      <div
        className={cn("flex gap-1 relative")}
        style={{
          borderBottom: variant === "bordered" || variant === "underline"
            ? `1px solid var(--theme-border)`
            : "none",
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          const aColor = activeTabColor || "var(--theme-accent)";
          const iColor = tabHeadingColor || "var(--theme-text-muted)";

          return (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className="px-4 py-2.5 font-medium text-sm relative transition-all duration-200"
              style={{
                borderBottom: variant !== "pills"
                  ? `2px solid ${isActive ? aColor : "transparent"}`
                  : "none",
                color: isActive ? aColor : iColor,
                backgroundColor:
                  isActive && variant === "pills"
                    ? "color-mix(in srgb, var(--theme-accent) 15%, transparent)"
                    : "transparent",
                borderRadius: variant === "pills" ? "var(--theme-radius)" : undefined,
                marginBottom: variant === "bordered" ? "-1px" : undefined,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className="py-6 px-4 leading-relaxed text-sm"
        style={{
          color: contentTextColor || "var(--theme-text)",
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
