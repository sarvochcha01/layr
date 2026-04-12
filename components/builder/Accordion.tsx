import { useState } from "react";
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
        "Yes. Obsidian Architect is built on a modular AST (Abstract Syntax Tree) that allows for 1-click export to clean, production-ready React and Tailwind CSS codebases. No vendor lock-in, ever.",
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
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index],
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const outerStyle = buildComponentStyle({
    width: width || "100%",
    height,
    ...rest,
  });

  return (
    <div
      className="w-full space-y-0"
      style={{ ...outerStyle, display: "block", backgroundColor }}
    >
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        return (
          <div
            key={index}
            className={cn(
              "w-full border-b transition-all duration-300",
              isOpen && "bg-[#1a1a1a]",
            )}
            style={{
              borderColor,
            }}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-5 flex items-center justify-between transition-colors hover:bg-[#1a1a1a]"
              style={{ backgroundColor: "transparent", color: textColor }}
            >
              <span className="font-medium text-left text-base">
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform flex-shrink-0 ml-4",
                  isOpen ? "rotate-180" : "",
                )}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-relaxed text-gray-400 border-l-2 border-blue-500 ml-6">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
