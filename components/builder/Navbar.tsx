"use client";

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
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  linkColor,
  linkHoverColor,
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

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <div className="relative">
      <nav
        className={cn(
          "flex items-center w-full px-6 sm:px-8 py-4",
          "border-b border-[#2a2a2a]",
          className,
        )}
        style={baseStyle}
      >
        {/* Logo */}
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-7 sm:h-8 w-auto" />
          ) : (
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {logoText}
            </span>
          )}
        </div>

        {/* Navigation Links - Desktop */}
        {viewport === "desktop" && links.length > 0 && (
          <div className="flex items-center space-x-1 ml-8">
            {links.map((link, index) => {
              const isActive = index === 0; // First link active by default
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
                    "px-4 py-2 text-sm font-medium transition-colors duration-200 relative",
                    isActive ? "text-white" : "text-gray-400 hover:text-white",
                  )}
                  onClick={handleClick}
                  {...(link.external &&
                    isPreviewMode && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                >
                  {link.text}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* Right Side Actions */}
        <div
          className={cn(
            "flex items-center space-x-3",
            viewport === "desktop" ? "ml-auto" : "ml-auto",
          )}
        >
          {/* Additional Icons */}
          {viewport === "desktop" && (
            <>
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#2a2a2a]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Save Button */}
          {viewport === "desktop" && (
            <Button
              variant="outline"
              size="sm"
              className="px-4 h-9 text-xs font-medium border-[#2a2a2a] bg-transparent hover:bg-[#2a2a2a] text-white"
            >
              Save
            </Button>
          )}

          {/* CTA Button */}
          {ctaText && ctaLink && (
            <div style={isPreviewMode ? undefined : { pointerEvents: "none" }}>
              <Button
                asChild
                size="sm"
                className="px-4 h-9 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
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
        <div className="absolute top-full left-0 right-0 border-b border-[#2a2a2a] shadow-xl z-50 bg-[#1a1a1a]">
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
                  className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                  onClick={handleClick}
                  {...(link.external &&
                    isPreviewMode && {
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
      )}
    </div>
  );
}
