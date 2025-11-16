import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs?: Tab[];
  defaultTab?: number;
  variant?: "underline" | "pills" | "bordered";
  backgroundColor?: string;
  textColor?: string;
  activeColor?: string;
  width?: string;
  height?: string;
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
  textColor,
  activeColor = "#3b82f6",
  width,
  height,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div
      style={{
        width: width || undefined,
        height: height || undefined,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {/* Tab Headers */}
      <div className={cn("flex gap-2", variant === "bordered" && "border-b")}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              variant === "underline" && "border-b-2",
              variant === "pills" && "rounded-lg",
              variant === "bordered" && "border-b-2 -mb-px",
              activeTab === index
                ? variant === "pills"
                  ? "bg-blue-100"
                  : ""
                : "opacity-60 hover:opacity-100"
            )}
            style={{
              borderColor: activeTab === index ? activeColor : "transparent",
              color: activeTab === index ? activeColor : textColor || undefined,
              backgroundColor:
                activeTab === index && variant === "pills"
                  ? `${activeColor}20`
                  : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">{tabs[activeTab]?.content}</div>
    </div>
  );
}
