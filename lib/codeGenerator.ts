import { ComponentDefinition } from "@/types/editor";

export function generateHTML(components: ComponentDefinition[]): string {
    const renderComponent = (component: ComponentDefinition): string => {
        const { type, props, children } = component;

        switch (type) {
            case "Header":
                return `
          <header class="header ${props.sticky ? "sticky" : ""} ${props.shadow ? "shadow" : ""
                    }">
            ${children.map(renderComponent).join("")}
          </header>
        `;

            case "Navbar":
                const links = props.links || [];
                return `
          <nav class="navbar">
            <div class="navbar-brand">${props.logoText || "Brand"}</div>
            
            <!-- Mobile menu button -->
            <button class="navbar-toggle" onclick="toggleMobileMenu()">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
            
            <!-- Desktop navigation -->
            <div class="navbar-menu" id="navbar-menu">
              <ul class="navbar-nav">
                ${links
                        .map(
                            (link: any) =>
                                `<li><a href="${link.href}">${link.text}</a></li>`
                        )
                        .join("")}
              </ul>
              ${props.ctaText
                        ? `<a href="${props.ctaLink || "#"}" class="navbar-cta">${props.ctaText
                        }</a>`
                        : ""
                    }
            </div>
          </nav>
        `;

            case "Hero":
                return `
          <section class="hero" style="background-color: ${props.backgroundColor || "#f8fafc"
                    }">
            <div class="hero-content">
              <h1 class="hero-title">${props.title || "Hero Title"}</h1>
              <p class="hero-description">${props.description || "Hero description"
                    }</p>
              ${props.primaryButtonText
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

                const buttonHtml = `<button class="btn btn-${variant}${sizeClass}${fullWidthClass}"${disabledAttr}>${props.text || "Button"
                    }</button>`;

                if (props.href && !props.disabled) {
                    return `<a href="${props.href}">${buttonHtml}</a>`;
                }

                return buttonHtml;

            case "Text":
                const tag = props.tag || "p";
                return `<${tag} class="text text-${props.size || "base"}">${props.content || "Text content"
                    }</${tag}>`;

            case "Image":
                return `<img src="${props.src || ""}" alt="${props.alt || ""
                    }" class="image" />`;

            case "Container":
                return `
          <div class="container container-${props.maxWidth || "xl"} padding-${props.padding || "md"
                    }">
            ${children.map(renderComponent).join("")}
          </div>
        `;

            case "Section":
                return `
          <section class="section padding-${props.padding || "lg"}">
            <div class="section-content max-width-${props.maxWidth || "xl"}">
              ${children.map(renderComponent).join("")}
            </div>
          </section>
        `;

            case "Grid":
                const isResponsive = props.responsive !== false;
                const columns = props.columns || 3;
                let gridClass = "";

                if (isResponsive) {
                    // Responsive grid classes
                    switch (columns) {
                        case 1:
                            gridClass = "grid-cols-1";
                            break;
                        case 2:
                            gridClass = "grid-cols-1 md:grid-cols-2";
                            break;
                        case 3:
                            gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
                            break;
                        case 4:
                            gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
                            break;
                        case 5:
                            gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
                            break;
                        case 6:
                            gridClass = "grid-cols-1 md:grid-cols-3 lg:grid-cols-6";
                            break;
                        default:
                            gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
                    }
                } else {
                    gridClass = `grid-cols-${columns}`;
                }

                return `
          <div class="grid ${gridClass} gap-${props.gap || "md"}">
            ${children.map(renderComponent).join("")}
          </div>
        `;

            case "Card":
                return `
          <div class="card card-${props.variant || "default"}">
            ${props.image
                        ? `<img src="${props.image}" alt="${props.title || ""
                        }" class="card-image" />`
                        : ""
                    }
            <div class="card-content">
              <h3 class="card-title">${props.title || "Card Title"}</h3>
              <p class="card-description">${props.description || "Card description"
                    }</p>
              ${props.buttonText
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
              <p class="footer-copyright">${props.copyright || "© 2024 All rights reserved"
                    }</p>
            </div>
          </footer>
        `;

            case "Form":
                const fields = props.fields || [];
                return `
          <div class="form-container">
            ${props.title ? `<h2 class="form-title">${props.title}</h2>` : ""}
            ${props.description
                        ? `<p class="form-description">${props.description}</p>`
                        : ""
                    }
            <form action="${props.action || "#"}" method="${props.method || "POST"
                    }" class="form">
              ${fields
                        .map(
                            (field: any) => `
                <div class="form-field">
                  <label for="${field.id}">${field.label}</label>
                  ${field.type === "textarea"
                                    ? `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea>`
                                    : `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />`
                                }
                </div>
              `
                        )
                        .join("")}
              <button type="submit" class="form-submit">${props.submitText || "Submit"
                    }</button>
            </form>
          </div>
        `;

            case "Video":
                if (props.youtubeId) {
                    return `
            <div class="video-container aspect-${props.aspectRatio || "16-9"}">
              <iframe src="https://www.youtube.com/embed/${props.youtubeId
                        }" title="${props.title || "Video"}" allowfullscreen></iframe>
            </div>
          `;
                }
                if (props.src) {
                    return `
            <video src="${props.src}" ${props.controls !== false ? "controls" : ""
                        } ${props.autoplay ? "autoplay" : ""} ${props.muted ? "muted" : ""
                        } ${props.loop ? "loop" : ""} class="video"></video>
          `;
                }
                return "";

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

export function generateCSS(): string {
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
    position: relative;
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
}

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.navbar-nav {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
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

/* Mobile Menu Toggle */
.navbar-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    gap: 0.25rem;
}

.hamburger-line {
    width: 1.5rem;
    height: 2px;
    background: #1f2937;
    transition: all 0.3s ease;
}

/* Mobile Styles */
@media (max-width: 768px) {
    .navbar-toggle {
        display: flex;
    }
    
    .navbar-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid #e5e7eb;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        padding: 1rem 2rem;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .navbar-menu.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
    }
    
    .navbar-nav {
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }
    
    .navbar-nav a {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f3f4f6;
    }
    
    .navbar-cta {
        margin-top: 1rem;
        text-align: center;
    }
    
    /* Hamburger Animation */
    .navbar-toggle.active .hamburger-line:nth-child(1) {
        transform: rotate(45deg) translate(0.375rem, 0.375rem);
    }
    
    .navbar-toggle.active .hamburger-line:nth-child(2) {
        opacity: 0;
    }
    
    .navbar-toggle.active .hamburger-line:nth-child(3) {
        transform: rotate(-45deg) translate(0.375rem, -0.375rem);
    }
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
    border-radius: 0.5rem;
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
    border-radius: 0.5rem;
    gap: 0.375rem;
    padding: 0 0.75rem;
}

.btn-lg {
    height: 2.5rem;
    border-radius: 0.5rem;
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

.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }

/* Image Styles */
.image {
    max-width: 100%;
    width: 100%;
    height: auto;
    border-radius: 0.375rem;
}

/* Container Styles */
.container {
    margin: 0 auto;
    padding: 0 1rem;
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }

.padding-none { padding: 0; }
.padding-sm { padding: 1rem; }
.padding-md { padding: 2rem; }
.padding-lg { padding: 3rem; }
.padding-xl { padding: 4rem; }

/* Section Styles */
.section {
    width: 100%;
}

.section-content {
    margin: 0 auto;
}

.max-width-sm { max-width: 640px; }
.max-width-md { max-width: 768px; }
.max-width-lg { max-width: 1024px; }
.max-width-xl { max-width: 1280px; }
.max-width-2xl { max-width: 1536px; }

/* Grid Styles */
.grid {
    display: grid;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }

.gap-none { gap: 0; }
.gap-sm { gap: 0.5rem; }
.gap-md { gap: 1rem; }
.gap-lg { gap: 2rem; }
.gap-xl { gap: 3rem; }

/* Card Styles */
.card {
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;
}

.card-default {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-bordered {
    border: 1px solid #e5e7eb;
}

.card-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-elevated {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
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

/* Form Styles */
.form-container {
    max-width: 500px;
    margin: 0 auto;
}

.form-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.form-description {
    color: #6b7280;
    margin-bottom: 1.5rem;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-weight: 500;
    font-size: 0.875rem;
}

.form-field input,
.form-field textarea {
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 1rem;
}

.form-field input:focus,
.form-field textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-submit {
    background: #3b82f6;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.form-submit:hover {
    background: #2563eb;
}

/* Video Styles */
.video-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 0.5rem;
}

.aspect-16-9 {
    padding-bottom: 56.25%;
}

.aspect-4-3 {
    padding-bottom: 75%;
}

.aspect-1-1 {
    padding-bottom: 100%;
}

.aspect-21-9 {
    padding-bottom: 42.86%;
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
}

.video {
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
}

/* Responsive Design */

/* Tablet and up (768px+) */
@media (min-width: 768px) {
    .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .md\\:grid-cols-3 {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .md\\:grid-cols-4 {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Desktop and up (1024px+) */
@media (min-width: 1024px) {
    .lg\\:grid-cols-3 {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .lg\\:grid-cols-4 {
        grid-template-columns: repeat(4, 1fr);
    }
    
    .lg\\:grid-cols-5 {
        grid-template-columns: repeat(5, 1fr);
    }
    
    .lg\\:grid-cols-6 {
        grid-template-columns: repeat(6, 1fr);
    }
}

/* Mobile styles */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }
}`;
}

export function generateJS(): string {
    return `// Mobile menu toggle function
function toggleMobileMenu() {
    const menu = document.getElementById('navbar-menu');
    const toggle = document.querySelector('.navbar-toggle');
    
    if (menu && toggle) {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
    }
}

// Basic interactivity
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

    // Close mobile menu when clicking on links
    document.querySelectorAll('.navbar-nav a').forEach(link => {
        link.addEventListener('click', function() {
            const menu = document.getElementById('navbar-menu');
            const toggle = document.querySelector('.navbar-toggle');
            if (menu && toggle) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const navbar = document.querySelector('.navbar');
        const menu = document.getElementById('navbar-menu');
        const toggle = document.querySelector('.navbar-toggle');
        
        if (navbar && menu && toggle && !navbar.contains(e.target)) {
            menu.classList.remove('active');
            toggle.classList.remove('active');
        }
    });

    // Button click handlers (excluding navbar toggle)
    document.querySelectorAll('button:not(.navbar-toggle)').forEach(button => {
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
            alert('Form submitted! Check console for details.');
        });
    });
});`;
}
