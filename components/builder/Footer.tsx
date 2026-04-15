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
  variant?:
    | "standard"
    | "centered"
    | "minimal"
    | "brand-focus"
    | "magazine"
    | "brutalist"
    | "glassmorphic"
    | "split-dark"
    | "startup"
    | "newsletter";
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
  accentColor?: string;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  className?: string;
  width?: string;
  height?: string;
  isPreviewMode?: boolean;
  onNavigate?: (slug: string) => void;
  pages?: any[];
  children?: React.ReactNode;
  [key: string]: any;
}

const DEFAULT_SECTIONS: FooterSection[] = [
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
];

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: "GitHub", href: "#", icon: "G" },
  { platform: "Twitter", href: "#", icon: "T" },
  { platform: "Discord", href: "#", icon: "D" },
];

export function Footer({
  variant = "standard",
  logo,
  logoText = "Obsidian Architect",
  description = "A high-end visual builder designed for teams who demand professional-grade precision and performance.",
  sections = DEFAULT_SECTIONS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  copyright,
  privacyLink = "#",
  termsLink = "#",
  backgroundColor = "#1a1a1a",
  textColor = "#ffffff",
  accentColor = "#6366f1",
  newsletterTitle = "Stay in the loop",
  newsletterSubtitle = "Get product updates, design tips, and inspiration directly to your inbox.",
  className,
  width,
  height,
  isPreviewMode = false,
  onNavigate,
  pages,
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

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (href.startsWith("page:") && onNavigate) {
      e.preventDefault();
      const pageId = href.substring(5);
      const page = pages?.find((p: any) => p.id === pageId);
      if (page) onNavigate(page.slug);
    }
  };

  // ─────────────────────────────────────────────
  // 1. STANDARD — Classic multi-column enterprise footer
  // ─────────────────────────────────────────────
  if (variant === "standard") {
    return (
      <footer
        className={cn(
          "w-full py-16 px-6 sm:px-8 border-t border-border",
          className,
        )}
        style={baseStyle}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center space-x-2">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold tracking-tight">
                    {logoText}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                  {description}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex space-x-3 pt-2">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={isPreviewMode ? social.href : "#"}
                      onClick={(e) => handleLinkClick(e, social.href)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground"
                      title={social.platform}
                    >
                      {social.icon || social.platform.charAt(0)}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {sections.map((section, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <a
                        href={isPreviewMode ? link.href : "#"}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {copyright || defaultCopyright}
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 2. CENTERED — Symmetric, all links horizontal
  // ─────────────────────────────────────────────
  if (variant === "centered") {
    return (
      <footer
        className={cn(
          "w-full py-16 px-6 sm:px-8 border-t border-border",
          className,
        )}
        style={baseStyle}
      >
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-5">
            <div className="flex items-center justify-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-bold tracking-tight">
                  {logoText}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {sections.map((section) =>
              section.links.map((link, li) => (
                <a
                  key={`${section.title}-${li}`}
                  href={isPreviewMode ? link.href : "#"}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.text}
                </a>
              )),
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="flex justify-center space-x-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={isPreviewMode ? social.href : "#"}
                  onClick={(e) => handleLinkClick(e, social.href)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  title={social.platform}
                >
                  {social.icon || social.platform.charAt(0)}
                </a>
              ))}
            </div>
          )}
          <div className="pt-8 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground">
              {copyright || defaultCopyright}
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 3. MINIMAL — Single bar, ultra clean
  // ─────────────────────────────────────────────
  if (variant === "minimal") {
    return (
      <footer
        className={cn(
          "w-full py-8 px-6 sm:px-8 border-t border-border",
          className,
        )}
        style={baseStyle}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-6 w-auto" />
              ) : (
                <span className="text-base font-bold tracking-tight">
                  {logoText}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {sections.slice(0, 1).map((section) =>
                section.links.slice(0, 5).map((link, li) => (
                  <a
                    key={li}
                    href={isPreviewMode ? link.href : "#"}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.text}
                  </a>
                )),
              )}
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.slice(0, 3).map((social, i) => (
                <a
                  key={i}
                  href={isPreviewMode ? social.href : "#"}
                  onClick={(e) => handleLinkClick(e, social.href)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  title={social.platform}
                >
                  {social.icon || social.platform.charAt(0)}
                </a>
              ))}
              <span className="text-xs text-muted-foreground pl-2">
                {copyright || defaultCopyright}
              </span>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 4. BRAND-FOCUS — Large logo left, tight links right
  // ─────────────────────────────────────────────
  if (variant === "brand-focus") {
    return (
      <footer
        className={cn(
          "w-full py-20 px-6 sm:px-8 border-t border-border",
          className,
        )}
        style={baseStyle}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            <div className="space-y-8">
              <div className="flex items-center space-x-2">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-12 w-auto" />
                ) : (
                  <span className="text-3xl font-bold tracking-tight">
                    {logoText}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-base leading-relaxed text-muted-foreground max-w-lg">
                  {description}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex space-x-3 pt-4">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={isPreviewMode ? social.href : "#"}
                      onClick={(e) => handleLinkClick(e, social.href)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-base hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-all duration-200"
                      title={social.platform}
                    >
                      {social.icon || social.platform.charAt(0)}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* Compact Links Grid - responsive to handle any number of sections */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
              {sections.map((section, i) => (
                <div key={i} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              {copyright || defaultCopyright}
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 5. MAGAZINE — Editorial style with big headline text and ruled lines
  // ─────────────────────────────────────────────
  if (variant === "magazine") {
    return (
      <footer
        className={cn(
          "w-full px-6 sm:px-8 pt-0 pb-0 overflow-hidden",
          className,
        )}
        style={baseStyle}
      >
        {/* Big brand headline */}
        <div
          className="border-t border-border py-10 overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <p
            className="text-[clamp(4rem,14vw,12rem)] font-black leading-none tracking-tighter uppercase whitespace-nowrap select-none"
            style={{ opacity: 0.06, letterSpacing: "-0.05em" }}
          >
            {logoText}
          </p>
        </div>

        <div
          className="border-t max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 py-12"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          {/* Left: brand + desc */}
          <div
            className="md:pr-12 md:border-r pb-8 md:pb-0 space-y-4"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            {logo ? (
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            ) : (
              <span className="text-lg font-bold tracking-tight block">
                {logoText}
              </span>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Center: links in 2 columns */}
          <div
            className="md:px-12 md:border-r py-8 md:py-0"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {sections.flatMap((s) =>
                s.links.map((link, li) => (
                  <a
                    key={`${s.title}-${li}`}
                    href={isPreviewMode ? link.href : "#"}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1 flex items-center gap-1 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                    {link.text}
                  </a>
                )),
              )}
            </div>
          </div>

          {/* Right: social + fine print */}
          <div className="md:pl-12 pt-8 md:pt-0 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Follow
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={isPreviewMode ? social.href : "#"}
                    onClick={(e) => handleLinkClick(e, social.href)}
                    className="px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-all rounded"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{copyright || defaultCopyright}</p>
              <div className="flex gap-4">
                <a
                  href={isPreviewMode ? privacyLink : "#"}
                  onClick={(e) => handleLinkClick(e, privacyLink)}
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href={isPreviewMode ? termsLink : "#"}
                  onClick={(e) => handleLinkClick(e, termsLink)}
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 6. BRUTALIST — Raw, high contrast, no-frills grid with thick borders
  // ─────────────────────────────────────────────
  if (variant === "brutalist") {
    return (
      <footer
        className={cn("w-full border-t-4 border-foreground", className)}
        style={baseStyle}
      >
        <div className="max-w-7xl mx-auto">
          {/* Top row: brand + tagline */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b-4 border-foreground">
            <div className="p-8 md:border-r-4 border-foreground">
              {logo ? (
                <img src={logo} alt="Logo" className="h-10 w-auto mb-3" />
              ) : (
                <span className="text-4xl font-black tracking-tighter uppercase block mb-3">
                  {logoText}
                </span>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {description}
              </p>
            </div>
            <div className="p-8 flex flex-wrap gap-3 content-start">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={isPreviewMode ? social.href : "#"}
                  onClick={(e) => handleLinkClick(e, social.href)}
                  className="border-2 border-foreground px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-150"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns - simple grid with divide utilities */}
          <div className="border-b-4 border-foreground">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 divide-x-4 divide-y-4 divide-foreground">
              {sections.map((section, i) => (
                <div key={i} className="p-8 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
                        >
                          — {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs font-mono">{copyright || defaultCopyright}</p>
            <div className="flex gap-6 text-xs font-mono">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:underline"
              >
                PRIVACY
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:underline"
              >
                TERMS
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 7. GLASSMORPHIC — Frosted glass panels, blurred backdrop
  // ─────────────────────────────────────────────
  if (variant === "glassmorphic") {
    return (
      <footer
        className={cn(
          "w-full py-16 px-6 sm:px-8 relative overflow-hidden",
          className,
        )}
        style={baseStyle}
      >
        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: accentColor, transform: "translateY(-50%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: accentColor, transform: "translateY(30%)" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Glass card */}
          <div
            className="rounded-2xl p-8 sm:p-12 mb-8"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="space-y-4 lg:col-span-1">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-8 w-auto" />
                ) : (
                  <span className="text-xl font-bold block">{logoText}</span>
                )}
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {description}
                </p>
                <div className="flex gap-2 pt-2">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={isPreviewMode ? social.href : "#"}
                      onClick={(e) => handleLinkClick(e, social.href)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                      title={social.platform}
                    >
                      {social.icon || social.platform.charAt(0)}
                    </a>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              {sections.map((section, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm transition-colors duration-200"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#fff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "rgba(255,255,255,0.55)")
                          }
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-2">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {copyright || defaultCopyright}
            </p>
            <div
              className="flex gap-5 text-xs"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
                className="transition-colors"
              >
                Privacy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
                className="transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 8. SPLIT-DARK — Two-tone split: dark left brand panel + lighter links panel
  // ─────────────────────────────────────────────
  if (variant === "split-dark") {
    return (
      <footer
        className={cn("w-full border-t border-border", className)}
        style={{ color: textColor }}
      >
        <div className="flex flex-col lg:flex-row min-h-[340px]">
          {/* Left dark brand panel */}
          <div
            className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-between flex-shrink-0"
            style={{ backgroundColor: "#111115" }}
          >
            <div className="space-y-5">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight block"
                  style={{ color: "#fff" }}
                >
                  {logoText}
                </span>
              )}
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {description}
              </p>
            </div>

            <div className="space-y-5 pt-10">
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest mb-3"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Follow
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={isPreviewMode ? social.href : "#"}
                      onClick={(e) => handleLinkClick(e, social.href)}
                      className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-xs transition-all duration-200"
                      style={{
                        border: "0.5px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      }}
                      title={social.platform}
                    >
                      {social.icon || social.platform.charAt(0)}
                    </a>
                  ))}
                </div>
              </div>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {copyright || defaultCopyright}
              </p>
            </div>
          </div>

          {/* Right slightly lighter links panel */}
          <div
            className="flex-1 p-12 lg:p-16 flex flex-col justify-between"
            style={{
              backgroundColor: "#17171c",
              borderLeft: "0.5px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
              {sections.map((section, i) => (
                <div key={i} className="space-y-4">
                  <h3
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {section.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm transition-colors duration-200"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#fff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "rgba(255,255,255,0.55)")
                          }
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="flex gap-6 pt-5 mt-10"
              style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
            >
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
              >
                Privacy Policy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 9. STARTUP — Accent stripe top, logo large, clean grid, colored CTA strip
  // ─────────────────────────────────────────────
  if (variant === "startup") {
    return (
      <footer className={cn("w-full", className)} style={baseStyle}>
        {/* Accent top stripe */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88, transparent)`,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand col: 4/12 */}
            <div className="lg:col-span-4 space-y-5">
              {logo ? (
                <img src={logo} alt="Logo" className="h-10 w-auto" />
              ) : (
                <span className="text-2xl font-bold tracking-tight block">
                  {logoText}
                </span>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
              <div className="flex gap-2 pt-1">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={isPreviewMode ? social.href : "#"}
                    onClick={(e) => handleLinkClick(e, social.href)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    title={social.platform}
                  >
                    {social.icon || social.platform.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {/* Link cols: 8/12 */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {sections.map((section, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5 group"
                        >
                          <span
                            className="w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: accentColor }}
                          />
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {copyright || defaultCopyright}
            </p>
            <div className="flex gap-5 text-xs text-muted-foreground">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // ─────────────────────────────────────────────
  // 10. NEWSLETTER — Prominent email capture, links secondary
  // ─────────────────────────────────────────────
  if (variant === "newsletter") {
    return (
      <footer
        className={cn("w-full border-t border-border", className)}
        style={baseStyle}
      >
        {/* Newsletter hero band */}
        <div
          className="w-full py-14 px-6 sm:px-8"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22 0%, transparent 60%)`,
          }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {newsletterTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {newsletterSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-all"
                style={{ "--tw-ring-color": accentColor } as any}
              />
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ background: accentColor }}
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-muted-foreground opacity-50">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Standard links section below */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand col */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-3">
              {logo ? (
                <img src={logo} alt="Logo" className="h-7 w-auto" />
              ) : (
                <span className="text-base font-bold block">{logoText}</span>
              )}
              <div className="flex gap-2 pt-1">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={isPreviewMode ? social.href : "#"}
                    onClick={(e) => handleLinkClick(e, social.href)}
                    className="w-8 h-8 rounded flex items-center justify-center text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                    title={social.platform}
                  >
                    {social.icon || social.platform.charAt(0)}
                  </a>
                ))}
              </div>
            </div>

            {sections.map((section, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <a
                        href={isPreviewMode ? link.href : "#"}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {copyright || defaultCopyright}
            </p>
            <div className="flex gap-5 text-xs text-muted-foreground">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  return null;
}
