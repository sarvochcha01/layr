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

            // Generate app/layout.tsx
            appFolder?.file("layout.tsx", generateAppLayout(projectName));

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

            // Generate all component implementation files
            const componentNames = [
                'Header', 'Footer', 'Hero', 'Section', 'Container', 'Grid',
                'Card', 'Button', 'Text', 'Image', 'Video', 'Form',
                'Navbar', 'Accordion', 'Tabs', 'Testimonial', 'PricingCard',
                'Feature', 'Stats', 'CTA', 'Divider', 'Spacer', 'Badge', 'Alert'
            ];

            for (const componentName of componentNames) {
                const componentCode = generateComponentImplementation(componentName);
                componentsFolder?.file(`${componentName}.tsx`, componentCode);
            }

            // Add component index for convenient imports
            componentsFolder?.file("index.ts", generateReactComponentsIndex());

            // Add config files
            zip.file("package.json", generatePackageJson(projectName));
            zip.file("next.config.js", generateNextConfig());
            zip.file("tailwind.config.js", generateTailwindConfig());
            zip.file("README.md", generateREADME(projectName));

            // Add postcss config
            zip.file(
                "postcss.config.js",
                `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
            );

            // Add global styles
            const stylesFolder = zip.folder("styles");
            stylesFolder?.file(
                "globals.css",
                `@tailwind base;
@tailwind components;
@tailwind utilities;
`
            );

            // Add tsconfig
            zip.file(
                "tsconfig.json",
                JSON.stringify(
                    {
                        compilerOptions: {
                            target: "es5",
                            lib: ["dom", "dom.iterable", "esnext"],
                            allowJs: true,
                            skipLibCheck: true,
                            strict: true,
                            forceConsistentCasingInFileNames: true,
                            noEmit: true,
                            esModuleInterop: true,
                            module: "esnext",
                            moduleResolution: "node",
                            resolveJsonModule: true,
                            isolatedModules: true,
                            jsx: "preserve",
                            incremental: true,
                            paths: {
                                "@/*": ["./*"],
                            },
                        },
                        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
                        exclude: ["node_modules"],
                    },
                    null,
                    2
                )
            );
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

        // Return zip file
        return new NextResponse(zipBlob, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="website-export.zip"',
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
