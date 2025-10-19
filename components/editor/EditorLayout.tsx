"use client";

import { useState } from "react";
import { ComponentDefinition } from "@/types/editor";
import { HierarchyPanel } from "./HierarchyPanel";
import { ComponentPalette } from "./ComponentPalette";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { Download } from "lucide-react";

type Viewport = "desktop" | "tablet" | "mobile";

interface EditorLayoutProps {
  components: ComponentDefinition[];
  selectedComponentIds: string[];
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

export function EditorLayout({
  components,
  selectedComponentIds,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
}: EditorLayoutProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  const selectedComponent =
    selectedComponentIds.length === 1
      ? findComponentById(components, selectedComponentIds[0])
      : null;

  const getCanvasWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  const exportToZip = async () => {
    try {
      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Generate HTML
      const html = generateHTML(components);
      const css = generateCSS();
      const js = generateJS();

      // Add files to zip
      zip.file("index.html", html);
      zip.file("styles.css", css);
      zip.file("script.js", js);

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-export.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Split between Hierarchy and Components */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Hierarchy Panel - Top Half */}
        <div className="flex-1 border-b border-gray-200 min-h-0 overflow-hidden">
          <HierarchyPanel
            components={components}
            selectedComponentIds={selectedComponentIds}
            onSelectComponent={onSelectComponent}
            onDeleteComponent={onDeleteComponent}
          />
        </div>

        {/* Component Palette - Bottom Half */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ComponentPalette />
        </div>
      </div>

      {/* Canvas - Center */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Canvas</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewport("desktop")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "desktop"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewport("tablet")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "tablet"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewport("mobile")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewport === "mobile"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Viewport indicator */}
            <div className="text-xs text-gray-500 ml-4">
              {viewport === "desktop" && "1200px+"}
              {viewport === "tablet" && "768px"}
              {viewport === "mobile" && "375px"}
            </div>
          </div>

          {/* Export Button */}
          <div className="ml-auto">
            <button
              onClick={exportToZip}
              className="flex items-center space-x-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div
            className="mx-auto transition-all duration-300 ease-in-out"
            style={{
              width: getCanvasWidth(),
              maxWidth: viewport === "desktop" ? "1200px" : getCanvasWidth(),
            }}
          >
            <Canvas
              components={components}
              selectedComponentIds={selectedComponentIds}
              onSelectComponent={onSelectComponent}
            />
          </div>
        </div>
      </div>

      {/* Properties Panel - Right */}
      <div className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden">
        <PropertiesPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={onUpdateComponent}
          onDeleteComponent={onDeleteComponent}
          onDuplicateComponent={onDuplicateComponent}
        />
      </div>
    </div>
  );
}

function findComponentById(
  components: ComponentDefinition[],
  id: string
): ComponentDefinition | null {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }

    const found = findComponentById(component.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}

function generateHTML(components: ComponentDefinition[]): string {
  const renderComponent = (component: ComponentDefinition): string => {
    const { type, props, children } = component;

    switch (type) {
      case "Header":
        return `
          <header class="header ${props.sticky ? "sticky" : ""} ${
          props.shadow ? "shadow" : ""
        }">
            ${children.map(renderComponent).join("")}
          </header>
        `;

      case "Navbar":
        const links = props.links || [];
        return `
          <nav class="navbar">
            <div class="navbar-brand">${props.logoText || "Brand"}</div>
            <ul class="navbar-nav">
              ${links
                .map(
                  (link: any) =>
                    `<li><a href="${link.href}">${link.text}</a></li>`
                )
                .join("")}
            </ul>
            ${
              props.ctaText
                ? `<a href="${props.ctaLink || "#"}" class="navbar-cta">${
                    props.ctaText
                  }</a>`
                : ""
            }
          </nav>
        `;

      case "Hero":
        return `
          <section class="hero" style="background-color: ${
            props.backgroundColor || "#f8fafc"
          }">
            <div class="hero-content">
              <h1 class="hero-title">${props.title || "Hero Title"}</h1>
              <p class="hero-description">${
                props.description || "Hero description"
              }</p>
              ${
                props.primaryButtonText
                  ? `<button class="hero-button">${props.primaryButtonText}</button>`
                  : ""
              }
            </div>
          </section>
        `;

      case "Button":
        const variant = props.variant || "default";
        const size = props.size || "default";
        const sizeClass = size !== "default" ? ` btn-${size}` : "";
        const fullWidthClass = props.fullWidth ? " w-full" : "";
        const disabledAttr = props.disabled ? " disabled" : "";

        const buttonHtml = `<button class="btn btn-${variant}${sizeClass}${fullWidthClass}"${disabledAttr}>${
          props.text || "Button"
        }</button>`;

        if (props.href && !props.disabled) {
          return `<a href="${props.href}">${buttonHtml}</a>`;
        }

        return buttonHtml;

      case "Text":
        const tag = props.tag || "p";
        return `<${tag} class="text text-${props.size || "base"}">${
          props.content || "Text content"
        }</${tag}>`;

      case "Image":
        return `<img src="${props.src || ""}" alt="${
          props.alt || ""
        }" class="image" />`;

      case "Container":
        return `
          <div class="container container-${props.maxWidth || "xl"} padding-${
          props.padding || "md"
        }">
            ${children.map(renderComponent).join("")}
          </div>
        `;

      case "Grid":
        return `
          <div class="grid grid-cols-${props.columns || 3} gap-${
          props.gap || "md"
        }">
            ${children.map(renderComponent).join("")}
          </div>
        `;

      case "Card":
        return `
          <div class="card card-${props.variant || "default"}">
            ${
              props.image
                ? `<img src="${props.image}" alt="${
                    props.title || ""
                  }" class="card-image" />`
                : ""
            }
            <div class="card-content">
              <h3 class="card-title">${props.title || "Card Title"}</h3>
              <p class="card-description">${
                props.description || "Card description"
              }</p>
              ${
                props.buttonText
                  ? `<button class="card-button">${props.buttonText}</button>`
                  : ""
              }
            </div>
          </div>
        `;

      case "Footer":
        return `
          <footer class="footer">
            <div class="footer-content">
              <div class="footer-brand">${props.logoText || "Brand"}</div>
              <p class="footer-copyright">${
                props.copyright || "© 2024 All rights reserved"
              }</p>
            </div>
          </footer>
        `;

      default:
        return `<div class="component-${type.toLowerCase()}">${children
          .map(renderComponent)
          .join("")}</div>`;
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${components.map(renderComponent).join("")}
    <script src="script.js"></script>
</body>
</html>`;
}

function generateCSS(): string {
  return `/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

/* Header Styles */
.header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
}

.header.sticky {
    position: sticky;
    top: 0;
    z-index: 100;
}

.header.shadow {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Navbar Styles */
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
}

.navbar-nav {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.navbar-nav a {
    text-decoration: none;
    color: #6b7280;
    font-weight: 500;
    transition: color 0.2s;
}

.navbar-nav a:hover {
    color: #1f2937;
}

.navbar-cta {
    background: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.2s;
}

.navbar-cta:hover {
    background: #2563eb;
}

/* Hero Styles */
.hero {
    padding: 4rem 2rem;
    text-align: center;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero-title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #1f2937;
}

.hero-description {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 2rem;
}

.hero-button {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.hero-button:hover {
    background: #2563eb;
}

/* Button Styles */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    white-space: nowrap;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    outline: none;
    border: 1px solid transparent;
    height: 2.25rem;
    padding: 0.5rem 1rem;
}

.btn:disabled {
    pointer-events: none;
    opacity: 0.5;
}

.btn-default {
    background: hsl(223 90% 45%);
    color: hsl(210 40% 98%);
}

.btn-default:hover {
    background: hsl(223 90% 40%);
}

.btn-destructive {
    background: hsl(0, 100%, 50%);
    color: white;
}

.btn-destructive:hover {
    background: hsl(0, 100%, 45%);
}

.btn-outline {
    border: 1px solid hsl(214.3 31.8% 91.4%);
    background: hsl(0 0% 100%);
    color: hsl(222.2 84% 4.9%);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-outline:hover {
    background: hsl(224 100% 95%);
    color: hsl(22, 90% 45%);
}

.btn-secondary {
    background: hsl(210 40% 96.1%);
    color: hsl(222.2 47.4% 11.2%);
}

.btn-secondary:hover {
    background: hsl(210 40% 92%);
}

.btn-ghost {
    background: transparent;
    color: hsl(222.2 84% 4.9%);
}

.btn-ghost:hover {
    background: hsl(224 100% 95%);
    color: hsl(22, 90% 45%);
}

.btn-link {
    background: transparent;
    color: hsl(223 90% 45%);
    text-decoration: underline;
    text-underline-offset: 4px;
}

.btn-link:hover {
    text-decoration: none;
}

/* Button Sizes */
.btn-sm {
    height: 2rem;
    border-radius: 0.375rem;
    gap: 0.375rem;
    padding: 0 0.75rem;
}

.btn-lg {
    height: 2.5rem;
    border-radius: 0.375rem;
    padding: 0 1.5rem;
}

/* Utility Classes */
.w-full {
    width: 100%;
}

/* Text Styles */
.text {
    margin-bottom: 1rem;
}

.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }

/* Image Styles */
.image {
    max-width: 100%;
    height: auto;
    border-radius: 0.375rem;
}

/* Container Styles */
.container {
    margin: 0 auto;
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }

.padding-sm { padding: 1rem; }
.padding-md { padding: 2rem; }
.padding-lg { padding: 3rem; }

/* Grid Styles */
.grid {
    display: grid;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

.gap-sm { gap: 0.5rem; }
.gap-md { gap: 1rem; }
.gap-lg { gap: 2rem; }

/* Card Styles */
.card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-content {
    padding: 1.5rem;
}

.card-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #1f2937;
}

.card-description {
    color: #6b7280;
    margin-bottom: 1rem;
}

.card-button {
    background: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
}

/* Footer Styles */
.footer {
    background: #1f2937;
    color: white;
    padding: 2rem;
    text-align: center;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

.footer-brand {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.footer-copyright {
    color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
    }
    
    .navbar-nav {
        gap: 1rem;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .grid-cols-3 {
        grid-template-columns: 1fr;
    }
    
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
}`;
}

function generateJS(): string {
  return `// Basic interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Button click handlers
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            // Add your custom button logic here
            console.log('Button clicked:', this.textContent);
        });
    });

    // Form submission (if any forms exist)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form submission logic here
            console.log('Form submitted');
        });
    });
});`;
}
