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
  quote = "This product has completely transformed how we work. The attention to detail and ease of use is unmatched.",
  author = "Sarah Johnson",
  role = "Head of Design",
  company = "Acme Inc",
  avatar,
  rating = 5,
  variant = "card",
  backgroundColor,
  textColor,
  width,
  height,
  ...rest
}: TestimonialProps) {
  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  return (
    <div
      className={cn(
        "p-8 rounded-2xl min-w-0 overflow-hidden transition-all duration-300",
        variant === "card" && !backgroundColor && "bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_24px_rgba(0,0,0,0.06)]",
        variant === "featured" && !backgroundColor && "bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.1)]",
        variant === "minimal" && "bg-transparent",
        "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.1)]"
      )}
      style={baseStyle}
    >
      {/* Decorative quote mark */}
      <div
        className="text-5xl font-serif leading-none mb-4 select-none"
        style={{ color: "#6366f1", opacity: 0.3 }}
      >
        "
      </div>

      {/* Quote */}
      <blockquote
        className="text-base leading-relaxed mb-6 break-words"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {quote}
      </blockquote>

      {/* Rating */}
      {rating > 0 && (
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
          >
            {author?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{author}</div>
          <div className="text-xs opacity-50 truncate">
            {role}{company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
