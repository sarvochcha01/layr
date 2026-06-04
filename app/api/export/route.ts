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
import {
    generateFirebaseConfig,
    generateEnvFile,
    generatePipelineExecutor,
    generatePipelineDelegate,
    generateBackendTypes,
    generateApiRoute,
    getBackendDependencies
} from "@/lib/backendGenerator";

export async function POST(request: NextRequest) {
    try {
        const { pages, components, format = "html", projectName = "my-website", apiEndpoints = [], firebaseConfig, dbSchema = [] } = await request.json();

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

                console.log(`[Export] Processing page: ${page.name} (slug: ${page.slug}, id: ${page.id})`);

                // App Router uses app/page.tsx for home and app/[slug]/page.tsx for other pages
                // First page with slug "index" OR the very first page becomes the home page
                if (page.slug === "index" || (i === 0 && !pagesToExport.some(p => p.slug === "index"))) {
                    // Use generateAppPage for the home page with metadata
                    const appPageContent = generateAppPage(page.components, pageName, `${pageName} - ${projectName}`, pagesToExport);
                    appFolder?.file("page.tsx", appPageContent);
                    console.log(`[Export] Created home page at app/page.tsx`);
                } else {
                    // Use generateReactComponent for additional pages
                    const reactComponent = generateReactComponent(page.components, pageName, pagesToExport);
                    const pageFolder = appFolder?.folder(page.slug);
                    pageFolder?.file("page.tsx", reactComponent);
                    console.log(`[Export] Created page at app/${page.slug}/page.tsx`);
                }
            }

            console.log(`[Export] All pages:`, pagesToExport.map(p => ({ name: p.name, slug: p.slug, id: p.id })));

            // Copy all component files from builder directory
            const componentNames = [
                'Header', 'Footer', 'Hero', 'Section', 'Container', 'Grid',
                'Card', 'Button', 'Text', 'Image', 'Video', 'Form',
                'Navbar', 'Accordion', 'Tabs', 'Testimonial', 'PricingCard',
                'Feature', 'Stats', 'CTA', 'Divider', 'Spacer', 'Badge', 'Alert', 'CustomCode'
            ];

            for (const componentName of componentNames) {
                const componentPath = path.join(process.cwd(), 'components', 'builder', `${componentName}.tsx`);
                let componentCode = fs.readFileSync(componentPath, 'utf-8');
                
                // Ensure "use client" directive is at the top for all components
                if (!componentCode.trim().startsWith('"use client"') && !componentCode.trim().startsWith("'use client'")) {
                    componentCode = '"use client";\n\n' + componentCode;
                }

                // Strip Layr-internal imports that don't exist in the exported project
                // Remove AuthContext import line
                componentCode = componentCode.replace(/import\s*\{[^}]*useAuth[^}]*\}\s*from\s*["']@\/contexts\/AuthContext["'];?\s*\n?/g, '');
                // Replace `const { user } = useAuth();` with a no-op stub
                componentCode = componentCode.replace(/const\s*\{\s*user\s*\}\s*=\s*useAuth\(\);?/g, 'const user: any = null;');
                // Replace any other useAuth() calls
                componentCode = componentCode.replace(/useAuth\(\)/g, '({ user: null } as any)');

                // Remove the layr-data-refresh event dispatch (not needed in exported projects)
                // These are editor-only refresh triggers
                componentCode = componentCode.replace(
                    /\/\/\s*Dispatch a data-refresh event[\s\S]*?window\.dispatchEvent\(new Event\(["']layr-data-refresh["']\)\);?\s*\n?\s*\},?\s*\d*\);?\s*\n?/g,
                    ''
                );

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

            // Add theme-related files
            const themeStylesPath = path.join(process.cwd(), 'lib', 'themeStyles.ts');
            const themeStylesCode = fs.readFileSync(themeStylesPath, 'utf-8');
            libFolder?.file("themeStyles.ts", themeStylesCode);

            const fontsPath = path.join(process.cwd(), 'lib', 'fonts.ts');
            const fontsCode = fs.readFileSync(fontsPath, 'utf-8');
            libFolder?.file("fonts.ts", fontsCode);

            // Add contexts folder with ThemeStyleContext
            const contextsFolder = zip.folder("contexts");
            const themeContextPath = path.join(process.cwd(), 'contexts', 'ThemeStyleContext.tsx');
            const themeContextCode = fs.readFileSync(themeContextPath, 'utf-8');
            contextsFolder?.file("ThemeStyleContext.tsx", themeContextCode);

            const backendContextPath = path.join(process.cwd(), 'contexts', 'BackendContext.tsx');
            const backendContextCode = fs.readFileSync(backendContextPath, 'utf-8');
            contextsFolder?.file("BackendContext.tsx", backendContextCode);

            // Add types folder with backend types
            const typesFolder = zip.folder("types");
            const backendTypesPath = path.join(process.cwd(), 'types', 'backend.ts');
            const backendTypesCode = fs.readFileSync(backendTypesPath, 'utf-8');
            typesFolder?.file("backend.ts", backendTypesCode);

            const hasBackend = apiEndpoints && apiEndpoints.length > 0;

            if (hasBackend) {
                // Firebase Config
                if (firebaseConfig) {
                    libFolder?.file("firebase.ts", generateFirebaseConfig(firebaseConfig));
                    zip.file(".env.local", generateEnvFile(firebaseConfig));
                }

                // Pipeline Executor & Delegates
                libFolder?.file("pipeline-executor.ts", generatePipelineExecutor());
                libFolder?.file("pipeline-delegates.ts", generatePipelineDelegate());

                // API Routes - Create a catch-all route that handles all endpoints
                const appApiFolder = appFolder?.folder("api")?.folder("backend")?.folder("[...path]");
                
                // Generate a single catch-all route that handles all endpoints
                const allEndpoints = apiEndpoints.filter((e: any) => e.isEnabled);
                
                const catchAllRoute = `import { NextRequest, NextResponse } from "next/server";
import { executePipeline } from "@/lib/pipeline-executor";
import { createFirestoreDelegate } from "@/lib/pipeline-delegates";

// All API endpoints configuration
const ENDPOINTS = ${JSON.stringify(allEndpoints, null, 2)};

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "PUT");
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Reconstruct the path from params
    const requestPath = "/" + (params.path?.join("/") || "");
    
    console.log(\`[API] \${method} \${requestPath}\`);
    
    // Find matching endpoint
    const endpoint = ENDPOINTS.find(
      (e: any) => e.path === requestPath && e.method === method
    );

    if (!endpoint) {
      console.error(\`[API] Endpoint not found: \${method} \${requestPath}\`);
      console.log("[API] Available endpoints:", ENDPOINTS.map((e: any) => \`\${e.method} \${e.path}\`));
      return NextResponse.json(
        { error: \`Endpoint not found: \${method} \${requestPath}\` },
        { status: 404 }
      );
    }

    console.log(\`[API] Found endpoint: \${endpoint.name}\`);

    // If not using pipeline, return mock response
    if (!endpoint.usePipeline) {
      console.log("[API] Returning mock response");
      return NextResponse.json(
        endpoint.mockResponse || { message: "Success" },
        { status: endpoint.statusCode || 200 }
      );
    }

    // Parse request data
    let body: Record<string, any> = {};
    try {
      if (method !== "GET") {
        body = await request.json();
        console.log("[API] Request body:", body);
      }
    } catch (err) {
      console.log("[API] No body or invalid JSON");
    }

    const query: Record<string, any> = {};
    request.nextUrl.searchParams.forEach((v, k) => { query[k] = v; });

    const headers: Record<string, string> = {};
    request.headers.forEach((v, k) => { headers[k] = v; });

    console.log("[API] Executing pipeline with", endpoint.pipeline?.length || 0, "steps");

    // Execute pipeline
    const delegate = createFirestoreDelegate();
    const result = await executePipeline(
      endpoint.pipeline || [],
      { body, query, headers },
      delegate,
      endpoint.nodeEdges || []
    );

    console.log("[API] Pipeline result:", result);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
`;
                
                appApiFolder?.file("route.ts", catchAllRoute);

                // Add a test page to help users verify their backend is working
                const testPageFolder = appFolder?.folder("api-test");
                const testPage = `"use client";

import { useState } from "react";

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoints = ${JSON.stringify(allEndpoints.map((e: any) => ({
    name: e.name,
    path: e.path,
    method: e.method,
    usePipeline: e.usePipeline
  })), null, 2)};

  const testEndpoint = async (endpoint: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(\`/api/backend\${endpoint.path}\`, {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: endpoint.method !== "GET" ? JSON.stringify({ test: true }) : undefined,
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>API Endpoint Tester</h1>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Test your backend endpoints to verify they're working correctly.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {endpoints.map((endpoint: any, i: number) => (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor: endpoint.method === "GET" ? "#10b981" : "#3b82f6",
                  color: "white",
                }}
              >
                {endpoint.method}
              </span>
              <code style={{ fontSize: "14px" }}>{endpoint.path}</code>
            </div>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "0.5rem" }}>
              {endpoint.name}
            </p>
            <p style={{ fontSize: "12px", color: "#999", marginBottom: "1rem" }}>
              Mode: {endpoint.usePipeline ? "Pipeline" : "Mock"}
            </p>
            <button
              onClick={() => testEndpoint(endpoint)}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#3b82f6",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Test Endpoint
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#fee", borderRadius: "8px", color: "#c00" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Response:</h3>
          <div style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px", overflow: "auto" }}>
            <p><strong>Status:</strong> {result.status}</p>
            <pre style={{ marginTop: "1rem", fontSize: "12px" }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div style={{ marginTop: "3rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Troubleshooting</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.6", color: "#666" }}>
          <li>Check browser console for detailed logs</li>
          <li>Verify Firebase config in .env.local (if using pipeline mode)</li>
          <li>Make sure dev server is running: npm run dev</li>
          <li>Check that endpoint paths match exactly</li>
        </ul>
      </div>
    </div>
  );
}
`;
                testPageFolder?.file("page.tsx", testPage);
            }

            // Add config files
            const extraDeps = hasBackend ? getBackendDependencies() : {};
            zip.file("package.json", generatePackageJson(projectName, extraDeps));
            zip.file("next.config.js", generateNextConfig());
            zip.file("tailwind.config.js", generateTailwindConfig());
            zip.file("README.md", generateREADME(projectName, hasBackend));

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
