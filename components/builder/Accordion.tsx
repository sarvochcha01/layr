import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function Accordion({
  items = [
    { title: "Accordion Item 1", content: "Content for item 1" },
    { title: "Accordion Item 2", content: "Content for item 2" },
  ],
  allowMultiple = false,
  defaultOpen = 0,
  backgroundColor = "#ffffff",
  textColor,
  borderColor = "#e5e7eb",
  width,
  height,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([defaultOpen]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div
      className="w-full space-y-2"
      style={{
        width: width || "100%",
        height: height || undefined,
        display: "block",
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="w-full border rounded-lg overflow-hidden"
          style={{
            backgroundColor,
            color: textColor || undefined,
            borderColor,
          }}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-left">{item.title}</span>
            <ChevronDown
              className={cn(
                "w-5 h-5 transition-transform",
                openItems.includes(index) && "rotate-180"
              )}
            />
          </button>
          {openItems.includes(index) && (
            <div className="px-4 py-3 border-t" style={{ borderColor }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
