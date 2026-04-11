import { ComponentDefinition } from "@/types/editor";

/**
 * Collect all unique component types used in a tree of ComponentDefinitions.
 */
function collectUsedTypes(components: ComponentDefinition[]): Set<string> {
    const types = new Set<string>();
    const walk = (comps: ComponentDefinition[]) => {
        for (const comp of comps) {
            types.add(comp.type);
            if (comp.children && comp.children.length > 0) {
                walk(comp.children);
            }
        }
    };
    walk(components);
    return types;
}

export function generateReactComponent(components: ComponentDefinition[], pageName: string = "Page"): string {
    const renderComponent = (component: ComponentDefinition, indent: number = 2): string => {
        const { type, props, children } = component;
        const indentStr = " ".repeat(indent);

        // Convert props to JSX attributes
        const propsStr = Object.entries(props)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === "string") {
                    return `${key}="${value}"`;
                } else if (typeof value === "boolean") {
                    return value ? key : "";
                } else if (typeof value === "object") {
                    return `${key}={${JSON.stringify(value)}}`;
                } else {
                    return `${key}={${value}}`;
                }
            })
            .filter(Boolean)
            .join(" ");

        const hasChildren = children && children.length > 0;
        const componentTag = `<${type}${propsStr ? " " + propsStr : ""}`;

        if (!hasChildren) {
            return `${indentStr}${componentTag} />`;
        }

        const childrenStr = children
            .map((child) => renderComponent(child, indent + 2))
            .join("\n");

        return `${indentStr}${componentTag}>\n${childrenStr}\n${indentStr}</${type}>`;
    };

    // Only import the types actually used in this page
    const usedTypes = collectUsedTypes(components);
    const importNames = Array.from(usedTypes).sort();

    const importBlock = importNames.length > 0
        ? `import {\n${importNames.map(n => `  ${n},`).join("\n")}\n} from '../components';\n`
        : "";

    const componentsStr = components
        .map((comp) => renderComponent(comp, 4))
        .join("\n");

    return `import React from 'react';
${importBlock}
export default function ${pageName}() {
  return (
    <div className="page-container">
${componentsStr}
    </div>
  );
}
`;
}

export function generateReactComponentsIndex(): string {
    return `// Export all components
export { Header } from './Header';
export { Footer } from './Footer';
export { Hero } from './Hero';
export { Section } from './Section';
export { Container } from './Container';
export { Grid } from './Grid';
export { Card } from './Card';
export { Button } from './Button';
export { Text } from './Text';
export { Image } from './Image';
export { Video } from './Video';
export { Form } from './Form';
export { Navbar } from './Navbar';
export { Accordion } from './Accordion';
export { Tabs } from './Tabs';
export { Testimonial } from './Testimonial';
export { PricingCard } from './PricingCard';
export { Feature } from './Feature';
export { Stats } from './Stats';
export { CTA } from './CTA';
export { Divider } from './Divider';
export { Spacer } from './Spacer';
export { Badge } from './Badge';
export { Alert } from './Alert';
`;
}

/**
 * Generate individual React component files.
 * Returns a map of filename (e.g. "Header.tsx") to file content.
 */
