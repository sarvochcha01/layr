import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  variant?: "card" | "minimal" | "featured";
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  [key: string]: any;
}

export function Testimonial({
  quote = "The Obsidian Architect has transformed how our design team ships. It's the precision of an IDE with the speed of a site builder.",
  author = "Marcus Chen",
  role = "CTO",
  company = "NEXUS DIGITAL",
  avatar,
  rating = 5,
  variant = "card",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  width,
  height,
  ...rest
}: TestimonialProps) {
  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <div
      className={cn(
        "p-8 rounded-2xl min-w-0 overflow-hidden transition-all duration-300",
        "border border-[#2a2a2a]",
        "hover:border-[#3a3a3a]",
        "hover:-translate-y-0.5",
      )}
      style={baseStyle}
    >
      {/* Rating Stars */}
      {rating > 0 && (
        <div className="flex gap-1 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < rating ? "fill-blue-400 text-blue-400" : "text-gray-700",
              )}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote
        className="text-lg leading-relaxed mb-8 break-words italic text-gray-300"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-6 border-t border-[#2a2a2a]">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2a2a2a]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-[#2a2a2a]">
            {author?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate text-white">
            {author}
          </div>
          <div className="text-xs text-gray-400 truncate uppercase tracking-wider">
            {role}
            {company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
