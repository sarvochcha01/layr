import { ComponentDefinition } from "@/types/editor";
0
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

  const componentsStr = components
    .map((comp) => renderComponent(comp, 4))
    .join("\n");

  return `import {
  Header,
  Footer,
  Hero,
  Section,
  Container,
  Grid,
  Card,
  Button,
  Text,
  Image,
  Video,
  Form,
  Navbar,
  Accordion,
  Tabs,
  Testimonial,
  PricingCard,
  Feature,
  Stats,
  CTA,
  Divider,
  Spacer,
  Badge,
  Alert,
} from '@/components';

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
export { CustomCode } from './CustomCode';
`;
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
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        next: "^15.1.6",
        clsx: "^2.1.1",
        "tailwind-merge": "^2.5.5",
        "lucide-react": "^0.468.0",
        "@radix-ui/react-slot": "^1.1.1",
        "@radix-ui/react-label": "^2.1.7",
        "@radix-ui/react-dialog": "^1.1.15",
        "@radix-ui/react-dropdown-menu": "^2.1.16",
        "@radix-ui/react-switch": "^1.2.6",
        "@radix-ui/react-accordion": "^1.2.3",
        "@radix-ui/react-tabs": "^1.1.3",
        "class-variance-authority": "^0.7.1",
        "sonner": "^2.0.7",
      },
      devDependencies: {
        "@types/node": "^22.10.5",
        "@types/react": "^19.0.6",
        "@types/react-dom": "^19.0.2",
        typescript: "^5.7.3",
        tailwindcss: "^3.4.17",
        postcss: "^8.4.49",
        autoprefixer: "^10.4.20",
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
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
`;
}

export function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
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

export function generateAppLayout(projectName: string): string {
  return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'A website built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
`;
}

export function generateAppPage(components: ComponentDefinition[], pageName: string = "Home", pageDescription: string = "Welcome to our website"): string {
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

  const componentsStr = components
    .map((comp) => renderComponent(comp, 4))
    .join("\n");

  return `import type { Metadata } from 'next';
import {
  Header,
  Footer,
  Hero,
  Section,
  Container,
  Grid,
  Card,
  Button,
  Text,
  Image,
  Video,
  Form,
  Navbar,
  Accordion,
  Tabs,
  Testimonial,
  PricingCard,
  Feature,
  Stats,
  CTA,
  Divider,
  Spacer,
  Badge,
  Alert,
} from '@/components';

export const metadata: Metadata = {
  title: '${pageName}',
  description: '${pageDescription}',
};

export default function Page() {
  return (
    <div className="page-container">
${componentsStr}
    </div>
  );
}
`;
}

