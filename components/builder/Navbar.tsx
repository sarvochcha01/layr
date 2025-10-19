import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  text: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  logoText?: string;
  links?: NavLink[];
  ctaText?: string;
  ctaLink?: string;
  theme?: "light" | "dark";
  className?: string;
}

export function Navbar({
  logo,
  logoText = "Brand",
  links = [],
  ctaText,
  ctaLink,
  theme = "light",
  className,
}: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between w-full",
        theme === "dark" ? "text-white" : "text-gray-900",
        className
      )}
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
      <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              "hover:opacity-75 transition-opacity text-sm lg:text-base",
              theme === "dark" ? "text-white" : "text-gray-700"
            )}
          >
            {link.text}
          </Link>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex items-center space-x-2">
        {ctaText && ctaLink && (
          <Button asChild size="sm" className="text-sm">
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        )}

        {/* Mobile Menu Button */}
        {links.length > 0 && (
          <Button variant="ghost" size="sm" className="lg:hidden p-2">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </nav>
  );
}