export function generateComponentFiles(): Record<string, string> {
    const files: Record<string, string> = {};

    files["Header.tsx"] = `import React from 'react';

interface HeaderProps {
  sticky?: boolean;
  shadow?: boolean;
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

export function Header({ sticky, shadow, backgroundColor, textColor, children }: HeaderProps) {
  return (
    <header
      className={\`w-full bg-white border-b \${sticky ? 'sticky top-0 z-50' : ''} \${shadow ? 'shadow-md' : ''}\`}
      style={{ backgroundColor, color: textColor }}
    >
      {children}
    </header>
  );
}
`;

    files["Navbar.tsx"] = `import React from 'react';

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarProps {
  logoText?: string;
  brandText?: string;
  links?: NavbarLink[];
  linkColor?: string;
  linkHoverColor?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Navbar({
  logoText,
  brandText,
  links = [],
  linkColor = '#6b7280',
  linkHoverColor = '#1f2937',
  ctaText,
  ctaLink,
  backgroundColor,
  textColor,
}: NavbarProps) {
  const displayLogo = logoText || brandText || 'Brand';

  return (
    <nav className="w-full flex items-center px-8 py-4" style={{ backgroundColor, color: textColor }}>
      <div className="text-xl font-bold">{displayLogo}</div>
      <div className="flex items-center space-x-8 ml-auto">
        {links.map((link, i) => (
          <a key={i} href={link.href} className="hover:opacity-75 transition-opacity" style={{ color: linkColor }}>
            {link.text}
          </a>
        ))}
      </div>
      {ctaText && ctaLink && (
        <a href={ctaLink} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors ml-4">
          {ctaText}
        </a>
      )}
    </nav>
  );
}
`;

    files["Hero.tsx"] = `import React from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Hero({
  title = 'Welcome to Our Website',
  subtitle,
  description = 'Build amazing websites with our powerful tools',
  size = 'lg',
  alignment = 'center',
  primaryButtonText = 'Get Started',
  primaryButtonLink = '#',
  secondaryButtonText,
  secondaryButtonLink = '#',
  backgroundImage,
  backgroundColor = '#f8f9fa',
  textColor = '#1f2937',
}: HeroProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'py-12 sm:py-16 px-4',
    md: 'py-16 sm:py-24 px-4 sm:px-6',
    lg: 'py-20 sm:py-32 px-4 sm:px-8',
    xl: 'py-24 sm:py-40 px-4 sm:px-12',
  };
  const alignClasses: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <section
      className={\`relative flex items-center justify-center min-h-[500px] w-full \${sizeClasses[size] || sizeClasses.lg} \${alignClasses[alignment] || alignClasses.center}\`}
      style={{ backgroundColor, color: textColor }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black bg-opacity-40" />}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {subtitle && <p className="text-xs sm:text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4 opacity-80">{subtitle}</p>}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">{title}</h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <a href={primaryButtonLink} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto">
            {primaryButtonText}
          </a>
          {secondaryButtonText && (
            <a href={secondaryButtonLink} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-8 border-2 border-gray-300 hover:bg-gray-100 w-full sm:w-auto">
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
`;

    files["Section.tsx"] = `import React from 'react';

interface SectionProps {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

export function Section({ padding = 'lg', maxWidth = 'xl', backgroundColor, textColor, children }: SectionProps) {
  const paddingMap: Record<string, string> = { none: '', sm: 'py-8 px-4', md: 'py-16 px-6', lg: 'py-24 px-8', xl: 'py-32 px-12' };
  const maxWidthMap: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-4xl', xl: 'max-w-6xl', '2xl': 'max-w-7xl', full: 'max-w-full' };

  return (
    <section className={\`w-full \${paddingMap[padding] || paddingMap.lg}\`} style={{ backgroundColor, color: textColor }}>
      <div className={\`\${maxWidthMap[maxWidth] || maxWidthMap.xl} mx-auto\`}>
        {children}
      </div>
    </section>
  );
}
`;

    files["Container.tsx"] = `import React from 'react';

interface ContainerProps {
  display?: 'block' | 'flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

export function Container({
  display = 'block',
  flexDirection = 'column',
  flexWrap = 'nowrap',
  justifyContent = 'start',
  alignItems = 'start',
  gap = 'none',
  maxWidth = 'xl',
  padding = 'md',
  backgroundColor,
  textColor,
  children,
}: ContainerProps) {
  const maxWidthMap: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl', '6xl': 'max-w-6xl', '7xl': 'max-w-7xl', full: 'max-w-full' };
  const paddingMap: Record<string, string> = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8', xl: 'p-12' };
  const flexDirMap: Record<string, string> = { row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' };
  const wrapMap: Record<string, string> = { nowrap: 'flex-nowrap', wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse' };
  const justifyMap: Record<string, string> = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' };
  const alignMap: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
  const gapMap: Record<string, string> = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };

  const isFlex = display === 'flex';
  const classes = [
    !isFlex && (maxWidthMap[maxWidth] || maxWidthMap.xl),
    paddingMap[padding] || paddingMap.md,
    !isFlex && 'mx-auto',
    isFlex && 'flex',
    isFlex && (flexDirMap[flexDirection] || flexDirMap.row),
    isFlex && (wrapMap[flexWrap] || wrapMap.nowrap),
    isFlex && (justifyMap[justifyContent] || justifyMap.start),
    isFlex && (alignMap[alignItems] || alignMap.start),
    isFlex && (gapMap[gap] || ''),
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ backgroundColor, color: textColor }}>
      {children}
    </div>
  );
}
`;

    files["Grid.tsx"] = `import React from 'react';

interface GridProps {
  columns?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  backgroundColor?: string;
  textColor?: string;
  children?: React.ReactNode;
}

export function Grid({ columns = 3, gap = 'md', responsive = true, backgroundColor, textColor, children }: GridProps) {
  const responsiveMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };
  const gapMap: Record<string, string> = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' };
  const gridCols = responsive ? (responsiveMap[columns] || responsiveMap[3]) : \`grid-cols-\${columns}\`;

  return (
    <div className={\`grid \${gridCols} \${gapMap[gap] || gapMap.md}\`} style={{ backgroundColor, color: textColor }}>
      {children}
    </div>
  );
}
`;

    files["Card.tsx"] = `import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  variant?: 'bordered' | 'shadow' | 'elevated';
  backgroundColor?: string;
  textColor?: string;
}

export function Card({ title = 'Card Title', description = 'Card description', image, buttonText, variant, backgroundColor, textColor }: CardProps) {
  const variantClass = variant === 'bordered' ? 'border' : variant === 'shadow' ? 'shadow-md' : variant === 'elevated' ? 'shadow-lg' : '';

  return (
    <div className={\`bg-white rounded-lg overflow-hidden \${variantClass}\`} style={{ backgroundColor, color: textColor }}>
      {image && <img src={image} alt={title} className="w-full h-48 object-cover" />}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {buttonText && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
`;

    files["Button.tsx"] = `import React from 'react';

interface ButtonProps {
  text?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  href?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Button({
  text = 'Button',
  variant = 'default',
  size = 'default',
  fullWidth,
  disabled,
  href,
  backgroundColor,
  textColor,
}: ButtonProps) {
  const variantClasses: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-gray-300 hover:bg-gray-100',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: 'hover:bg-gray-100',
    link: 'text-blue-600 underline hover:no-underline',
  };
  const sizeClasses: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', default: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };

  const className = \`\${variantClasses[variant] || variantClasses.default} \${sizeClasses[size] || sizeClasses.default} \${fullWidth ? 'w-full' : ''} rounded-md font-medium transition-colors\`;

  const btn = (
    <button className={className} disabled={disabled} style={{ backgroundColor, color: textColor }}>
      {text}
    </button>
  );

  return href && !disabled ? <a href={href}>{btn}</a> : btn;
}
`;

    files["Text.tsx"] = `import React from 'react';

interface TextProps {
  content?: string;
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  backgroundColor?: string;
  textColor?: string;
}

export function Text({ content = 'Text content', tag: Tag = 'p', size = 'base', backgroundColor, textColor }: TextProps) {
  const sizeMap: Record<string, string> = { xs: 'text-xs', sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl' };

  return <Tag className={sizeMap[size] || sizeMap.base} style={{ backgroundColor, color: textColor }}>{content}</Tag>;
}
`;

    files["Image.tsx"] = `import React from 'react';

interface ImageProps {
  src?: string;
  alt?: string;
  rounded?: string;
  width?: string;
  height?: string;
}

export function Image({ src = '', alt = '', rounded = 'md', width, height }: ImageProps) {
  return <img src={src} alt={alt} className={\`w-full h-auto rounded-\${rounded}\`} style={{ width, height }} />;
}
`;

    files["Video.tsx"] = `import React from 'react';

interface VideoProps {
  src?: string;
  youtubeId?: string;
  title?: string;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function Video({ src, youtubeId, title = 'Video', controls = true, autoplay, muted, loop, backgroundColor, textColor }: VideoProps) {
  if (youtubeId) {
    return (
      <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden" style={{ backgroundColor, color: textColor }}>
        <iframe src={\`https://www.youtube.com/embed/\${youtubeId}\`} title={title} className="absolute top-0 left-0 w-full h-full" allowFullScreen />
      </div>
    );
  }

  if (src) {
    return <video src={src} controls={controls} autoPlay={autoplay} muted={muted} loop={loop} className="w-full h-auto rounded-lg" style={{ backgroundColor, color: textColor }} />;
  }

  return null;
}
`;

    files["Footer.tsx"] = `import React from 'react';

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
}

export function Footer({
  logo,
  logoText = 'Brand',
  description,
  sections = [],
  socialLinks = [],
  copyright,
  backgroundColor = '#1f2937',
  textColor = '#ffffff',
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = \`© \${currentYear} \${logoText}. All rights reserved.\`;

  return (
    <footer className="w-full py-8 sm:py-12 px-4 sm:px-8" style={{ backgroundColor, color: textColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-4">
            {logo ? <img src={logo} alt="Logo" className="h-8 w-auto" /> : <span className="text-xl font-bold">{logoText}</span>}
            {description && <p className="text-sm opacity-80 leading-relaxed">{description}</p>}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, i) => (
                  <a key={i} href={social.href} className="opacity-80 hover:opacity-100 transition-opacity" target="_blank" rel="noopener noreferrer">
                    {social.icon || social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
          {sections.map((section, i) => (
            <div key={i} className="space-y-4">
              <h3 className="font-semibold text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}><a href={link.href} className="text-sm opacity-80 hover:opacity-100 transition-opacity">{link.text}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-sm opacity-80">{copyright || defaultCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
`;

    files["Form.tsx"] = `import React from 'react';

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

interface FormProps {
  title?: string;
  description?: string;
  fields?: FormField[];
  action?: string;
  method?: string;
  submitText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Form({
  title,
  description,
  fields = [],
  action = '#',
  method = 'POST',
  submitText = 'Submit',
  backgroundColor,
  textColor,
}: FormProps) {
  return (
    <div className="max-w-md mx-auto" style={{ backgroundColor, color: textColor }}>
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      <form action={action} method={method} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block font-medium text-sm">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea id={field.id} name={field.id} placeholder={field.placeholder || ''} required={field.required} className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            ) : (
              <input type={field.type} id={field.id} name={field.id} placeholder={field.placeholder || ''} required={field.required} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>
        ))}
        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
          {submitText}
        </button>
      </form>
    </div>
  );
}
`;

    files["Accordion.tsx"] = `'use client';
import React, { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items?: AccordionItem[];
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export function Accordion({ items = [], backgroundColor = '#ffffff', textColor, borderColor = '#e5e7eb' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full space-y-2" style={{ color: textColor }}>
      {items.map((item, idx) => (
        <div key={idx} className="w-full border rounded-lg overflow-hidden" style={{ backgroundColor, borderColor }}>
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full px-4 py-3 font-medium hover:bg-gray-50 flex items-center justify-between text-left"
            style={{ color: textColor }}
          >
            <span>{item.title}</span>
            <svg className={\`w-5 h-5 transition-transform \${openIndex === idx ? 'rotate-180' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === idx && (
            <div className="px-4 py-3 border-t" style={{ borderColor, color: textColor }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
`;

    files["Tabs.tsx"] = `'use client';
import React, { useState } from 'react';

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs?: Tab[];
  backgroundColor?: string;
  textColor?: string;
}

export function Tabs({ tabs = [], backgroundColor, textColor }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="tabs-container" style={{ backgroundColor, color: textColor }}>
      <div className="flex border-b">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={\`px-4 py-2 font-medium \${idx === activeIndex ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}\`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, idx) => (
        <div key={idx} className={\`p-4 \${idx !== activeIndex ? 'hidden' : ''}\`}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
`;

    files["Testimonial.tsx"] = `import React from 'react';

interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  variant?: 'card' | 'featured';
  backgroundColor?: string;
  textColor?: string;
}

export function Testimonial({
  quote = '',
  author = '',
  role = '',
  company,
  avatar,
  rating = 5,
  variant = 'card',
  backgroundColor,
  textColor,
}: TestimonialProps) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const cls = \`p-6 rounded-lg \${variant === 'card' ? 'bg-white shadow-md' : ''} \${variant === 'featured' ? 'bg-white shadow-lg border-l-4 border-blue-500' : ''}\`;

  return (
    <div className={cls} style={{ backgroundColor, color: textColor }}>
      <div className="text-yellow-400 text-xl mb-3">{stars}</div>
      <p className="text-lg mb-4 italic">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-3">
        {avatar && <img src={avatar} alt={author} className="w-12 h-12 rounded-full" />}
        <div>
          <div className="font-semibold">{author}</div>
          <div className="text-sm opacity-75">{role}{company ? \` at \${company}\` : ''}</div>
        </div>
      </div>
    </div>
  );
}
`;

    files["PricingCard.tsx"] = `import React from 'react';

interface PricingCardProps {
  title?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: string[];
  buttonText?: string;
  featured?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function PricingCard({
  title = '',
  price = '',
  period = '',
  description = '',
  features = [],
  buttonText = 'Get Started',
  featured,
  backgroundColor,
  textColor,
}: PricingCardProps) {
  return (
    <div
      className={\`p-8 rounded-lg border-2 flex flex-col \${featured ? 'border-blue-500 shadow-xl' : 'border-gray-200 shadow-md'}\`}
      style={{ width: 320, minWidth: 280, maxWidth: 400, backgroundColor, color: textColor }}
    >
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-600">{period}</span>
        </div>
        <p className="text-sm opacity-75">{description}</p>
      </div>
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <button className={\`w-full \${featured ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} px-6 py-3 rounded-md font-medium transition-colors\`}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
`;

    files["Feature.tsx"] = `import React from 'react';

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Feature({ icon = '✨', title = '', description = '', backgroundColor, textColor }: FeatureProps) {
  return (
    <div className="p-6 rounded-lg text-center" style={{ backgroundColor, color: textColor }}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="opacity-75">{description}</p>
    </div>
  );
}
`;

    files["Stats.tsx"] = `import React from 'react';

interface Stat {
  value: string;
  label: string;
}

interface StatsProps {
  stats?: Stat[];
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Stats({ stats = [], accentColor = '#3b82f6', backgroundColor, textColor }: StatsProps) {
  return (
    <div className="flex justify-around items-center flex-wrap gap-8 p-8" style={{ backgroundColor, color: textColor }}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-4xl font-bold mb-2" style={{ color: accentColor }}>{stat.value}</div>
          <div className="text-sm opacity-75 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
`;

    files["CTA.tsx"] = `import React from 'react';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function CTA({ title = '', description = '', buttonText = 'Get Started', buttonLink = '#', backgroundColor, textColor }: CTAProps) {
  return (
    <div className="text-center py-16 px-8" style={{ backgroundColor, color: textColor }}>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-lg mb-8 opacity-90">{description}</p>
      <a href={buttonLink} className="inline-block bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
        {buttonText}
      </a>
    </div>
  );
}
`;

    files["Divider.tsx"] = `import React from 'react';

interface DividerProps {
  thickness?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
}

export function Divider({ thickness = '1', style: borderStyle, color = '#e5e7eb' }: DividerProps) {
  const styleClass = borderStyle === 'dashed' ? 'border-dashed' : borderStyle === 'dotted' ? 'border-dotted' : '';
  return <hr className={\`border-t-\${thickness} \${styleClass}\`} style={{ borderColor: color }} />;
}
`;

    files["Spacer.tsx"] = `import React from 'react';

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Spacer({ size = 'md' }: SpacerProps) {
  const sizeMap: Record<string, string> = { xs: '8px', sm: '16px', md: '32px', lg: '64px', xl: '128px' };
  return <div style={{ height: sizeMap[size] || sizeMap.md }} />;
}
`;

    files["Badge.tsx"] = `import React from 'react';

interface BadgeProps {
  text?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  backgroundColor?: string;
  textColor?: string;
}

export function Badge({ text = '', variant = 'default', backgroundColor, textColor }: BadgeProps) {
  const variantColors: Record<string, string> = {
    default: 'bg-gray-200 text-gray-900',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={\`inline-block px-3 py-1 rounded-full text-sm font-medium \${variantColors[variant] || variantColors.default}\`} style={{ backgroundColor, color: textColor }}>
      {text}
    </span>
  );
}
`;

    files["Alert.tsx"] = `import React from 'react';

interface AlertProps {
  title?: string;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export function Alert({ title = '', message = '', variant = 'info', dismissible, backgroundColor, textColor }: AlertProps) {
  const variants: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'ℹ️' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: '✓' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: '⚠️' },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: '✕' },
  };
  const s = variants[variant] || variants.info;

  return (
    <div className={\`p-4 rounded-lg border \${s.bg} \${s.border} \${s.text}\`} style={{ backgroundColor, color: textColor }}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{s.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && <button className="text-xl hover:opacity-75">×</button>}
      </div>
    </div>
  );
}
`;

    return files;
}

export function generatePackageJson(projectName: string): string {
    return JSON.stringify(
        {
            name: projectName.toLowerCase().replace(/\s+/g, "-"),
            version: "1.0.0",
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint",
            },
            dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0",
                next: "^14.0.0",
            },
            devDependencies: {
                "@types/node": "^20.0.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                typescript: "^5.0.0",
                tailwindcss: "^3.3.0",
                postcss: "^8.4.0",
                autoprefixer: "^10.4.0",
            },
        },
        null,
        2
    );
}

export function generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
}

export function generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

export function generateREADME(projectName: string): string {
    return `# ${projectName}

This is a Next.js project generated from your website builder.

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- \`/pages\` - Next.js pages
- \`/components\` - React components
- \`/public\` - Static assets

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
`;
}