export function generateComponentImplementation(componentName: string): string {
  const componentTemplates: Record<string, string> = {
    Header: `import React from 'react';

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  padding?: string;
  sticky?: boolean;
  shadow?: boolean;
  [key: string]: any;
}

export function Header({
  children,
  className = '',
  backgroundColor = '#ffffff',
  padding = '1rem 2rem',
  sticky = false,
  shadow = true,
}: HeaderProps) {
  return (
    <header
      className={\`w-full border-b \${sticky ? 'sticky top-0 z-50' : ''} \${shadow ? 'shadow-sm' : ''} \${className}\`}
      style={{ backgroundColor, padding }}
    >
      {children}
    </header>
  );
}`,
    Footer: `import React from 'react';

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
  logoText?: string;
  logo?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: string;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  [key: string]: any;
}

export function Footer({
  logoText = 'Brand',
  logo,
  description = 'Building the future of web design, one pixel at a time.',
  sections = [],
  socialLinks = [],
  copyright,
  backgroundColor = '#0f172a',
  textColor = '#e2e8f0',
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = \`© \${currentYear} \${logoText}. All rights reserved.\`;

  return (
    <footer className={\`w-full py-12 px-6 \${className}\`} style={{ backgroundColor, color: textColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold tracking-tight" style={{ color: '#ffffff' }}>
                  {logoText}
                </span>
              )}
            </div>
            {description && <p className="text-sm leading-relaxed opacity-60 max-w-xs">{description}</p>}
            {socialLinks.length > 0 && (
              <div className="flex space-x-3 pt-1">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon || social.platform.charAt(0).toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </div>
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#ffffff' }}>
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-200">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs opacity-40 tracking-wide">{copyright || defaultCopyright}</p>
        </div>
      </div>
    </footer>
  );
}`,
    Hero: `import React from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  [key: string]: any;
}

export function Hero({
  title = 'Build something amazing today',
  subtitle = 'INTRODUCING',
  description = 'Create stunning websites in minutes with our intuitive drag-and-drop builder.',
  primaryButtonText = 'Get Started Free',
  primaryButtonLink = '#',
  secondaryButtonText = 'See How It Works',
  secondaryButtonLink = '#',
  backgroundImage,
  backgroundColor = '#0f172a',
  textColor = '#f8fafc',
  alignment = 'center',
  size = 'lg',
  className = '',
}: HeroProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'py-16 px-4',
    md: 'py-20 px-6',
    lg: 'py-24 px-8',
    xl: 'py-32 px-12',
  };

  const style: React.CSSProperties = { backgroundColor, color: textColor };
  if (backgroundImage) {
    style.backgroundImage = \`url(\${backgroundImage})\`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundColor = undefined;
  }

  return (
    <section
      className={\`relative flex items-center justify-center min-h-[560px] w-full overflow-hidden text-\${alignment} \${sizeClasses[size] || sizeClasses.lg} \${className}\`}
      style={style}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {subtitle && (
          <div className={\`mb-6 \${alignment === 'center' ? 'flex justify-center' : ''}\`}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20 bg-white/10">
              {subtitle}
            </span>
          </div>
        )}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl opacity-80" style={alignment === 'center' ? { margin: '0 auto 2.5rem' } : undefined}>
          {description}
        </p>
        <div className={\`flex flex-col sm:flex-row gap-4 \${alignment === 'center' ? 'justify-center' : ''}\`}>
          <a href={primaryButtonLink} className="inline-block px-8 py-3 text-base font-medium rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-all duration-300 shadow-lg">
            {primaryButtonText}
          </a>
          {secondaryButtonText && (
            <a href={secondaryButtonLink} className="inline-block px-8 py-3 text-base font-medium rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300">
              {secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}`,
    Section: `import React from 'react';

interface SectionProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Section({ title, children, className = '', backgroundColor, textColor }: SectionProps) {
  return (
    <section className={\`py-12 \${className}\`} style={{ backgroundColor, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8">{title}</h2>}
        {children}
      </div>
    </section>
  );
}`,
    Container: `import React from 'react';

interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  [key: string]: any;
}

export function Container({ children, className = '', backgroundColor }: ContainerProps) {
  return (
    <div className={\`max-w-7xl mx-auto px-4 \${className}\`} style={{ backgroundColor }}>
      {children}
    </div>
  );
}`,
    Grid: `import React from 'react';

interface GridProps {
  columns?: number;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export function Grid({ columns = 3, children, className = '' }: GridProps) {
  return (
    <div
      className={\`grid grid-cols-1 gap-6 \${className}\`}
      style={{ gridTemplateColumns: \`repeat(\${columns}, minmax(0, 1fr))\` }}
    >
      {children}
    </div>
  );
}`,
    Card: `import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  buttonText?: string;
  buttonLink?: string;
  children?: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Card({
  title = 'Card Title',
  description = 'A short description of this card.',
  image,
  icon,
  buttonText,
  buttonLink = '#',
  children,
  className = '',
  backgroundColor = '#ffffff',
  textColor = '#1e293b',
}: CardProps) {
  return (
    <div
      className={\`rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 \${className}\`}
      style={{ backgroundColor, color: textColor }}
    >
      {image && (
        <div className="-mx-6 -mt-6 mb-5">
          <img src={image} alt={title || 'Card image'} className="w-full h-52 object-cover" />
        </div>
      )}
      {icon && !image && (
        <div className="mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-indigo-50 text-indigo-500">
            {icon}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {title && <h3 className="text-lg font-semibold tracking-tight">{title}</h3>}
        {description && <p className="text-sm leading-relaxed opacity-60">{description}</p>}
        {buttonText && (
          <div className="pt-2">
            <a href={buttonLink} className="inline-flex items-center gap-1.5 text-indigo-500 font-medium text-sm hover:underline">
              {buttonText} <span>→</span>
            </a>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}`,
    Button: `import React from 'react';

interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}

export function Button({ text = 'Click me', variant = 'primary', onClick, className = '' }: ButtonProps) {
  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={onClick}
      className={\`px-6 py-2 rounded-lg font-semibold transition \${variantClasses[variant] || variantClasses.primary} \${className}\`}
    >
      {text}
    </button>
  );
}`,
    Text: `import React from 'react';

interface TextProps {
  content?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  textColor?: string;
  [key: string]: any;
}

export function Text({ content = 'Text content', size = 'base', className = '', textColor }: TextProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <p className={\`\${sizeClasses[size] || 'text-base'} \${className}\`} style={{ color: textColor }}>
      {content}
    </p>
  );
}`,
    Image: `import React from 'react';

interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export function Image({ src = '/placeholder.jpg', alt = 'Image', className = '' }: ImageProps) {
  return (
    <img src={src} alt={alt} className={\`w-full h-auto rounded-lg \${className}\`} />
  );
}`,
    Video: `import React from 'react';

interface VideoProps {
  src?: string;
  youtubeId?: string;
  vimeoId?: string;
  poster?: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Video({
  src,
  youtubeId,
  vimeoId,
  poster,
  width,
  height,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className = '',
  aspectRatio = '16:9',
  backgroundColor,
  textColor,
}: VideoProps) {
  const aspectClasses: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '21:9': 'aspect-[21/9]',
  };

  const wrapperStyle: React.CSSProperties = {};
  if (width) wrapperStyle.width = width;
  if (height) wrapperStyle.height = height;

  // YouTube embed
  if (youtubeId) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      controls: controls ? '1' : '0',
    });
    if (loop) params.set('playlist', youtubeId);

    return (
      <div className={\\\`w-full \\\${aspectClasses[aspectRatio] || 'aspect-video'} \\\${className}\\\`} style={wrapperStyle}>
        <iframe
          src={\\\`https://www.youtube-nocookie.com/embed/\\\${youtubeId}?\\\${params.toString()}\\\`}
          title="YouTube video"
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo embed
  if (vimeoId) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      muted: muted ? '1' : '0',
      loop: loop ? '1' : '0',
    });

    return (
      <div className={\\\`w-full \\\${aspectClasses[aspectRatio] || 'aspect-video'} \\\${className}\\\`} style={wrapperStyle}>
        <iframe
          src={\\\`https://player.vimeo.com/video/\\\${vimeoId}?\\\${params.toString()}\\\`}
          title="Vimeo video"
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Regular video file
  if (src) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        className={\\\`w-full h-auto rounded-lg \\\${!width && !height ? aspectClasses[aspectRatio] || '' : ''} \\\${className}\\\`}
        style={wrapperStyle}
      />
    );
  }

  // Placeholder when no source provided
  return (
    <div
      className={\\\`w-full rounded-lg flex items-center justify-center \\\${!backgroundColor ? 'bg-gray-200' : ''} \\\${aspectClasses[aspectRatio] || 'aspect-video'} \\\${className}\\\`}
      style={{ backgroundColor, color: textColor, ...wrapperStyle }}
    >
      <p className={\\\`\\\${!textColor ? 'opacity-50' : ''}\\\`}>No video source provided</p>
    </div>
  );
}`,
    Form: `'use client';

import React from 'react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormProps {
  title?: string;
  description?: string;
  fields?: FormField[];
  submitText?: string;
  action?: string;
  method?: 'GET' | 'POST';
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export function Form({
  title,
  description,
  fields = [],
  submitText = 'Submit',
  action = '#',
  method = 'POST',
  className = '',
  backgroundColor,
  textColor,
}: FormProps) {
  const renderField = (field: FormField) => {
    const baseInputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent';

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-medium">{field.label}</label>
            <textarea id={field.id} name={field.id} placeholder={field.placeholder} required={field.required} className={\`\${baseInputClass} min-h-[100px]\`} />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-medium">{field.label}</label>
            <select id={field.id} name={field.id} required={field.required} className={baseInputClass}>
              <option value="">Select an option</option>
              {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <input type="checkbox" id={field.id} name={field.id} required={field.required} className="rounded border-gray-300" />
            <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
          </div>
        );
      default:
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block text-sm font-medium">{field.label}</label>
            <input type={field.type} id={field.id} name={field.id} placeholder={field.placeholder} required={field.required} className={baseInputClass} />
          </div>
        );
    }
  };

  return (
    <div className={\`w-full max-w-md mx-auto \${className}\`} style={{ backgroundColor, color: textColor }}>
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="mb-6 opacity-80">{description}</p>}
      <form action={action} method={method} className="space-y-4">
        {fields.map(renderField)}
        <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          {submitText}
        </button>
      </form>
    </div>
  );
}`,
    Navbar: `'use client';

import React, { useState } from 'react';

interface NavLink {
  text: string;
  href: string;
  external?: boolean;
}

interface NavbarProps {
  logoText?: string;
  logo?: string;
  links?: NavLink[];
  ctaText?: string;
  ctaLink?: string;
  theme?: 'light' | 'dark';
  className?: string;
  [key: string]: any;
}

export function Navbar({
  logoText = 'Brand',
  logo,
  links = [],
  ctaText,
  ctaLink,
  theme = 'light',
  className = '',
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className="relative">
      <nav
        className={\`flex items-center w-full px-6 py-4 border-b \${isDark ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900'} \${className}\`}
        style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center space-x-2">
          {logo ? (
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-bold tracking-tight">{logoText}</span>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-1 ml-auto mr-4">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href || '#'}
              className={\`px-3 py-2 rounded-lg text-sm font-medium transition-colors \${isDark ? 'text-white/70 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}\`}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.text}
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-3 md:space-x-0 ml-auto md:ml-0">
          {ctaText && ctaLink && (
            <a
              href={ctaLink}
              className="hidden md:inline-block text-sm font-medium rounded-full px-5 py-2 shadow-sm text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {ctaText}
            </a>
          )}
          {links.length > 0 && (
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>
      {isMobileMenuOpen && links.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 border-b shadow-xl z-50 md:hidden"
          style={{
            backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="py-2 px-2">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href || '#'}
                className={\`block px-4 py-3 text-sm font-medium rounded-lg transition-colors \${isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}\`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.text}
              </a>
            ))}
            {ctaText && ctaLink && (
              <div className="px-4 py-3">
                <a
                  href={ctaLink}
                  className="block w-full text-center text-sm rounded-full px-5 py-2 text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {ctaText}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`,
    Accordion: `'use client';

import React, { useState } from 'react';

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items?: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  className?: string;
  [key: string]: any;
}

export function Accordion({
  items = [
    { title: 'Accordion Item 1', content: 'Content for item 1' },
    { title: 'Accordion Item 2', content: 'Content for item 2' },
  ],
  allowMultiple = false,
  defaultOpen = 0,
  backgroundColor = '#ffffff',
  textColor,
  borderColor = '#e5e7eb',
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([defaultOpen]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    } else {
      setOpenItems(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className={\`w-full space-y-2 \${className}\`}>
      {items.map((item, index) => (
        <div key={index} className="w-full border rounded-lg overflow-hidden" style={{ backgroundColor, color: textColor, borderColor }}>
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-4 py-3 flex items-center justify-between transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <span className="font-medium text-left">{item.title}</span>
            <span className={\`transition-transform \${openItems.includes(index) ? 'rotate-180' : ''}\`}>▼</span>
          </button>
          {openItems.includes(index) && (
            <div className="px-4 py-3 border-t" style={{ borderColor }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
    Tabs: `'use client';

import React, { useState } from 'react';

interface Tab {
  label: string;
  content: string;
}

interface TabsProps {
  tabs?: Tab[];
  defaultTab?: number;
  variant?: 'underline' | 'pills' | 'bordered';
  backgroundColor?: string;
  textColor?: string;
  activeColor?: string;
  className?: string;
  [key: string]: any;
}

export function Tabs({
  tabs = [
    { label: 'Tab 1', content: 'Content for tab 1' },
    { label: 'Tab 2', content: 'Content for tab 2' },
    { label: 'Tab 3', content: 'Content for tab 3' },
  ],
  defaultTab = 0,
  variant = 'underline',
  backgroundColor,
  textColor,
  activeColor = '#3b82f6',
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className} style={{ backgroundColor, color: textColor }}>
      <div className={\`flex gap-2 \${variant === 'bordered' ? 'border-b' : ''}\`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={\`px-4 py-2 font-medium transition-colors \${
              variant === 'underline' || variant === 'bordered' ? 'border-b-2' : 'rounded-lg'
            } \${activeTab !== index ? 'opacity-60 hover:opacity-100' : ''}\`}
            style={{
              borderColor: activeTab === index ? activeColor : 'transparent',
              color: activeTab === index ? activeColor : textColor || undefined,
              backgroundColor: activeTab === index && variant === 'pills' ? \`\${activeColor}20\` : undefined,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">{tabs[activeTab]?.content}</div>
    </div>
  );
}`,
    Testimonial: `import React from 'react';

interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  variant?: 'card' | 'minimal' | 'featured';
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  [key: string]: any;
}

export function Testimonial({
  quote = 'This product has completely transformed how we work.',
  author = 'Sarah Johnson',
  role = 'Head of Design',
  company = 'Acme Inc',
  avatar,
  rating = 5,
  variant = 'card',
  backgroundColor,
  textColor,
  className = '',
}: TestimonialProps) {
  return (
    <div
      className={\`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 \${
        variant !== 'minimal' && !backgroundColor ? 'bg-white border border-gray-100 shadow-md' : ''
      } \${className}\`}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="text-5xl font-serif leading-none mb-4 select-none" style={{ color: '#6366f1', opacity: 0.3 }}>"</div>
      <blockquote className="text-base leading-relaxed mb-6">{quote}</blockquote>
      {rating > 0 && (
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={\`text-sm \${i < rating ? 'text-amber-400' : 'text-gray-200'}\`}>★</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-indigo-50 text-indigo-500">
            {author?.charAt(0) || '?'}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold">{author}</div>
          <div className="text-xs opacity-50">{role}{company ? \`, \${company}\` : ''}</div>
        </div>
      </div>
    </div>
  );
}`,
    PricingCard: `import React from 'react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title?: string;
  price?: string;
  period?: string;
  description?: string;
  features?: (string | PricingFeature)[];
  buttonText?: string;
  buttonLink?: string;
  featured?: boolean;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  [key: string]: any;
}

export function PricingCard({
  title = 'Pro Plan',
  price = '$49',
  period = 'month',
  description = 'Everything you need to scale',
  features = [
    { text: 'Unlimited projects', included: true },
    { text: 'Priority support', included: true },
    { text: 'Advanced analytics', included: true },
    { text: 'Custom integrations', included: false },
  ],
  buttonText = 'Get Started',
  buttonLink = '#',
  featured = false,
  backgroundColor = '#ffffff',
  textColor = '#1e293b',
  className = '',
}: PricingCardProps) {
  const normalizedFeatures = features.map(f => typeof f === 'string' ? { text: f, included: true } : f);

  return (
    <div
      className={\`p-8 rounded-2xl flex flex-col border transition-all duration-300 hover:-translate-y-1 \${
        featured ? 'border-indigo-200 shadow-lg scale-[1.02]' : 'border-gray-100 shadow-md'
      } \${className}\`}
      style={{ backgroundColor, color: textColor }}
    >
      {featured && (
        <div className="text-center mb-5 -mt-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider px-4 py-1 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4 tracking-tight">{title}</h3>
        <div className="mb-2 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold tracking-tight">{price}</span>
          <span className="text-sm opacity-40 font-medium">/{period}</span>
        </div>
        <p className="text-sm opacity-50">{description}</p>
      </div>
      <div className="border-t border-gray-100 pt-6 mb-8">
        <ul className="space-y-3">
          {normalizedFeatures.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <span className={\`w-5 h-5 rounded-full flex items-center justify-center text-xs \${
                feature.included ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-300'
              }\`}>
                {feature.included ? '✓' : '✕'}
              </span>
              <span className={!feature.included ? 'opacity-40' : ''}>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto">
        <a
          href={buttonLink}
          className={\`block w-full text-center py-3 rounded-xl font-medium transition-all duration-300 \${
            featured ? 'text-white shadow-lg' : 'border border-gray-200 hover:bg-gray-50'
          }\`}
          style={featured ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : undefined}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}`,
    Feature: `import React from 'react';

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  layout?: 'vertical' | 'horizontal';
  iconSize?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  className?: string;
  [key: string]: any;
}

export function Feature({
  icon = '✨',
  title = 'Feature Title',
  description = 'Explain the value of this feature.',
  layout = 'vertical',
  iconSize = 'md',
  backgroundColor,
  textColor,
  iconColor = '#6366f1',
  className = '',
}: FeatureProps) {
  const iconSizes: Record<string, string> = { sm: 'w-10 h-10 text-xl', md: 'w-12 h-12 text-2xl', lg: 'w-14 h-14 text-3xl' };

  return (
    <div
      className={\`p-6 rounded-2xl transition-all duration-300 hover:bg-gray-50/80 \${layout === 'vertical' ? 'text-center' : 'flex gap-5 items-start'} \${className}\`}
      style={{ backgroundColor, color: textColor }}
    >
      <div
        className={\`rounded-xl flex items-center justify-center flex-shrink-0 \${iconSizes[iconSize] || iconSizes.md} \${layout === 'vertical' ? 'mx-auto mb-5' : ''}\`}
        style={{ background: \`\${iconColor}15\`, color: iconColor }}
      >
        {icon}
      </div>
      <div className={layout === 'vertical' ? 'text-center' : 'flex-1'}>
        <h3 className="text-lg font-semibold mb-2 tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed opacity-60">{description}</p>
      </div>
    </div>
  );
}`,
    Stats: `import React from 'react';

interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

interface StatsProps {
  stats?: Stat[];
  layout?: 'horizontal' | 'grid';
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  className?: string;
  [key: string]: any;
}

export function Stats({
  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '50+', label: 'Countries' },
    { value: '4.9', label: 'Star Rating' },
  ],
  layout = 'horizontal',
  columns = 4,
  backgroundColor,
  textColor,
  accentColor = '#6366f1',
  className = '',
}: StatsProps) {
  return (
    <div
      className={\`py-12 px-8 \${layout === 'grid' ? 'grid gap-8' : 'flex justify-around items-center flex-wrap gap-8'} \${className}\`}
      style={{
        backgroundColor,
        color: textColor,
        ...(layout === 'grid' ? { gridTemplateColumns: \`repeat(\${columns}, minmax(0, 1fr))\` } : {}),
      }}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight" style={{ color: accentColor }}>
            {stat.value}{stat.suffix}
          </div>
          <div className="text-xs font-medium uppercase tracking-widest opacity-50">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}`,
    CTA: `import React from 'react';

interface CTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  [key: string]: any;
}

export function CTA({
  title = 'Ready to get started?',
  description = 'Join thousands of teams who are already building faster.',
  primaryButtonText = 'Start Free Trial',
  primaryButtonLink = '#',
  secondaryButtonText,
  secondaryButtonLink = '#',
  alignment = 'center',
  size = 'md',
  backgroundColor,
  textColor = '#ffffff',
  className = '',
}: CTAProps) {
  const sizeClasses: Record<string, string> = { sm: 'py-12 px-6', md: 'py-16 px-8', lg: 'py-24 px-12' };

  return (
    <div
      className={\`rounded-2xl flex flex-col gap-8 relative overflow-hidden text-\${alignment} \${sizeClasses[size] || sizeClasses.md} \${className}\`}
      style={{
        color: textColor,
        background: backgroundColor || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      }}
    >
      <div className="relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">{title}</h2>
        <p className="text-lg opacity-85 max-w-xl" style={alignment === 'center' ? { margin: '0 auto' } : undefined}>
          {description}
        </p>
      </div>
      <div className={\`relative z-10 flex gap-4 flex-wrap \${alignment === 'center' ? 'justify-center' : ''}\`}>
        <a href={primaryButtonLink} className="px-8 py-3 text-base font-medium rounded-full bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg" style={{ color: '#4f46e5' }}>
          {primaryButtonText}
        </a>
        {secondaryButtonText && (
          <a href={secondaryButtonLink} className="px-8 py-3 text-base font-medium rounded-full border border-white/30 hover:bg-white/10 transition-all duration-300 text-white">
            {secondaryButtonText}
          </a>
        )}
      </div>
    </div>
  );
}`,
    Divider: `import React from 'react';

interface DividerProps {
  className?: string;
  [key: string]: any;
}

export function Divider({ className = '' }: DividerProps) {
  return <hr className={\`border-gray-300 my-8 \${className}\`} />;
}`,
    Spacer: `import React from 'react';

interface SpacerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}

export function Spacer({ size = 'md', className = '' }: SpacerProps) {
  const sizeClasses: Record<string, string> = { sm: 'h-4', md: 'h-8', lg: 'h-16' };
  return <div className={\`\${sizeClasses[size] || 'h-8'} \${className}\`} />;
}`,
    Badge: `import React from 'react';

interface BadgeProps {
  text?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  [key: string]: any;
}

export function Badge({ text = 'Badge', variant = 'primary', className = '' }: BadgeProps) {
  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={\`inline-block px-3 py-1 rounded-full text-sm font-semibold \${variantClasses[variant] || variantClasses.primary} \${className}\`}>
      {text}
    </span>
  );
}`,
    Alert: `import React from 'react';

interface AlertProps {
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  [key: string]: any;
}

export function Alert({ message = 'Alert message', type = 'info', className = '' }: AlertProps) {
  const typeClasses: Record<string, string> = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-500 text-red-900',
  };

  return (
    <div className={\`border-l-4 p-4 \${typeClasses[type] || typeClasses.info} \${className}\`}>
      {message}
    </div>
  );
}`,
  };

  return componentTemplates[componentName] || '';
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

- \`/app\` - Next.js App Router pages
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
