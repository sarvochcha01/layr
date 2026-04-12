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
  privacyLink?: string;
  termsLink?: string;
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
  logoText = "Obsidian Architect",
  description = "A high-end visual builder designed for teams who demand professional-grade precision and performance in their digital ecosystem.",
  sections = [
    {
      title: "PRODUCT",
      links: [
        { text: "Visual Editor", href: "#" },
        { text: "Layout Engine", href: "#" },
        { text: "Integrations", href: "#" },
        { text: "Templates", href: "#" },
        { text: "Pricing", href: "#" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { text: "About Us", href: "#" },
        { text: "Engineering", href: "#" },
        { text: "Design Ethos", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Contact", href: "#" },
      ],
    },
    {
      title: "RESOURCES",
      links: [
        { text: "Documentation", href: "#" },
        { text: "API Reference", href: "#" },
        { text: "Community", href: "#" },
        { text: "System Status", href: "#" },
        { text: "Security", href: "#" },
      ],
    },
  ],
  socialLinks = [
    { platform: "GitHub", href: "#", icon: "G" },
    { platform: "Twitter", href: "#", icon: "T" },
    { platform: "Discord", href: "#", icon: "D" },
  ],
  copyright,
  privacyLink = "#",
  termsLink = "#",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  className,
  width,
  height,
  children,
  ...rest
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${logoText}. All rights reserved.`;

  const baseStyle = buildComponentStyle({
    backgroundColor,
    textColor,
    width,
    height,
    ...rest,
  });

  return (
    <footer
      className={cn(
        "w-full py-16 px-6 sm:px-8 border-t border-[#2a2a2a]",
        className,
      )}
      style={baseStyle}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-5 lg:col-span-2">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {logoText}
                </span>
              )}
            </div>

            {description && (
              <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
                {description}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-3 pt-2">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:bg-[#2a2a2a] text-gray-400 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform}
                  >
                    {social.icon || social.platform.charAt(0)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {copyright || defaultCopyright}
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link
              href={privacyLink}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={termsLink}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              </span>
              <span>United States (English)</span>
            </div>
          </div>
        </div>
      </div>

      {children}
    </footer>
  );
}
