"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

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
  [key: string]: any;
}

function AccordionItemRow({
  item,
  isOpen,
  onToggle,
  textColor,
  borderColor,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  textColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={cn(
        "w-full border-b transition-colors duration-200",
        isOpen && "bg-[#1a1a1a]",
      )}
      style={{ borderColor }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between group"
        style={{ backgroundColor: "transparent", color: textColor }}
      >
        <span className="font-medium text-left text-base transition-colors duration-200 group-hover:text-blue-400">
          {item.title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 flex-shrink-0 ml-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isOpen ? "rotate-180 text-blue-400" : "text-gray-500",
          )}
        />
      </button>

      {/* Grid-row height animation — no JS height measuring needed */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 280ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            className="px-6 pb-5 text-sm leading-relaxed text-gray-400 border-l-2 border-blue-500 ml-6"
            style={{
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
        "Yes. Obsidian Architect is built on a modular AST that allows for 1-click export to clean, production-ready React and Tailwind CSS codebases. No vendor lock-in, ever.",
    },
  ],
  allowMultiple = false,
  defaultOpen = 1,
  backgroundColor = "#0d0d0d",
  textColor = "#ffffff",
  borderColor = "#2a2a2a",
  width,
  height,
  ...rest
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([defaultOpen]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const outerStyle = buildComponentStyle({ width: width || "100%", height, ...rest });

  return (
    <div className="w-full" style={{ ...outerStyle, display: "block", backgroundColor }}>
      {items.map((item, index) => (
        <AccordionItemRow
          key={index}
          item={item}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
          textColor={textColor}
          borderColor={borderColor}
        />
      ))}
    </div>
  );
}
