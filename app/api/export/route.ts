import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateCSS, generateHTML, generateJS } from "@/lib/codeGenerator";
import {
    generateReactComponent,
    generateReactComponentsIndex,
    generatePackageJson,
    generateNextConfig,
    generateTailwindConfig,
    generateREADME,
    generateAppLayout,
    generateAppPage,
    generateComponentImplementation,
} from "@/lib/reactGenerator";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const { pages, components, format = "html", projectName = "my-website" } = await request.json();

        // Support both new pages format and legacy components format
        let pagesToExport = pages;

        if (!pagesToExport && components && Array.isArray(components)) {
            // Legacy format: convert components to single page
            pagesToExport = [
                {
                    id: "home",
                    name: "Home",
                    slug: "index",
                    components: components,
                },
            ];
        }

        if (!pagesToExport || !Array.isArray(pagesToExport)) {
            return NextResponse.json(
                { error: "Invalid pages data" },
                { status: 400 }
            );
        }

        // Generate shared CSS and JS
        const css = generateCSS();
        const js = generateJS();

        // Create zip file
        const zip = new JSZip();

        if (format === "react") {
            // React/Next.js export with App Router structure
            const appFolder = zip.folder("app");
            const componentsFolder = zip.folder("components");
            const publicFolder = zip.folder("public");

            // Generate app/layout.tsx
            appFolder?.file("layout.tsx", generateAppLayout(projectName));

            // Generate app/globals.css
            appFolder?.file(
                "globals.css",
                `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`
            );

            // Generate page components using App Router structure
            for (let i = 0; i < pagesToExport.length; i++) {
                const page = pagesToExport[i];
                const pageName = page.name.replace(/\s+/g, "");

                // App Router uses app/page.tsx for home and app/[slug]/page.tsx for other pages
                // First page with slug "index" OR the very first page becomes the home page
                if (page.slug === "index" || (i === 0 && !pagesToExport.some(p => p.slug === "index"))) {
                    // Use generateAppPage for the home page with metadata
                    const appPageContent = generateAppPage(page.components, pageName, `${pageName} - ${projectName}`);
                    appFolder?.file("page.tsx", appPageContent);
                } else {
                    // Use generateReactComponent for additional pages
                    const reactComponent = generateReactComponent(page.components, pageName);
                    const pageFolder = appFolder?.folder(page.slug);
                    pageFolder?.file("page.tsx", reactComponent);
                }
            }

            // Copy all component files from builder directory
            const componentNames = [
                'Header', 'Footer', 'Hero', 'Section', 'Container', 'Grid',
                'Card', 'Button', 'Text', 'Image', 'Video', 'Form',
                'Navbar', 'Accordion', 'Tabs', 'Testimonial', 'PricingCard',
                'Feature', 'Stats', 'CTA', 'Divider', 'Spacer', 'Badge', 'Alert', 'CustomCode'
            ];

            for (const componentName of componentNames) {
                const componentPath = path.join(process.cwd(), 'components', 'builder', `${componentName}.tsx`);
                const componentCode = fs.readFileSync(componentPath, 'utf-8');
                componentsFolder?.file(`${componentName}.tsx`, componentCode);
            }

            // Add component index for convenient imports
            componentsFolder?.file("index.ts", generateReactComponentsIndex());

            // Copy UI components folder
            const uiFolder = componentsFolder?.folder("ui");
            const uiComponentsPath = path.join(process.cwd(), 'components', 'ui');
            const uiFiles = fs.readdirSync(uiComponentsPath);

            for (const file of uiFiles) {
                if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                    const filePath = path.join(uiComponentsPath, file);
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    uiFolder?.file(file, fileContent);
                }
            }

            // Add lib folder with utility files
            const libFolder = zip.folder("lib");
            const utilsPath = path.join(process.cwd(), 'lib', 'utils.ts');
            const utilsCode = fs.readFileSync(utilsPath, 'utf-8');
            libFolder?.file("utils.ts", utilsCode);

            const buildStylePath = path.join(process.cwd(), 'lib', 'buildStyle.ts');
            const buildStyleCode = fs.readFileSync(buildStylePath, 'utf-8');
            libFolder?.file("buildStyle.ts", buildStyleCode);

            // Add config files
            zip.file("package.json", generatePackageJson(projectName));
            zip.file("next.config.js", generateNextConfig());
            zip.file("tailwind.config.js", generateTailwindConfig());
            zip.file("README.md", generateREADME(projectName));

            // Add postcss config
            zip.file(
                "postcss.config.js",
                `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

module.exports = config
`
            );

            // Add .gitignore
            zip.file(
                ".gitignore",
                `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
            );

            // Add .eslintrc.json
            zip.file(
                ".eslintrc.json",
                JSON.stringify(
                    {
                        extends: "next/core-web-vitals",
                    },
                    null,
                    2
                )
            );

            // Add next-env.d.ts
            zip.file(
                "next-env.d.ts",
                `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
`
            );

            // Add tsconfig.json with proper Next.js 15 configuration
            zip.file(
                "tsconfig.json",
                JSON.stringify(
                    {
                        compilerOptions: {
                            target: "ES2017",
                            lib: ["dom", "dom.iterable", "esnext"],
                            allowJs: true,
                            skipLibCheck: true,
                            strict: true,
                            noEmit: true,
                            esModuleInterop: true,
                            module: "esnext",
                            moduleResolution: "node",
                            resolveJsonModule: true,
                            isolatedModules: true,
                            jsx: "preserve",
                            incremental: true,
                            plugins: [
                                {
                                    name: "next",
                                },
                            ],
                            paths: {
                                "@/*": ["./*"],
                            },
                        },
                        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
                        exclude: ["node_modules"],
                    },
                    null,
                    2
                )
            );

            // Add placeholder image to public folder
            publicFolder?.file(".gitkeep", "");
        } else {
            // HTML export (existing logic)
            for (const page of pagesToExport) {
                const html = generateHTML(page.components, pagesToExport);

                // Support both slug and path fields
                let filename: string;
                if (page.slug) {
                    filename = `${page.slug}.html`;
                } else if (page.path) {
                    // Convert path to filename (e.g., "/" -> "index.html", "/about" -> "about.html")
                    const pathName = page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-");
                    filename = `${pathName}.html`;
                } else {
                    // Fallback to page id
                    filename = `${page.id}.html`;
                }

                zip.file(filename, html);
            }

            // Add shared files
            zip.file("styles.css", css);
            zip.file("script.js", js);
        }

        // Generate zip as blob
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Add timestamp to filename to prevent browser caching
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = format === "react"
            ? `${projectName.toLowerCase().replace(/\s+/g, '-')}-nextjs-${timestamp}.zip`
            : `${projectName.toLowerCase().replace(/\s+/g, '-')}-html-${timestamp}.zip`;

        // Return zip file
        return new NextResponse(zipBlob, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        });
    } catch (error) {
        console.error("Export failed:", error);
        return NextResponse.json(
            { error: "Export failed. Please try again." },
            { status: 500 }
        );
    }
}
