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

    return `import React from 'react';
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
} from './components';

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
