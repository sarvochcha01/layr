import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildComponentStyle } from "@/lib/buildStyle";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  href: string;
  icon?: string;
}

interface FooterProps {
  logo?: string;
  logoText?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: string;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  width?: string;
  height?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Footer({
  logo,
  logoText = "Brand",
  description = "Building the future of web design, one pixel at a time.",
  sections = [],
  socialLinks = [],
  copyright,
  backgroundColor,
  textColor,
  className,
  width,
  height,
  children,
  ...rest
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${logoText}. All rights reserved.`;

  const baseStyle = buildComponentStyle({
    backgroundColor: backgroundColor || "#0f172a",
    textColor: textColor || "#e2e8f0",
    width,
    height,
    ...rest,
  });

  return (
    <footer
      className={cn("w-full py-12 sm:py-16 px-6 sm:px-8", className)}
      style={baseStyle}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          {/* Brand Section */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#ffffff" }}
                >
                  {logoText}
                </span>
              )}
            </div>

            {description && (
              <p className="text-sm leading-relaxed opacity-60 max-w-xs">
                {description}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-3 pt-1">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon ? (
                      <span>{social.icon}</span>
                    ) : (
                      <span className="text-xs font-medium">{social.platform.charAt(0).toUpperCase()}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3
                className="text-xs font-semibold uppercase tracking-[0.15em]"
                style={{ color: "#ffffff" }}
              >
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          className="mt-12 pt-8 text-center"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
        >
          <p className="text-xs opacity-40 tracking-wide">
            {copyright || defaultCopyright}
          </p>
        </div>
      </div>

      {children}
    </footer>
  );
}
