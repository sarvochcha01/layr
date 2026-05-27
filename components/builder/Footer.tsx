import { cn } from "@/lib/utils";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

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
  /** Layout variant — controls structure, not colors */
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
  backgroundType?: "solid" | "gradient" | "image";
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: string;
  gradientAngle?: string;
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
  themeStyle?: ThemeStyleVariant;
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
  backgroundColor,
  backgroundType,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientAngle,
  textColor,
  accentColor,
  newsletterTitle = "Stay in the loop",
  newsletterSubtitle = "Get product updates, design tips, and inspiration directly to your inbox.",
  className,
  width,
  height,
  isPreviewMode = false,
  onNavigate,
  pages,
  children,
  themeStyle,
  ...rest
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${logoText}. All rights reserved.`;

  const effectiveTheme = useEffectiveThemeStyle(themeStyle, themeStyle !== undefined);
  const cssVars = getThemeCSSVars(effectiveTheme);

  // Theme-aware accent — user override > theme accent
  const accent = accentColor || "var(--theme-accent)";

  // Root styles — inject CSS vars + bg/text
  const rootStyle: React.CSSProperties = {
    ...cssVars,
    ...(width ? { width } : {}),
    ...(height ? { minHeight: height } : {}),
  };

  // Handle background based on type - user preferences MUST override theme
  if (backgroundType === "gradient" && gradientStart && gradientEnd) {
    const direction = gradientDirection === "custom"
      ? `${gradientAngle || "135"}deg`
      : gradientDirection || "to bottom right";
    rootStyle.backgroundImage = `linear-gradient(${direction}, ${gradientStart}, ${gradientEnd})`;
  } else if (backgroundColor) {
    rootStyle.background = backgroundColor;
  } else {
    rootStyle.background = "var(--theme-bg)";
  }

  // Text color override
  if (textColor) {
    rootStyle.color = textColor;
  } else {
    rootStyle.color = "var(--theme-text)";
  }

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (!isPreviewMode) {
      e.preventDefault();
      return;
    }
    if (href.startsWith("page:") && onNavigate) {
      e.preventDefault();
      const parts = href.substring(5).split("?");
      const pageId = parts[0];
      const queryParams = parts[1] ? `?${parts[1]}` : "";
      const page = pages?.find((p: any) => p.id === pageId || p.slug === pageId);
      if (page) onNavigate(`${page.slug}${queryParams}`);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Shared helper atoms — all use var(--theme-*) for colors
  // ──────────────────────────────────────────────────────────────
  const SectionHeading = ({ title }: { title: string }) => (
    <h3
      className="text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{ color: "var(--theme-text-muted)" }}
    >
      {title}
    </h3>
  );

  const FooterLink = ({ link }: { link: FooterLink }) => (
    <a
      href={isPreviewMode ? link.href : "#"}
      onClick={(e) => handleLinkClick(e, link.href)}
      className="text-sm transition-colors duration-200"
      style={{ color: "var(--theme-text-muted)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
    >
      {link.text}
    </a>
  );

  const SocialButton = ({ social }: { social: SocialLink }) => (
    <a
      href={isPreviewMode ? social.href : "#"}
      onClick={(e) => handleLinkClick(e, social.href)}
      className="w-9 h-9 flex items-center justify-center text-xs transition-all duration-200"
      style={{
        background: "var(--theme-surface)",
        border: `var(--theme-border-width) solid var(--theme-border)`,
        borderRadius: "var(--theme-radius)",
        color: "var(--theme-text-muted)",
        boxShadow: "var(--theme-hard-shadow, none)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--theme-text)";
        e.currentTarget.style.background = "var(--theme-accent)";
        e.currentTarget.style.borderColor = "var(--theme-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--theme-text-muted)";
        e.currentTarget.style.background = "var(--theme-surface)";
        e.currentTarget.style.borderColor = "var(--theme-border)";
      }}
      title={social.platform}
    >
      {social.icon || social.platform.charAt(0)}
    </a>
  );

  const BottomBar = () => (
    <div
      className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{ borderTop: `1px solid var(--theme-divider)` }}
    >
      <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
        {copyright || defaultCopyright}
      </p>
      <div className="flex items-center gap-6 text-xs">
        <a
          href={isPreviewMode ? privacyLink : "#"}
          onClick={(e) => handleLinkClick(e, privacyLink)}
          className="transition-colors"
          style={{ color: "var(--theme-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
        >
          Privacy Policy
        </a>
        <a
          href={isPreviewMode ? termsLink : "#"}
          onClick={(e) => handleLinkClick(e, termsLink)}
          className="transition-colors"
          style={{ color: "var(--theme-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
        >
          Terms of Service
        </a>
      </div>
    </div>
  );

  const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClass = { sm: "text-base", md: "text-xl", lg: "text-3xl" }[size];
    const imgHeight = { sm: "h-6", md: "h-8", lg: "h-12" }[size];
    return logo ? (
      <img src={logo} alt="Logo" className={`${imgHeight} w-auto`} />
    ) : (
      <span
        className={`${sizeClass} tracking-tight block`}
        style={{
          fontWeight: "var(--theme-heading-weight)" as any,
          color: "var(--theme-text)",
        }}
      >
        {logoText}
      </span>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // LAYOUT VARIANTS — visual styling comes from CSS vars above
  // ──────────────────────────────────────────────────────────────

  // 1. STANDARD
  if (variant === "standard") {
    return (
      <footer
        className={cn("w-full py-16 px-6 sm:px-8", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="space-y-5 lg:col-span-2">
              <Logo size="md" />
              {description && (
                <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--theme-text-muted)" }}>
                  {description}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex space-x-2 pt-2">
                  {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
                </div>
              )}
            </div>
            {sections.map((section, i) => (
              <div key={i} className="space-y-4">
                <SectionHeading title={section.title} />
                <ul className="space-y-3">
                  {section.links.map((link, li) => (
                    <li key={li}><FooterLink link={link} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <BottomBar />
        </div>
        {children}
      </footer>
    );
  }

  // 2. CENTERED
  if (variant === "centered") {
    return (
      <footer
        className={cn("w-full py-16 px-6 sm:px-8", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-5">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            {description && (
              <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--theme-text-muted)" }}>
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {sections.map((section) =>
              section.links.map((link, li) => (
                <FooterLink key={`${section.title}-${li}`} link={link} />
              )),
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="flex justify-center space-x-2">
              {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
            </div>
          )}
          <BottomBar />
        </div>
        {children}
      </footer>
    );
  }

  // 3. MINIMAL
  if (variant === "minimal") {
    return (
      <footer
        className={cn("w-full py-8 px-6 sm:px-8", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex flex-wrap items-center justify-center gap-6">
              {sections.slice(0, 1).map((section) =>
                section.links.slice(0, 5).map((link, li) => (
                  <FooterLink key={li} link={link} />
                )),
              )}
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.slice(0, 3).map((s, i) => <SocialButton key={i} social={s} />)}
              <span className="text-xs pl-2" style={{ color: "var(--theme-text-muted)" }}>
                {copyright || defaultCopyright}
              </span>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // 4. BRAND-FOCUS
  if (variant === "brand-focus") {
    return (
      <footer
        className={cn("w-full py-20 px-6 sm:px-8", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            <div className="space-y-8">
              <Logo size="lg" />
              {description && (
                <p className="text-base leading-relaxed max-w-lg" style={{ color: "var(--theme-text-muted)" }}>
                  {description}
                </p>
              )}
              {socialLinks.length > 0 && (
                <div className="flex space-x-2 pt-2">
                  {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-10">
              {sections.map((section, i) => (
                <div key={i} className="space-y-4">
                  <SectionHeading title={section.title} />
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}><FooterLink link={link} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <BottomBar />
        </div>
        {children}
      </footer>
    );
  }

  // 5. MAGAZINE — editorial with large watermark text
  if (variant === "magazine") {
    return (
      <footer
        className={cn("w-full overflow-hidden", className)}
        style={rootStyle}
      >
        <div
          className="py-10 overflow-hidden"
          style={{ borderTop: `1px solid var(--theme-divider)` }}
        >
          <p
            className="text-[clamp(4rem,14vw,12rem)] font-black leading-none tracking-tighter uppercase whitespace-nowrap select-none"
            style={{ opacity: 0.04, letterSpacing: "-0.05em", color: "var(--theme-text)" }}
          >
            {logoText}
          </p>
        </div>

        <div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 py-12 px-6 sm:px-8"
          style={{ borderTop: `1px solid var(--theme-divider)` }}
        >
          <div
            className="md:pr-12 md:border-r pb-8 md:pb-0 space-y-4"
            style={{ borderColor: "var(--theme-divider)" }}
          >
            <Logo size="md" />
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>{description}</p>
          </div>

          <div
            className="md:px-12 md:border-r py-8 md:py-0"
            style={{ borderColor: "var(--theme-divider)" }}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {sections.flatMap((s) =>
                s.links.map((link, li) => (
                  <FooterLink key={`${s.title}-${li}`} link={link} />
                )),
              )}
            </div>
          </div>

          <div className="md:pl-12 pt-8 md:pt-0 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--theme-text-muted)" }}>
                Follow
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={isPreviewMode ? s.href : "#"}
                    onClick={(e) => handleLinkClick(e, s.href)}
                    className="px-3 py-1.5 text-xs transition-all"
                    style={{
                      border: `1px solid var(--theme-border)`,
                      color: "var(--theme-text-muted)",
                      borderRadius: "var(--theme-radius)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--theme-text)";
                      e.currentTarget.style.borderColor = "var(--theme-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--theme-text-muted)";
                      e.currentTarget.style.borderColor = "var(--theme-border)";
                    }}
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            </div>
            <div className="text-xs space-y-1" style={{ color: "var(--theme-text-muted)" }}>
              <p>{copyright || defaultCopyright}</p>
              <div className="flex gap-4">
                <a
                  href={isPreviewMode ? privacyLink : "#"}
                  onClick={(e) => handleLinkClick(e, privacyLink)}
                  className="transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
                >Privacy</a>
                <a
                  href={isPreviewMode ? termsLink : "#"}
                  onClick={(e) => handleLinkClick(e, termsLink)}
                  className="transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
                >Terms</a>
              </div>
            </div>
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // 6. BRUTALIST — thick borders, raw grid (themed via CSS vars)
  if (variant === "brutalist") {
    return (
      <footer
        className={cn("w-full", className)}
        style={{ ...rootStyle, borderTop: `var(--theme-border-width) solid var(--theme-border)` }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-2"
            style={{ borderBottom: `var(--theme-border-width) solid var(--theme-border)` }}
          >
            <div
              className="p-8"
              style={{ borderRight: `var(--theme-border-width) solid var(--theme-border)` }}
            >
              <Logo size="lg" />
              <p className="text-sm leading-relaxed max-w-xs mt-3" style={{ color: "var(--theme-text-muted)" }}>
                {description}
              </p>
            </div>
            <div className="p-8 flex flex-wrap gap-3 content-start">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={isPreviewMode ? s.href : "#"}
                  onClick={(e) => handleLinkClick(e, s.href)}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-150"
                  style={{
                    border: `var(--theme-border-width) solid var(--theme-border)`,
                    color: "var(--theme-text)",
                    background: "transparent",
                    boxShadow: "var(--theme-hard-shadow, none)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--theme-text)";
                    e.currentTarget.style.color = "var(--theme-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--theme-text)";
                  }}
                >
                  {s.platform}
                </a>
              ))}
            </div>
          </div>

          <div style={{ borderBottom: `var(--theme-border-width) solid var(--theme-border)` }}>
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {sections.map((section, i) => (
                <div
                  key={i}
                  className="p-8 space-y-4"
                  style={{ borderRight: i < sections.length - 1 ? `var(--theme-border-width) solid var(--theme-border)` : undefined }}
                >
                  <h3
                    className="text-[10px] font-black uppercase tracking-[0.3em]"
                    style={{ color: "var(--theme-text)" }}
                  >
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm font-medium transition-colors"
                          style={{ color: "var(--theme-text-muted)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--theme-text)";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--theme-text-muted)";
                            e.currentTarget.style.textDecoration = "none";
                          }}
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

          <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs font-mono" style={{ color: "var(--theme-text-muted)" }}>
              {copyright || defaultCopyright}
            </p>
            <div className="flex gap-6 text-xs font-mono">
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="hover:underline transition-colors"
                style={{ color: "var(--theme-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
              >
                PRIVACY
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="hover:underline transition-colors"
                style={{ color: "var(--theme-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
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

  // 7. GLASSMORPHIC
  if (variant === "glassmorphic") {
    return (
      <footer
        className={cn("w-full py-16 px-6 sm:px-8 relative overflow-hidden", className)}
        style={rootStyle}
      >
        {/* Background blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--theme-accent)", transform: "translateY(-50%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: "var(--theme-accent)", transform: "translateY(30%)" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className="p-8 sm:p-12 mb-8"
            style={{
              background: "var(--theme-surface)",
              backdropFilter: "var(--theme-backdrop)",
              border: `1px solid var(--theme-border)`,
              borderRadius: "var(--theme-radius)",
              boxShadow: "var(--theme-shadow)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              <div className="space-y-4 lg:col-span-1">
                <Logo size="md" />
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                  {description}
                </p>
                <div className="flex gap-2 pt-2">
                  {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
                </div>
              </div>

              {sections.map((section, i) => (
                <div key={i} className="space-y-3">
                  <SectionHeading title={section.title} />
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}><FooterLink link={link} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <BottomBar />
        </div>
        {children}
      </footer>
    );
  }

  // 8. SPLIT-DARK
  if (variant === "split-dark") {
    return (
      <footer
        className={cn("w-full", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        <div className="flex flex-col lg:flex-row min-h-[340px]">
          {/* Left panel */}
          <div
            className="lg:w-2/5 p-12 lg:p-16 flex flex-col justify-between flex-shrink-0"
            style={{ backgroundColor: "var(--theme-bg)" }}
          >
            <div className="space-y-5">
              <Logo size="md" />
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--theme-text-muted)" }}>
                {description}
              </p>
            </div>
            <div className="space-y-5 pt-10">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--theme-text-muted)" }}>
                  Follow
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
                {copyright || defaultCopyright}
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div
            className="flex-1 p-12 lg:p-16 flex flex-col justify-between"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderLeft: `1px solid var(--theme-divider)`,
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
              {sections.map((section, i) => (
                <div key={i} className="space-y-4">
                  <SectionHeading title={section.title} />
                  <ul className="space-y-2.5">
                    {section.links.map((link, li) => (
                      <li key={li}><FooterLink link={link} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div
              className="flex gap-6 pt-5 mt-10"
              style={{ borderTop: `1px solid var(--theme-divider)` }}
            >
              <a
                href={isPreviewMode ? privacyLink : "#"}
                onClick={(e) => handleLinkClick(e, privacyLink)}
                className="text-xs transition-colors"
                style={{ color: "var(--theme-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
              >
                Privacy Policy
              </a>
              <a
                href={isPreviewMode ? termsLink : "#"}
                onClick={(e) => handleLinkClick(e, termsLink)}
                className="text-xs transition-colors"
                style={{ color: "var(--theme-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
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

  // 9. STARTUP — accent stripe top
  if (variant === "startup") {
    return (
      <footer className={cn("w-full", className)} style={rootStyle}>
        {/* Accent top stripe */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, var(--theme-accent), transparent)` }}
        />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-5">
              <Logo size="md" />
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-text-muted)" }}>
                {description}
              </p>
              <div className="flex gap-2 pt-1">
                {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
              </div>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {sections.map((section, i) => (
                <div key={i} className="space-y-3">
                  <SectionHeading title={section.title} />
                  <ul className="space-y-2">
                    {section.links.map((link, li) => (
                      <li key={li}>
                        <a
                          href={isPreviewMode ? link.href : "#"}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                          style={{ color: "var(--theme-text-muted)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--theme-text)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--theme-text-muted)")}
                        >
                          <span
                            className="w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: "var(--theme-accent)" }}
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
          <div className="mt-12">
            <BottomBar />
          </div>
        </div>
        {children}
      </footer>
    );
  }

  // 10. NEWSLETTER — prominent email capture
  if (variant === "newsletter") {
    return (
      <footer
        className={cn("w-full", className)}
        style={{ ...rootStyle, borderTop: `1px solid var(--theme-border)` }}
      >
        {/* Newsletter hero band */}
        <div
          className="w-full py-14 px-6 sm:px-8"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 15%, transparent) 0%, transparent 60%)` }}
        >
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h3
              className="text-2xl sm:text-3xl tracking-tight"
              style={{ fontWeight: "var(--theme-heading-weight)" as any, color: "var(--theme-text)" }}
            >
              {newsletterTitle}
            </h3>
            <p className="text-sm" style={{ color: "var(--theme-text-muted)" }}>
              {newsletterSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--theme-input-bg)",
                  border: `var(--theme-border-width) solid var(--theme-border)`,
                  color: "var(--theme-text)",
                  borderRadius: "var(--theme-radius)",
                  boxShadow: "var(--theme-hard-shadow, none)",
                }}
              />
              <button
                type="button"
                className="px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{
                  background: "var(--theme-accent)",
                  color: "var(--theme-accent-fg)",
                  borderRadius: "var(--theme-radius)",
                  border: `var(--theme-border-width) solid var(--theme-border)`,
                  boxShadow: "var(--theme-hard-shadow, none)",
                }}
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs opacity-50" style={{ color: "var(--theme-text-muted)" }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Standard links below */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-3">
              <Logo size="sm" />
              <div className="flex gap-2 pt-1">
                {socialLinks.map((s, i) => <SocialButton key={i} social={s} />)}
              </div>
            </div>
            {sections.map((section, i) => (
              <div key={i} className="space-y-3">
                <SectionHeading title={section.title} />
                <ul className="space-y-2">
                  {section.links.map((link, li) => (
                    <li key={li}><FooterLink link={link} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <BottomBar />
        </div>
        {children}
      </footer>
    );
  }

  // Fallback
  return null;
}
