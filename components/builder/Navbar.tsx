import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buildComponentStyle } from "@/lib/buildStyle";

interface NavLink {
  text: string;
  href: string;
  external?: boolean;
}

interface NavbarProps {
  logo?: string;
  logoText?: string;
  links?: NavLink[];
  ctaText?: string;
  ctaLink?: string;
  ctaExternal?: boolean;
  theme?: "light" | "dark";
  className?: string;
  viewport?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  [key: string]: any;
}

export function Navbar({
  logo,
  logoText = "Brand",
  links = [],
  ctaText,
  ctaLink,
  ctaExternal = false,
  theme = "light",
  className,
  viewport = "desktop",
  isPreviewMode = false,
  width,
  height,
  backgroundColor,
  textColor,
  linkColor,
  linkHoverColor = "#6366f1",
  onNavigate,
  pages,
  ...rest
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const baseStyle = buildComponentStyle({ backgroundColor, textColor, width, height, ...rest });

  // Apply glass effect when no explicit background
  if (!backgroundColor) {
    if (theme === "dark") {
      baseStyle.backgroundColor = "rgba(15, 23, 42, 0.8)";
    } else {
      baseStyle.backgroundColor = "rgba(255, 255, 255, 0.8)";
    }
    baseStyle.backdropFilter = "blur(12px)";
    (baseStyle as any).WebkitBackdropFilter = "blur(12px)";
  }

  return (
    <div className="relative">
      <nav
        className={cn(
          "flex items-center w-full px-6 sm:px-8 py-4",
          "border-b",
          theme === "dark" ? "border-white/10" : "border-gray-200/60",
          !textColor && (theme === "dark" ? "text-white" : "text-gray-900"),
          className,
        )}
        style={baseStyle}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-7 sm:h-8 w-auto" />
          ) : (
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {logoText}
            </span>
          )}
        </div>

        {/* Navigation Links - Desktop */}
        {viewport === "desktop" && (
          <div className="flex items-center space-x-1 ml-auto mr-4">
            {links.map((link, index) => {
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (onNavigate && !link.external) {
                  let slug = link.href;

                  if (slug.startsWith("page:")) {
                    slug = slug.replace("page:", "");
                  } else {
                    slug = slug.replace(/^\//, "").replace(/\.html$/, "");
                  }

                  if (!slug || slug === "#") {
                    slug = link.text.toLowerCase().replace(/\s+/g, "-");
                    if (slug === "home") slug = "index";
                  }

                  onNavigate(slug);
                }
              };

              return (
                <a
                  key={index}
                  href={link.external ? link.href : "#"}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                    !linkColor && (theme === "dark" ? "text-white/70 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"),
                  )}
                  style={{
                    color: linkColor || undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (linkHoverColor) {
                      e.currentTarget.style.color = linkHoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = linkColor || "";
                  }}
                  onClick={handleClick}
                  {...(link.external && isPreviewMode && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.text}
                </a>
              );
            })}
          </div>
        )}

        {/* Desktop CTA & Mobile Menu Button */}
        <div className={cn("flex items-center space-x-3", viewport === "desktop" ? "" : "ml-auto")}>
          {ctaText && ctaLink && viewport === "desktop" && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              <Button
                asChild
                size="sm"
                className="text-sm font-medium rounded-full px-5 shadow-sm transition-all duration-300 hover:shadow-md"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#ffffff",
                  border: "none",
                }}
              >
                {ctaExternal && isPreviewMode ? (
                  <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                    {ctaText}
                  </a>
                ) : (
                  <Link
                    href={isPreviewMode ? ctaLink : "#"}
                    onClick={
                      isPreviewMode ? undefined : (e) => e.preventDefault()
                    }
                  >
                    {ctaText}
                  </Link>
                )}
              </Button>
            </div>
          )}

          {links.length > 0 && viewport !== "desktop" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && links.length > 0 && viewport !== "desktop" && (
        <div
          className="absolute top-full left-0 right-0 border-b shadow-xl z-50"
          style={{
            backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          }}
        >
          <div className="py-2 px-2">
            {links.map((link, index) => {
              const handleClick = (e: React.MouseEvent) => {
                closeMobileMenu();
                if (onNavigate && !link.external) {
                  e.preventDefault();

                  let slug = link.href;

                  if (slug.startsWith("page:")) {
                    slug = slug.replace("page:", "");
                  } else {
                    slug = slug.replace(/^\//, "").replace(/\.html$/, "");
                  }

                  if (!slug || slug === "#") {
                    slug = link.text.toLowerCase().replace(/\s+/g, "-");
                    if (slug === "home") slug = "index";
                  }

                  onNavigate(slug);
                }
              };

              return (
                <a
                  key={index}
                  href={link.external ? link.href : "#"}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    theme === "dark" ? "text-white/80 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50",
                  )}
                  onClick={handleClick}
                  {...(link.external && isPreviewMode && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.text}
                </a>
              );
            })}

            {ctaText && ctaLink && (
              <div
                className="px-4 py-3"
                style={isPreviewMode ? undefined : { pointerEvents: "none" }}
              >
                <Button
                  asChild
                  size="sm"
                  className="w-full text-sm rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  {ctaExternal && isPreviewMode ? (
                    <a
                      href={ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                    >
                      {ctaText}
                    </a>
                  ) : (
                    <Link
                      href={isPreviewMode ? ctaLink : "#"}
                      onClick={
                        isPreviewMode
                          ? closeMobileMenu
                          : (e) => e.preventDefault()
                      }
                    >
                      {ctaText}
                    </Link>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
