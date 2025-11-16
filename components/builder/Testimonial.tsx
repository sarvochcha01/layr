import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function Testimonial({
  quote = "This product has completely transformed how we work. Highly recommended!",
  author = "John Doe",
  role = "CEO",
  company = "Company Inc",
  avatar,
  rating = 5,
  variant = "card",
  backgroundColor,
  textColor,
  width,
  height,
}: TestimonialProps) {
  return (
    <div
      className={cn(
        "p-6",
        variant === "card" && "bg-white rounded-lg shadow-md",
        variant === "featured" &&
          "bg-white rounded-lg shadow-lg border-l-4 border-blue-500"
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
        backgroundColor: backgroundColor || undefined,
        color: textColor || undefined,
      }}
    >
      {/* Rating */}
      {rating > 0 && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-lg mb-4 italic">"{quote}"</blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <div className="font-semibold">{author}</div>
          <div className="text-sm opacity-75">
            {role}
            {company && ` at ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
