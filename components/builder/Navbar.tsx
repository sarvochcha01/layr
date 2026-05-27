"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

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
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
  textColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  themeStyle?: ThemeStyleVariant;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  currentPageSlug?: string;
  [key: string]: any;
}

export function Navbar({
  logo,
  logoText = "Obsidian Architect",
  links = [
    { text: "Dashboard", href: "#" },
    { text: "Marketplace", href: "#" },
    { text: "Documentation", href: "#" },
  ],
  ctaText = "Publish",
  ctaLink = "#",
  ctaExternal = false,
  theme = "dark",
  className,
  viewport = "desktop",
  isPreviewMode = false,
  width,
  height,
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  linkColor,
  linkHoverColor,
  themeStyle,
  onNavigate,
  pages,
  currentPageSlug,
  ...rest
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    ...cssVars,
    backdropFilter: scrolled ? "blur(12px)" : "none",
    position: scrolled ? "sticky" : undefined,
    top: scrolled ? 0 : undefined,
    zIndex: scrolled ? 50 : undefined,
    boxShadow: scrolled ? `0 1px 0 var(--theme-divider)` : "none",
    borderBottom: `var(--theme-border-width) solid var(--theme-border)`,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    transition: "all 300ms ease",
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    navStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
    if (scrolled) {
      navStyle.opacity = 0.95;
    }
  } else if (backgroundColor) {
    navStyle.background = scrolled ? `${backgroundColor}cc` : backgroundColor;
  } else {
    navStyle.background = scrolled ? "color-mix(in srgb, var(--theme-bg) 85%, transparent)" : "var(--theme-bg)";
  }

  // Text color override
  if (textColor) {
    navStyle.color = textColor;
  } else {
    navStyle.color = "var(--theme-text)";
  }

  return (
    <div className="relative">
      <nav
        className={cn(
          "flex items-center w-full px-6 sm:px-8 py-4",
          className,
        )}
        style={navStyle}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-default">
          {logo ? (
            <img src={logo} alt="Logo" className="h-7 sm:h-8 w-auto" />
          ) : (
            <span
              className="text-lg tracking-tight"
              style={{
                fontWeight: "var(--theme-heading-weight)" as any,
                color: textColor || "var(--theme-text)",
                fontFamily: "var(--theme-heading-font)",
              }}
            >
              {logoText}
            </span>
          )}
        </div>

        {/* Navigation Links — Desktop */}
        {viewport === "desktop" && links.length > 0 && (
          <div className="flex items-center space-x-1 ml-8">
            {links.map((link, index) => {
              // Determine if this link is active based on current page slug
              const getLinkSlug = (href: string, text: string) => {
                let slug = href;
                if (slug.startsWith("page:")) {
                  const parts = slug.substring(5).split("?");
                  const pageId = parts[0];
                  const queryParams = parts[1] ? `?${parts[1]}` : "";
                  const page = pages?.find((p: any) => p.id === pageId || p.slug === pageId);
                  if (page) return `${page.slug}${queryParams}`;
                }
                
                if (slug.startsWith("page:")) slug = slug.replace("page:", "");
                else slug = slug.replace(/^\//, "").replace(/\.html$/, "");
                if (!slug || slug === "#") {
                  slug = text.toLowerCase().replace(/\s+/g, "-");
                  if (slug === "home") slug = "index";
                }
                return slug;
              };

              const linkSlug = getLinkSlug(link.href, link.text);
              const baseLinkSlug = linkSlug.split("?")[0];
              const isActive = currentPageSlug === baseLinkSlug || 
                              (currentPageSlug === "index" && baseLinkSlug === "index") ||
                              (baseLinkSlug === "/" && currentPageSlug === "index");

              const handleClick = (e: React.MouseEvent) => {
                // In editor, use onNavigate callback
                if (onNavigate && !link.external) {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate(linkSlug);
                }
                // In exported project, Link component handles navigation
              };

              const linkContent = (
                <>
                  {link.text}
                  {/* Animated underline */}
                  <span
                    className="absolute bottom-0 left-0 h-0.5"
                    style={{
                      background: "var(--theme-accent)",
                      width: isActive ? "100%" : "0%",
                      transition: "width 250ms cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                  {!isActive && (
                    <span
                      className="absolute bottom-0 left-0 h-0.5 opacity-0 group-hover:opacity-100 group-hover:w-full"
                      style={{
                        background: "var(--theme-accent)",
                        width: "0%",
                        transition: "width 250ms cubic-bezier(0.4,0,0.2,1), opacity 250ms cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  )}
                </>
              );

              const linkStyles = {
                color: linkColor || (isActive ? "var(--theme-text)" : "var(--theme-text-muted)"),
              };

              const linkClassName = "px-4 py-2 text-sm font-medium relative group overflow-hidden transition-all duration-200";

              // External link
              if (link.external) {
                return (
                  <a
                    key={index}
                    href={link.href}
                    className={linkClassName}
                    style={linkStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = linkHoverColor || "var(--theme-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = linkColor || (isActive ? "var(--theme-text)" : "var(--theme-text-muted)");
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {linkContent}
                  </a>
                );
              }

              // Internal link - use Next.js Link in exported projects, callback in editor
              if (onNavigate) {
                // Editor mode - use callback
                return (
                  <a
                    key={index}
                    href="#"
                    className={linkClassName}
                    style={linkStyles}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = linkHoverColor || "var(--theme-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = linkColor || (isActive ? "var(--theme-text)" : "var(--theme-text-muted)");
                    }}
                    onClick={handleClick}
                  >
                    {linkContent}
                  </a>
                );
              }

              // Exported project - use Next.js Link
              return (
                <Link
                  key={index}
                  href={`/${linkSlug === "index" ? "" : linkSlug}`}
                  className={linkClassName}
                  style={linkStyles}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.color = linkHoverColor || "var(--theme-text)";
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.color = linkColor || (isActive ? "var(--theme-text)" : "var(--theme-text-muted)");
                  }}
                >
                  {linkContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side */}
        <div className={cn("flex items-center space-x-3", "ml-auto")}>
          {ctaText && ctaLink && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              {ctaExternal && isPreviewMode ? (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 h-9 text-xs font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "var(--theme-accent)",
                    color: "var(--theme-accent-fg)",
                    borderRadius: "var(--theme-radius)",
                    border: `var(--theme-border-width) solid var(--theme-border)`,
                    boxShadow: "var(--theme-hard-shadow, none)",
                  }}
                >
                  {ctaText}
                </a>
              ) : (
                <a
                  href={isPreviewMode && !ctaLink.startsWith("page:") ? ctaLink : "#"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isPreviewMode && onNavigate && ctaLink) {
                      if (ctaLink.startsWith("page:")) {
                        const parts = ctaLink.substring(5).split("?");
                        const pageId = parts[0];
                        const queryParams = parts[1] ? `?${parts[1]}` : "";
                        const page = pages?.find((p: any) => p.id === pageId || p.slug === pageId);
                        if (page) onNavigate(`${page.slug}${queryParams}`);
                      } else {
                        const slug = ctaLink.replace(/^\//, "");
                        onNavigate(slug);
                      }
                    }
                  }}
                  className="inline-flex items-center px-4 h-9 text-xs font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "var(--theme-accent)",
                    color: "var(--theme-accent-fg)",
                    borderRadius: "var(--theme-radius)",
                    border: `var(--theme-border-width) solid var(--theme-border)`,
                    boxShadow: "var(--theme-hard-shadow, none)",
                  }}
                >
                  {ctaText}
                </a>
              )}
            </div>
          )}

          {links.length > 0 && viewport !== "desktop" && (
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                color: "var(--theme-text-muted)",
                background: "transparent",
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        style={{
          display: "grid",
          gridTemplateRows:
            isMobileMenuOpen && links.length > 0 && viewport !== "desktop"
              ? "1fr"
              : "0fr",
          transition: "grid-template-rows 260ms cubic-bezier(0.4,0,0.2,1)",
          ...cssVars,
          backgroundColor: "var(--theme-surface)",
          borderBottom: `1px solid var(--theme-border)`,
        }}
        className="absolute top-full left-0 right-0 z-50 shadow-xl"
      >
        <div style={{ overflow: "hidden" }}>
          <div className="py-2 px-2">
            {links.map((link, index) => {
              // Determine if this link is active
              const getLinkSlug = (href: string, text: string) => {
                let slug = href;
                if (slug.startsWith("page:")) {
                  const parts = slug.substring(5).split("?");
                  const pageId = parts[0];
                  const queryParams = parts[1] ? `?${parts[1]}` : "";
                  const page = pages?.find((p: any) => p.id === pageId || p.slug === pageId);
                  if (page) return `${page.slug}${queryParams}`;
                }
                
                if (slug.startsWith("page:")) slug = slug.replace("page:", "");
                else slug = slug.replace(/^\//, "").replace(/\.html$/, "");
                if (!slug || slug === "#") {
                  slug = text.toLowerCase().replace(/\s+/g, "-");
                  if (slug === "home") slug = "index";
                }
                return slug;
              };

              const linkSlug = getLinkSlug(link.href, link.text);
              const baseLinkSlug = linkSlug.split("?")[0];
              const isActive = currentPageSlug === baseLinkSlug || 
                              (currentPageSlug === "index" && baseLinkSlug === "index") ||
                              (baseLinkSlug === "/" && currentPageSlug === "index");

              return (
                <a
                  key={index}
                  href={link.external ? link.href : "#"}
                  className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: isActive ? "var(--theme-text)" : "var(--theme-text-muted)",
                    backgroundColor: isActive ? "var(--theme-bg)" : "transparent",
                    borderRadius: "var(--theme-radius)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--theme-text)";
                    e.currentTarget.style.backgroundColor = "var(--theme-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? "var(--theme-text)" : "var(--theme-text-muted)";
                    e.currentTarget.style.backgroundColor = isActive ? "var(--theme-bg)" : "transparent";
                  }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate && !link.external) {
                      onNavigate(linkSlug);
                    }
                  }}
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
        </div>
      </div>
    </div>
  );
}
