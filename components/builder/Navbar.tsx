import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative">
      <nav
        className={cn(
          "flex items-center justify-between w-full",
          theme === "dark" ? "text-white" : "text-gray-900",
          className
        )}
        style={{
          width: width || undefined,
          height: height || undefined,
        }}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-6 sm:h-8 w-auto" />
          ) : (
            <span className="text-lg sm:text-xl font-bold">{logoText}</span>
          )}
        </div>

        {/* Navigation Links - Hidden on mobile */}
        {viewport === "desktop" && (
          <div className="flex items-center space-x-4 xl:space-x-8">
            {links.map((link, index) => {
              const linkProps = {
                href: isPreviewMode ? link.href : "#",
                className: cn(
                  "hover:opacity-75 transition-opacity text-sm lg:text-base",
                  theme === "dark" ? "text-white" : "text-gray-700"
                ),
                onClick: isPreviewMode
                  ? undefined
                  : (e: React.MouseEvent) => e.preventDefault(),
                ...(isPreviewMode &&
                  link.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }),
              };

              return link.external && isPreviewMode ? (
                <a key={index} {...linkProps}>
                  {link.text}
                </a>
              ) : (
                <Link key={index} {...linkProps}>
                  {link.text}
                </Link>
              );
            })}
          </div>
        )}

        {/* Desktop CTA & Mobile Menu Button */}
        <div className="flex items-center space-x-2">
          {/* Desktop CTA */}
          {ctaText && ctaLink && viewport === "desktop" && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              <Button asChild size="sm" className="text-sm">
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

          {/* Mobile Menu Button */}
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
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="py-2">
            {links.map((link, index) => {
              const linkProps = {
                href: isPreviewMode ? link.href : "#",
                className: cn(
                  "block px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                  theme === "dark" ? "text-gray-900" : "text-gray-700"
                ),
                onClick: isPreviewMode
                  ? closeMobileMenu
                  : (e: React.MouseEvent) => e.preventDefault(),
                ...(isPreviewMode &&
                  link.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }),
              };

              return link.external && isPreviewMode ? (
                <a key={index} {...linkProps}>
                  {link.text}
                </a>
              ) : (
                <Link key={index} {...linkProps}>
                  {link.text}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            {ctaText && ctaLink && (
              <div
                className="px-4 py-3"
                style={isPreviewMode ? undefined : { pointerEvents: "none" }}
              >
                <Button asChild size="sm" className="w-full text-sm">
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
