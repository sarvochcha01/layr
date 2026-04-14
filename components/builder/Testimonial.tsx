import { Star, StarHalf } from "lucide-react";
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

  // Render star rating with half-star support
  const renderStars = () => {
    if (rating <= 0) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 <= 0.75;
    const roundedUp = rating % 1 > 0.75;

    return (
      <div className="flex gap-1 mb-6">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars || (roundedUp && i === fullStars)) {
            return <Star key={i} className="w-5 h-5 fill-primary text-primary" />;
          }
          if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative w-5 h-5">
                <Star className="w-5 h-5 text-muted absolute" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star className="w-5 h-5 fill-primary text-primary" />
                </div>
              </div>
            );
          }
          return <Star key={i} className="w-5 h-5 text-muted" />;
        })}
      </div>
    );
  };

  // Variant-specific styles
  const variantClasses = {
    card: cn(
      "p-8 rounded-2xl",
      "border border-border",
      "hover:border-border/80",
      "hover:-translate-y-0.5",
    ),
    minimal: cn(
      "p-6",
      "border-l-4 border-primary",
    ),
    featured: cn(
      "p-10 rounded-2xl",
      "border border-primary/30",
      "ring-1 ring-primary/10",
      "shadow-lg shadow-primary/5",
    ),
  };

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden transition-all duration-300",
        variantClasses[variant] || variantClasses.card,
      )}
      style={baseStyle}
    >
      {/* Rating Stars */}
      {renderStars()}

      {/* Quote */}
      <blockquote
        className={cn(
          "leading-relaxed mb-8 break-words",
          variant === "featured" ? "text-xl italic" : "text-lg italic",
        )}
        style={{
          fontFamily: "'Inter', sans-serif",
          opacity: 0.85,
        }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className={cn(
        "flex items-center gap-3",
        variant === "minimal" ? "" : "pt-6 border-t border-border",
      )}>
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            style={{ aspectRatio: "1/1" }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-muted flex-shrink-0">
            {author?.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {author}
          </div>
          <div className="text-xs text-muted-foreground truncate uppercase tracking-wider">
            {role}
            {company && `, ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
