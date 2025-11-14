import Link from "next/link";
import { cn } from "@/lib/utils";

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
}

export function Footer({
  logo,
  logoText = "Brand",
  description,
  sections = [],
  socialLinks = [],
  copyright,
  backgroundColor = "#1f2937",
  textColor = "#ffffff",
  className,
  width,
  height,
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${logoText}. All rights reserved.`;

  return (
    <footer
      className={cn("w-full py-8 sm:py-12 px-4 sm:px-8", className)}
      style={{
        backgroundColor,
        color: textColor,
        width: width || undefined,
        height: height || undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold">{logoText}</span>
              )}
            </div>

            {description && (
              <p className="text-sm opacity-80 leading-relaxed">
                {description}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon ? (
                      <span className="text-xl">{social.icon}</span>
                    ) : (
                      <span className="text-sm">{social.platform}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-80 hover:opacity-100 transition-opacity"
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
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-sm opacity-80">{copyright || defaultCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
