"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items?: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  width?: string;
  height?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function Accordion({
  items = [
    {
      title: "How does the Visual Builder handle responsiveness?",
      content:
        "The Visual Builder automatically adapts your designs for all screen sizes using responsive breakpoints and flexible layouts.",
    },
    {
      title: "Can I export my project to pure React?",
      content:
        "Yes. The Architect is built on a modular AST that allows for 1-click export to clean, production-ready React and Tailwind CSS codebases. No vendor lock-in, ever.",
    },
  ],
  allowMultiple = false,
  defaultOpen = 1,
  backgroundColor,
  textColor,
  borderColor,
  width,
  height,
  themeStyle,
  ...rest
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([defaultOpen]);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const rootStyle: React.CSSProperties = {
    ...cssVars,
    backgroundColor: backgroundColor || "var(--theme-bg)",
    color: textColor || "var(--theme-text)",
    borderRadius: "var(--theme-radius)",
    border: `var(--theme-border-width) solid var(--theme-border)`,
    overflow: "hidden",
    ...(width ? { width } : { width: "100%" }),
    ...(height ? { height } : {}),
  };

  return (
    <div style={rootStyle}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        return (
          <div
            key={index}
            style={{
              borderBottom: index < items.length - 1
                ? `1px solid ${borderColor || "var(--theme-border)"}`
                : "none",
              backgroundColor: isOpen
                ? "color-mix(in srgb, var(--theme-surface) 80%, var(--theme-accent) 5%)"
                : "transparent",
              transition: "background-color 200ms ease",
            }}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-5 flex items-center justify-between group"
              style={{ background: "transparent", color: "var(--theme-text)" }}
            >
              <span
                className="font-medium text-left text-base transition-colors duration-200"
                style={{ color: isOpen ? "var(--theme-accent)" : "var(--theme-text)" }}
              >
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isOpen && "rotate-180",
                )}
                style={{ color: isOpen ? "var(--theme-accent)" : "var(--theme-text-muted)" }}
              />
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  className="px-6 pb-5 text-sm leading-relaxed ml-6"
                  style={{
                    color: "var(--theme-text-muted)",
                    borderLeft: `2px solid var(--theme-accent)`,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-4px)",
                    transition: "opacity 220ms ease, transform 220ms ease",
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
