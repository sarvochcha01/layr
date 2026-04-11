import { ComponentDefinition } from "@/types/editor";

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
import '@/styles/globals.css';

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
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Header({ title = 'Welcome', subtitle, className = '' }: HeaderProps) {
  return (
    <header className={\`bg-white shadow-sm \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
    </header>
  );
}`,
    Footer: `import React from 'react';

interface FooterProps {
  text?: string;
  className?: string;
}

export function Footer({ text = '© 2024 All rights reserved', className = '' }: FooterProps) {
  return (
    <footer className={\`bg-gray-800 text-white \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p>{text}</p>
      </div>
    </footer>
  );
}`,
    Hero: `import React from 'react';

interface HeroProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  className?: string;
}

export function Hero({ title = 'Hero Title', subtitle = 'Hero subtitle', buttonText = 'Get Started', className = '' }: HeroProps) {
  return (
    <section className={\`bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8">{subtitle}</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          {buttonText}
        </button>
      </div>
    </section>
  );
}`,
    Section: `import React from 'react';

interface SectionProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section className={\`py-12 \${className}\`}>
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
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={\`max-w-7xl mx-auto px-4 \${className}\`}>
      {children}
    </div>
  );
}`,
    Grid: `import React from 'react';

interface GridProps {
  columns?: number;
  children?: React.ReactNode;
  className?: string;
}

export function Grid({ columns = 3, children, className = '' }: GridProps) {
  return (
    <div className={\`grid grid-cols-1 md:grid-cols-\${columns} gap-6 \${className}\`}>
      {children}
    </div>
  );
}`,
    Card: `import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
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
}

export function Button({ text = 'Click me', variant = 'primary', onClick, className = '' }: ButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={onClick}
      className={\`px-6 py-2 rounded-lg font-semibold transition \${variantClasses[variant]} \${className}\`}
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
}

export function Text({ content = 'Text content', size = 'base', className = '' }: TextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <p className={\`\${sizeClasses[size]} \${className}\`}>
      {content}
    </p>
  );
}`,
    Image: `import React from 'react';

interface ImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function Image({ src = '/placeholder.jpg', alt = 'Image', className = '' }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={\`w-full h-auto rounded-lg \${className}\`}
    />
  );
}`,
    Video: `import React from 'react';

interface VideoProps {
  src?: string;
  className?: string;
}

export function Video({ src = '/placeholder.mp4', className = '' }: VideoProps) {
  return (
    <video
      src={src}
      controls
      className={\`w-full rounded-lg \${className}\`}
    />
  );
}`,
    Form: `import React from 'react';

interface FormProps {
  title?: string;
  className?: string;
}

export function Form({ title = 'Contact Form', className = '' }: FormProps) {
  return (
    <form className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Message"
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
}`,
    Navbar: `import React from 'react';

interface NavbarProps {
  brand?: string;
  links?: string[];
  className?: string;
}

export function Navbar({ brand = 'Brand', links = ['Home', 'About', 'Contact'], className = '' }: NavbarProps) {
  return (
    <nav className={\`bg-white shadow-md \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">{brand}</div>
        <div className="flex gap-6">
          {links.map((link, index) => (
            <a key={index} href="#" className="text-gray-700 hover:text-blue-600 transition">
              {link}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}`,
    Accordion: `import React, { useState } from 'react';

interface AccordionProps {
  title?: string;
  content?: string;
  className?: string;
}

export function Accordion({ title = 'Accordion Title', content = 'Accordion content', className = '' }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={\`border rounded-lg \${className}\`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left font-semibold flex justify-between items-center hover:bg-gray-50"
      >
        {title}
        <span>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t">
          {content}
        </div>
      )}
    </div>
  );
}`,
    Tabs: `import React, { useState } from 'react';

interface TabsProps {
  tabs?: string[];
  className?: string;
}

export function Tabs({ tabs = ['Tab 1', 'Tab 2', 'Tab 3'], className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={\`\${className}\`}>
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={\`px-6 py-3 font-semibold \${
              activeTab === index
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }\`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-6">
        Content for {tabs[activeTab]}
      </div>
    </div>
  );
}`,
    Testimonial: `import React from 'react';

interface TestimonialProps {
  quote?: string;
  author?: string;
  role?: string;
  className?: string;
}

export function Testimonial({ quote = 'Great product!', author = 'John Doe', role = 'CEO', className = '' }: TestimonialProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}`,
    PricingCard: `import React from 'react';

interface PricingCardProps {
  title?: string;
  price?: string;
  features?: string[];
  className?: string;
}

export function PricingCard({ title = 'Basic', price = '$9/mo', features = ['Feature 1', 'Feature 2'], className = '' }: PricingCardProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 text-center \${className}\`}>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-4xl font-bold text-blue-600 mb-6">{price}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-700">{feature}</li>
        ))}
      </ul>
      <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
        Choose Plan
      </button>
    </div>
  );
}`,
    Feature: `import React from 'react';

interface FeatureProps {
  icon?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function Feature({ icon = '✨', title = 'Feature', description = 'Feature description', className = '' }: FeatureProps) {
  return (
    <div className={\`text-center \${className}\`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}`,
    Stats: `import React from 'react';

interface StatsProps {
  value?: string;
  label?: string;
  className?: string;
}

export function Stats({ value = '100+', label = 'Customers', className = '' }: StatsProps) {
  return (
    <div className={\`text-center \${className}\`}>
      <p className="text-4xl font-bold text-blue-600 mb-2">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}`,
    CTA: `import React from 'react';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function CTA({ title = 'Ready to get started?', description = 'Join us today', buttonText = 'Sign Up', className = '' }: CTAProps) {
  return (
    <section className={\`bg-blue-600 text-white py-16 text-center \${className}\`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-xl mb-8">{description}</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          {buttonText}
        </button>
      </div>
    </section>
  );
}`,
    Divider: `import React from 'react';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return (
    <hr className={\`border-gray-300 my-8 \${className}\`} />
  );
}`,
    Spacer: `import React from 'react';

interface SpacerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spacer({ size = 'md', className = '' }: SpacerProps) {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16',
  };

  return (
    <div className={\`\${sizeClasses[size]} \${className}\`} />
  );
}`,
    Badge: `import React from 'react';

interface BadgeProps {
  text?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ text = 'Badge', variant = 'primary', className = '' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={\`inline-block px-3 py-1 rounded-full text-sm font-semibold \${variantClasses[variant]} \${className}\`}>
      {text}
    </span>
  );
}`,
    Alert: `import React from 'react';

interface AlertProps {
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Alert({ message = 'Alert message', type = 'info', className = '' }: AlertProps) {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-500 text-red-900',
  };

  return (
    <div className={\`border-l-4 p-4 \${typeClasses[type]} \${className}\`}>
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
