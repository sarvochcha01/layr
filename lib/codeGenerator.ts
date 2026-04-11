import { ComponentDefinition } from "@/types/editor";

// Generate inline styles for custom properties with defaults
function getInlineStyles(props: Record<string, any>, defaults?: { backgroundColor?: string; textColor?: string }): string {
    const styles: string[] = [];

    const bgColor = props.backgroundColor || defaults?.backgroundColor;
    const txtColor = props.textColor || defaults?.textColor;

    if (bgColor) styles.push(`background-color: ${bgColor}`);
    if (txtColor) styles.push(`color: ${txtColor}`);
    if (props.width && props.width !== 'auto') styles.push(`width: ${props.width}`);
    if (props.height && props.height !== 'auto') styles.push(`height: ${props.height}`);

    return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
}

export function generateHTML(components: ComponentDefinition[], allPages?: any[]): string {
    // Helper to convert internal page links to proper hrefs
    const convertLink = (href: string): string => {
        if (!href || !allPages) return href;

        if (href.startsWith('page:')) {
            const pageId = href.substring(5);
            const page = allPages.find(p => p.id === pageId);
            if (page) {
                if (page.slug) return `${page.slug}.html`;
                else if (page.path) {
                    const pathName = page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-");
                    return `${pathName}.html`;
                } else return `${page.id}.html`;
            }
        }

        if (href.startsWith('/') && !href.includes('.')) {
            const page = allPages.find(p => p.path === href);
            if (page) {
                if (page.slug) return `${page.slug}.html`;
                else {
                    const pathName = href === "/" ? "index" : href.replace(/^\//, "").replace(/\//g, "-");
                    return `${pathName}.html`;
                }
            }
        }

        return href;
    };

    const renderComponent = (component: ComponentDefinition): string => {
        const { type, props, children } = component;

        switch (type) {
            case "Header":
                const headerClasses = `w-full ${props.sticky ? 'sticky top-0 z-50' : ''} ${props.shadow ? 'shadow-sm' : ''}`;
                return `
<header class="${headerClasses}" style="background-color: ${props.backgroundColor || 'rgba(255,255,255,0.8)'}; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.06);">
    ${children.map(renderComponent).join("")}
</header>`;

            case "Navbar":
                const links = props.links || [];
                const ctaButton = (props.ctaText && props.ctaLink)
                    ? `<a href="${convertLink(props.ctaLink)}" class="navbar-cta">${props.ctaText}</a>`
                    : '';
                const logoText = props.logoText || props.brandText || "Brand";
                const navTheme = props.theme || 'light';

                return `
<nav class="navbar ${navTheme === 'dark' ? 'navbar-dark' : 'navbar-light'}">
    <div class="navbar-logo">${logoText}</div>
    <div class="navbar-links">
        ${links.map((link: any) => `<a href="${convertLink(link.href)}" class="navbar-link">${link.text}</a>`).join('')}
    </div>
    ${ctaButton}
</nav>`;

            case "Hero":
                const heroAlign = props.alignment || 'center';
                return `
<section class="hero hero-${heroAlign}" style="${props.backgroundColor ? `background-color: ${props.backgroundColor}` : 'background-color: #0f172a'}; ${props.textColor ? `color: ${props.textColor}` : 'color: #f8fafc'}; ${props.backgroundImage ? `background-image: url(${props.backgroundImage}); background-size: cover; background-position: center;` : ''}">
    <div class="hero-gradient-orb hero-gradient-orb-1"></div>
    <div class="hero-gradient-orb hero-gradient-orb-2"></div>
    ${props.backgroundImage ? '<div class="hero-overlay"></div>' : ''}
    <div class="hero-content">
        ${props.subtitle ? `<span class="hero-badge">${props.subtitle}</span>` : ''}
        <h1 class="hero-title">${props.title || "Build something amazing today"}</h1>
        <p class="hero-description">${props.description || "Create stunning websites in minutes with our intuitive drag-and-drop builder."}</p>
        <div class="hero-buttons">
            <a href="${convertLink(props.primaryButtonLink || '#')}" class="btn-primary">${props.primaryButtonText || "Get Started Free"}</a>
            ${props.secondaryButtonText ? `<a href="${convertLink(props.secondaryButtonLink || '#')}" class="btn-secondary">${props.secondaryButtonText}</a>` : ''}
        </div>
    </div>
</section>`;

            case "Section":
                const paddingMap = { none: '', sm: 'py-8 px-4', md: 'py-16 px-6', lg: 'py-24 px-8', xl: 'py-32 px-12' };
                const maxWidthMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-4xl', xl: 'max-w-6xl', '2xl': 'max-w-7xl', full: 'max-w-full' };
                return `
<section class="w-full ${paddingMap[props.padding as keyof typeof paddingMap] || paddingMap.lg}"${getInlineStyles(props)}>
    <div class="${maxWidthMap[props.maxWidth as keyof typeof maxWidthMap] || maxWidthMap.xl} mx-auto">
        ${children.map(renderComponent).join("")}
    </div>
</section>`;

            case "Container":
                const containerMaxWidth = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl', '5xl': 'max-w-5xl', '6xl': 'max-w-6xl', '7xl': 'max-w-7xl', full: 'max-w-full' };
                const containerPadding = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8', xl: 'p-12' };
                const containerDisplay = props.display === 'flex' ? 'flex' : '';
                const containerFlexDir = { row: 'flex-row', column: 'flex-col', 'row-reverse': 'flex-row-reverse', 'column-reverse': 'flex-col-reverse' };
                const containerFlexWrap = { nowrap: 'flex-nowrap', wrap: 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse' };
                const containerJustify = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' };
                const containerAlign = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
                const containerGap = { none: '', sm: 'gap-2', md: 'gap-4', lg: 'gap-6', xl: 'gap-8' };

                const containerClasses = [
                    props.display !== 'flex' && (containerMaxWidth[props.maxWidth as keyof typeof containerMaxWidth] || containerMaxWidth.xl),
                    containerPadding[props.padding as keyof typeof containerPadding] || containerPadding.md,
                    props.display !== 'flex' && 'mx-auto',
                    containerDisplay,
                    props.display === 'flex' && (containerFlexDir[props.flexDirection as keyof typeof containerFlexDir] || containerFlexDir.row),
                    props.display === 'flex' && (containerFlexWrap[props.flexWrap as keyof typeof containerFlexWrap] || containerFlexWrap.nowrap),
                    props.display === 'flex' && (containerJustify[props.justifyContent as keyof typeof containerJustify] || containerJustify.start),
                    props.display === 'flex' && (containerAlign[props.alignItems as keyof typeof containerAlign] || containerAlign.start),
                    props.display === 'flex' && (containerGap[props.gap as keyof typeof containerGap] || ''),
                ].filter(Boolean).join(' ');

                return `
<div class="${containerClasses}"${getInlineStyles(props)}>
    ${children.map(renderComponent).join("")}
</div>`;

            case "Grid":
                const columns = props.columns || 3;
                const responsive = props.responsive !== false;
                let gridCols = '';
                if (responsive) {
                    const responsiveMap: Record<number, string> = {
                        1: 'grid-cols-1',
                        2: 'grid-cols-1 md:grid-cols-2',
                        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
                        5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
                        6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
                    };
                    gridCols = responsiveMap[columns] || responsiveMap[3];
                } else {
                    gridCols = `grid-cols-${columns}`;
                }
                const gapMap: Record<string, string> = { none: 'gap-0', sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' };
                const gridGapClass = props.gap === 'custom' ? '' : (gapMap[props.gap as keyof typeof gapMap] || gapMap.md);
                const gridGapStyle = props.gap === 'custom' && props.gapCustom ? ` style="gap: ${props.gapCustom}"` : '';
                return `
<div class="grid ${gridCols} ${gridGapClass}"${gridGapStyle}${getInlineStyles(props)}>
    ${children.map(renderComponent).join("")}
</div>`;

            case "Card":
                return `
<div class="premium-card"${getInlineStyles(props, { backgroundColor: '#ffffff', textColor: '#1e293b' })}>
    ${props.image ? `<div class="premium-card-image"><img src="${props.image}" alt="${props.title || ''}" /></div>` : ''}
    ${props.icon ? `<div class="premium-card-icon">${props.icon}</div>` : ''}
    <div class="premium-card-content">
        <h3 class="premium-card-title">${props.title || "Card Title"}</h3>
        <p class="premium-card-desc">${props.description || "A short description of this card's content."}</p>
        ${props.buttonText ? `<a href="${convertLink(props.buttonLink || '#')}" class="premium-card-link">${props.buttonText} →</a>` : ''}
    </div>
    ${children.map(renderComponent).join("")}
</div>`;

            case "Button":
                const btnVariantClasses: Record<string, string> = {
                    default: 'btn-primary',
                    destructive: 'btn-destructive',
                    outline: 'btn-outline',
                    secondary: 'btn-secondary-solid',
                    ghost: 'btn-ghost',
                    link: 'btn-link',
                };
                const btnSizeClasses: Record<string, string> = {
                    sm: 'btn-sm',
                    default: '',
                    lg: 'btn-lg',
                };
                const btnClass = `${btnVariantClasses[props.variant || 'default']} ${btnSizeClasses[props.size || 'default']} ${props.fullWidth ? 'w-full' : ''}`.trim();
                const button = `<button class="${btnClass}"${props.disabled ? ' disabled' : ''}${getInlineStyles(props)}>${props.text || "Button"}</button>`;
                return props.href && !props.disabled ? `<a href="${convertLink(props.href)}">${button}</a>` : button;

            case "Text":
                const sizeMap: Record<string, string> = {
                    xs: 'text-xs', sm: 'text-sm', base: 'text-base',
                    lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl'
                };
                const tag = props.tag || 'p';
                return `<${tag} class="${sizeMap[props.size || 'base'] || sizeMap.base}"${getInlineStyles(props)}>${props.content || "Text content"}</${tag}>`;

            case "Image":
                return `<img src="${props.src || ''}" alt="${props.alt || ''}" class="w-full h-auto rounded-2xl"${getInlineStyles(props)} />`;

            case "Footer":
                const footerSections = props.sections || [];
                const footerSocialLinks = props.socialLinks || [];
                const currentYear = new Date().getFullYear();
                const defaultCopyright = `© ${currentYear} ${props.logoText || 'Brand'}. All rights reserved.`;

                return `
<footer class="premium-footer" style="background-color: ${props.backgroundColor || '#0f172a'}; color: ${props.textColor || '#e2e8f0'};">
    <div class="footer-inner">
        <div class="footer-grid">
            <div class="footer-brand">
                ${props.logo ? `<img src="${props.logo}" alt="Logo" class="footer-logo" />` : `<span class="footer-logotext">${props.logoText || "Brand"}</span>`}
                ${props.description ? `<p class="footer-desc">${props.description}</p>` : ''}
                ${footerSocialLinks.length > 0 ? `
                <div class="footer-social">
                    ${footerSocialLinks.map((social: any) => `<a href="${social.href}" class="footer-social-link" target="_blank" rel="noopener noreferrer">${social.icon || social.platform.charAt(0).toUpperCase()}</a>`).join('')}
                </div>` : ''}
            </div>
            ${footerSections.map((section: any) => `
            <div class="footer-section">
                <h3 class="footer-section-title">${section.title}</h3>
                <ul class="footer-section-links">
                    ${section.links.map((link: any) => `<li><a href="${convertLink(link.href)}">${link.text}</a></li>`).join('')}
                </ul>
            </div>`).join('')}
        </div>
        <div class="footer-copyright">
            <p>${props.copyright || defaultCopyright}</p>
        </div>
    </div>
</footer>`;

            case "Feature":
                const featureLayout = props.layout || 'vertical';
                return `
<div class="premium-feature premium-feature-${featureLayout}">
    <div class="premium-feature-icon" style="background: linear-gradient(135deg, ${props.iconColor || '#6366f1'}15, ${props.iconColor || '#6366f1'}25); color: ${props.iconColor || '#6366f1'};">
        ${props.icon || '✨'}
    </div>
    <div class="premium-feature-content">
        <h3>${props.title || "Feature Title"}</h3>
        <p>${props.description || "Feature description goes here."}</p>
    </div>
</div>`;

            case "Testimonial":
                const stars = '★'.repeat(props.rating || 5) + '☆'.repeat(5 - (props.rating || 5));
                return `
<div class="premium-testimonial"${getInlineStyles(props)}>
    <div class="testimonial-quote-mark">"</div>
    <blockquote class="testimonial-quote">${props.quote || "This product has completely transformed how we work."}</blockquote>
    <div class="testimonial-stars">${stars}</div>
    <div class="testimonial-author">
        ${props.avatar ? `<img src="${props.avatar}" alt="${props.author}" class="testimonial-avatar" />` : `<div class="testimonial-avatar-fallback">${(props.author || 'A').charAt(0)}</div>`}
        <div>
            <div class="testimonial-name">${props.author || 'Sarah Johnson'}</div>
            <div class="testimonial-role">${props.role || 'Head of Design'}${props.company ? `, ${props.company}` : ''}</div>
        </div>
    </div>
</div>`;

            case "PricingCard":
                const pricingFeatures = props.features || [];
                return `
<div class="premium-pricing ${props.featured ? 'premium-pricing-featured' : ''}"${getInlineStyles(props, { backgroundColor: '#ffffff', textColor: '#1e293b' })}>
    ${props.featured ? '<div class="pricing-badge">Most Popular</div>' : ''}
    <div class="pricing-header">
        <h3>${props.title || "Pro Plan"}</h3>
        <div class="pricing-price">
            <span class="pricing-amount">${props.price || "$49"}</span>
            <span class="pricing-period">/${props.period || "month"}</span>
        </div>
        <p class="pricing-desc">${props.description || "Everything you need to scale"}</p>
    </div>
    <ul class="pricing-features">
        ${pricingFeatures.map((feature: any) => {
                    const text = typeof feature === 'string' ? feature : feature.text;
                    const included = typeof feature === 'string' ? true : feature.included;
                    return `
        <li class="${included ? '' : 'pricing-feature-disabled'}">
            <span class="pricing-check ${included ? 'pricing-check-yes' : 'pricing-check-no'}">${included ? '✓' : '×'}</span>
            <span>${text}</span>
        </li>`;
                }).join('')}
    </ul>
    <a href="${convertLink(props.buttonLink || '#')}" class="${props.featured ? 'btn-primary' : 'btn-outline'} w-full">${props.buttonText || 'Get Started'}</a>
</div>`;

            case "Stats":
                const statsData = props.stats || [];
                const statsAccent = props.accentColor || '#6366f1';
                return `
<div class="premium-stats"${getInlineStyles(props)}>
    ${statsData.map((stat: any) => `
    <div class="premium-stat">
        <div class="stat-value" style="background: linear-gradient(135deg, ${statsAccent}, ${lightenColor(statsAccent, 40)}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${stat.value}${stat.suffix || ''}</div>
        <div class="stat-label">${stat.label}</div>
    </div>
    `).join('')}
</div>`;

            case "CTA":
                return `
<div class="premium-cta" style="${props.backgroundColor ? `background-color: ${props.backgroundColor}` : 'background: linear-gradient(135deg, #4f46e5, #7c3aed)'}; color: ${props.textColor || '#ffffff'};">
    <div class="cta-pattern"></div>
    <div class="cta-content">
        <h2>${props.title || "Ready to get started?"}</h2>
        <p>${props.description || "Join thousands of teams building faster."}</p>
    </div>
    <div class="cta-buttons">
        <a href="${convertLink(props.primaryButtonLink || '#')}" class="cta-btn-primary">${props.primaryButtonText || "Start Free Trial"}</a>
        ${props.secondaryButtonText ? `<a href="${convertLink(props.secondaryButtonLink || '#')}" class="cta-btn-secondary">${props.secondaryButtonText}</a>` : ''}
    </div>
</div>`;

            case "Form":
                const fields = props.fields || [];
                return `
<div class="max-w-md mx-auto"${getInlineStyles(props)}>
    ${props.title ? `<h2 class="text-2xl font-bold mb-2" style="font-family: 'Inter', sans-serif; letter-spacing: -0.025em;">${props.title}</h2>` : ''}
    ${props.description ? `<p class="text-gray-500 mb-6 text-sm">${props.description}</p>` : ''}
    <form action="${props.action || '#'}" method="${props.method || 'POST'}" class="space-y-4">
        ${fields.map((field: any) => `
        <div class="space-y-1.5">
            <label for="${field.id}" class="block font-medium text-sm">${field.label}</label>
            ${field.type === 'textarea'
                    ? `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} class="form-input form-textarea"></textarea>`
                    : `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} class="form-input" />`
                }
        </div>
        `).join('')}
        <button type="submit" class="btn-primary w-full">${props.submitText || 'Submit'}</button>
    </form>
</div>`;

            case "Video":
                if (props.youtubeId) {
                    return `
<div class="relative w-full pb-[56.25%] rounded-2xl overflow-hidden shadow-lg"${getInlineStyles(props)}>
    <iframe src="https://www.youtube.com/embed/${props.youtubeId}" title="${props.title || 'Video'}" class="absolute top-0 left-0 w-full h-full" allowfullscreen></iframe>
</div>`;
                }
                if (props.src) {
                    return `<video src="${props.src}" ${props.controls !== false ? 'controls' : ''} ${props.autoplay ? 'autoplay' : ''} ${props.muted ? 'muted' : ''} ${props.loop ? 'loop' : ''} class="w-full h-auto rounded-2xl shadow-lg"${getInlineStyles(props)}></video>`;
                }
                return '';

            case "Accordion":
                const accordionItems = props.items || [];
                return `
<div class="w-full space-y-2"${getInlineStyles(props)}>
    ${accordionItems.map((item: any) => `
    <details class="accordion-item">
        <summary class="accordion-header">
            <span>${item.title}</span>
            <svg class="accordion-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
        </summary>
        <div class="accordion-body">${item.content}</div>
    </details>
    `).join('')}
</div>`;

            case "Tabs":
                const tabs = props.tabs || [];
                const tabsId = `tabs-${Math.random().toString(36).substr(2, 9)}`;
                return `
<div class="tabs-container" data-tabs-id="${tabsId}"${getInlineStyles(props)}>
    <div class="tabs-header">
        ${tabs.map((tab: any, idx: number) => `
        <button class="tab-button ${idx === 0 ? 'tab-active' : ''}" data-tab-index="${idx}" data-tabs-id="${tabsId}">${tab.label}</button>
        `).join('')}
    </div>
    ${tabs.map((tab: any, idx: number) => `
    <div class="tab-content ${idx !== 0 ? 'hidden' : ''}" data-tab-index="${idx}" data-tabs-id="${tabsId}">${tab.content}</div>
    `).join('')}
</div>`;

            case "Divider":
                return `<hr class="divider" style="border-color: ${props.color || 'rgba(0,0,0,0.08)'}; border-style: ${props.style || 'solid'}; border-top-width: ${props.thickness || '1'}px;" />`;

            case "Spacer":
                const spacerSizeMap = { xs: '8px', sm: '16px', md: '32px', lg: '64px', xl: '128px' };
                return `<div style="height: ${spacerSizeMap[props.size as keyof typeof spacerSizeMap] || spacerSizeMap.md}"></div>`;

            case "Badge":
                const badgeVariantClasses: Record<string, string> = {
                    default: 'badge-default',
                    success: 'badge-success',
                    warning: 'badge-warning',
                    error: 'badge-error',
                    info: 'badge-info',
                };
                return `<span class="badge ${badgeVariantClasses[props.variant as string] || badgeVariantClasses.default}"${getInlineStyles(props)}>${props.text || ''}</span>`;

            case "Alert":
                const alertIcons: Record<string, string> = { info: 'ℹ️', success: '✓', warning: '⚠️', error: '✕' };
                const alertV = props.variant || 'info';
                return `
<div class="premium-alert premium-alert-${alertV}"${getInlineStyles(props)}>
    <span class="alert-icon">${alertIcons[alertV] || alertIcons.info}</span>
    <div>
        <h4 class="alert-title">${props.title || ''}</h4>
        <p class="alert-message">${props.message || ''}</p>
    </div>
    ${props.dismissible ? '<button class="alert-dismiss">×</button>' : ''}
</div>`;

            default:
                return `<div class="p-4">${children.map(renderComponent).join("")}</div>`;
        }
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${components.map(renderComponent).join("\n")}
    <script src="script.js"></script>
</body>
</html>`;
}

function lightenColor(hex: string, amount: number): string {
    try {
        const num = parseInt(hex.replace("#", ""), 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
        const b = Math.min(255, (num & 0x0000FF) + amount);
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    } catch {
        return hex;
    }
}

export function generateCSS(): string {
    return `/* Premium Design System */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }

/* --- Navbar --- */
.navbar { display: flex; align-items: center; width: 100%; padding: 1rem 2rem; border-bottom: 1px solid rgba(0,0,0,0.06); }
.navbar-light { background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #1e293b; }
.navbar-dark { background: rgba(15,23,42,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #f8fafc; }
.navbar-logo { font-size: 1.125rem; font-weight: 700; letter-spacing: -0.025em; }
.navbar-links { display: flex; align-items: center; gap: 0.25rem; margin-left: auto; margin-right: 1rem; }
.navbar-link { padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; text-decoration: none; transition: all 0.2s; }
.navbar-light .navbar-link { color: #64748b; }
.navbar-light .navbar-link:hover { color: #1e293b; background: rgba(0,0,0,0.04); }
.navbar-dark .navbar-link { color: rgba(255,255,255,0.7); }
.navbar-dark .navbar-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
.navbar-cta { display: inline-flex; align-items: center; padding: 0.5rem 1.25rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; text-decoration: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; transition: all 0.3s; box-shadow: 0 2px 8px rgba(99,102,241,0.25); }
.navbar-cta:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.4); transform: translateY(-1px); }

/* --- Hero --- */
.hero { position: relative; display: flex; align-items: center; justify-content: center; min-height: 560px; width: 100%; padding: 6rem 2rem; overflow: hidden; }
.hero-center { text-align: center; }
.hero-left { text-align: left; }
.hero-right { text-align: right; }
.hero-gradient-orb { position: absolute; border-radius: 50%; }
.hero-gradient-orb-1 { top: -20%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, #6366f1 0%, transparent 70%); opacity: 0.2; }
.hero-gradient-orb-2 { bottom: -20%; right: -10%; width: 400px; height: 400px; background: radial-gradient(circle, #8b5cf6 0%, transparent 70%); opacity: 0.15; }
.hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
.hero-content { position: relative; z-index: 10; max-width: 56rem; margin: 0 auto; padding: 0 1rem; }
.hero-badge { display: inline-block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid rgba(165,180,252,0.3); color: #a5b4fc; background: rgba(99,102,241,0.1); margin-bottom: 1.5rem; }
.hero-title { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 1.5rem; }
.hero-description { font-size: 1.125rem; line-height: 1.75; opacity: 0.8; max-width: 40rem; margin-bottom: 2.5rem; }
.hero-center .hero-description { margin-left: auto; margin-right: auto; }
.hero-buttons { display: flex; flex-wrap: wrap; gap: 1rem; }
.hero-center .hero-buttons { justify-content: center; }

/* --- Buttons --- */
.btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 14px rgba(99,102,241,0.25); }
.btn-primary:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.4); transform: translateY(-1px); }
.btn-secondary, .btn-outline { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: inherit; cursor: pointer; transition: all 0.3s; }
.btn-secondary:hover, .btn-outline:hover { background: rgba(255,255,255,0.1); }
.btn-secondary-solid { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: #f1f5f9; color: #1e293b; border: none; cursor: pointer; transition: all 0.3s; }
.btn-secondary-solid:hover { background: #e2e8f0; }
.btn-ghost { display: inline-flex; align-items: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: transparent; border: none; cursor: pointer; transition: all 0.2s; }
.btn-ghost:hover { background: rgba(0,0,0,0.04); }
.btn-link { display: inline-flex; align-items: center; font-size: 0.9375rem; font-weight: 500; text-decoration: underline; color: #6366f1; background: none; border: none; cursor: pointer; }
.btn-destructive { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: #ef4444; color: #fff; border: none; cursor: pointer; transition: all 0.3s; }
.btn-sm { padding: 0.5rem 1.25rem; font-size: 0.8125rem; }
.btn-lg { padding: 1rem 2.5rem; font-size: 1rem; }
.w-full { width: 100%; text-align: center; }

/* --- Cards --- */
.premium-card { border-radius: 1rem; padding: 1.5rem; overflow: hidden; background: #fff; color: #1e293b; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.premium-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.1); transform: translateY(-4px); }
.premium-card-image { margin: -1.5rem -1.5rem 1.25rem -1.5rem; }
.premium-card-image img { width: 100%; height: 13rem; object-fit: cover; }
.premium-card-icon { width: 3rem; height: 3rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: rgba(99,102,241,0.1); color: #6366f1; margin-bottom: 1.25rem; }
.premium-card-title { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.025em; margin-bottom: 0.5rem; line-height: 1.3; }
.premium-card-desc { font-size: 0.875rem; line-height: 1.6; opacity: 0.6; margin-bottom: 0.75rem; }
.premium-card-link { font-size: 0.875rem; font-weight: 500; color: #6366f1; text-decoration: none; transition: opacity 0.2s; }
.premium-card-link:hover { opacity: 0.8; }

/* --- Feature --- */
.premium-feature { padding: 1.5rem; border-radius: 1rem; transition: all 0.3s; }
.premium-feature:hover { background: rgba(0,0,0,0.02); }
.premium-feature-vertical { text-align: center; }
.premium-feature-horizontal { display: flex; gap: 1.25rem; align-items: flex-start; }
.premium-feature-icon { width: 3rem; height: 3rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.premium-feature-vertical .premium-feature-icon { margin: 0 auto 1.25rem; }
.premium-feature-content h3 { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.025em; margin-bottom: 0.5rem; }
.premium-feature-content p { font-size: 0.875rem; line-height: 1.6; opacity: 0.6; }

/* --- Testimonial --- */
.premium-testimonial { padding: 2rem; border-radius: 1rem; background: #fff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06); transition: all 0.3s; }
.premium-testimonial:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.1); }
.testimonial-quote-mark { font-size: 3rem; font-family: serif; color: #6366f1; opacity: 0.3; line-height: 1; margin-bottom: 1rem; }
.testimonial-quote { font-size: 1rem; line-height: 1.75; margin-bottom: 1.5rem; }
.testimonial-stars { color: #f59e0b; font-size: 0.875rem; letter-spacing: 0.1em; margin-bottom: 1.25rem; }
.testimonial-author { display: flex; align-items: center; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.06); }
.testimonial-avatar { width: 2.5rem; height: 2.5rem; border-radius: 50%; object-fit: cover; }
.testimonial-avatar-fallback { width: 2.5rem; height: 2.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; background: rgba(99,102,241,0.1); color: #6366f1; }
.testimonial-name { font-size: 0.875rem; font-weight: 600; }
.testimonial-role { font-size: 0.75rem; opacity: 0.5; }

/* --- Pricing --- */
.premium-pricing { padding: 2rem; border-radius: 1rem; display: flex; flex-direction: column; background: #fff; color: #1e293b; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06); transition: all 0.3s; }
.premium-pricing:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.1); }
.premium-pricing-featured { border-color: rgba(99,102,241,0.3); box-shadow: 0 4px 12px rgba(99,102,241,0.15), 0 20px 50px rgba(99,102,241,0.1); transform: scale(1.02); }
.premium-pricing-featured:hover { box-shadow: 0 8px 24px rgba(99,102,241,0.2), 0 24px 60px rgba(99,102,241,0.15); }
.pricing-badge { text-align: center; margin-bottom: 1.25rem; }
.pricing-badge span, .premium-pricing-featured > .pricing-badge { display: inline-block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 1rem; border-radius: 9999px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
.pricing-header { text-align: center; margin-bottom: 2rem; }
.pricing-header h3 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.025em; margin-bottom: 1rem; }
.pricing-amount { font-size: 3rem; font-weight: 700; letter-spacing: -0.05em; }
.pricing-period { font-size: 0.875rem; opacity: 0.4; font-weight: 500; }
.pricing-desc { font-size: 0.875rem; opacity: 0.5; margin-top: 0.5rem; }
.pricing-features { list-style: none; padding: 0; margin-bottom: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.06); }
.pricing-features li { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; font-size: 0.875rem; }
.pricing-check { width: 1.25rem; height: 1.25rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; flex-shrink: 0; }
.pricing-check-yes { background: rgba(34,197,94,0.1); color: #22c55e; }
.pricing-check-no { background: #f1f5f9; color: #cbd5e1; }
.pricing-feature-disabled { opacity: 0.4; }

/* --- Stats --- */
.premium-stats { display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 2rem; padding: 3rem 2rem; }
.premium-stat { text-align: center; }
.stat-value { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.05em; margin-bottom: 0.5rem; }
.stat-label { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.5; }

/* --- CTA --- */
.premium-cta { border-radius: 1rem; padding: 4rem 2rem; position: relative; overflow: hidden; text-align: center; }
.cta-pattern { position: absolute; inset: 0; opacity: 0.1; background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%); }
.cta-content { position: relative; z-index: 1; margin-bottom: 2rem; }
.cta-content h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -0.025em; margin-bottom: 1rem; }
.cta-content p { font-size: 1.125rem; opacity: 0.85; max-width: 36rem; margin: 0 auto; }
.cta-buttons { position: relative; z-index: 1; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.cta-btn-primary { display: inline-flex; align-items: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; background: #fff; color: #4f46e5; transition: all 0.3s; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
.cta-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.cta-btn-secondary { display: inline-flex; align-items: center; padding: 0.75rem 2rem; border-radius: 9999px; font-size: 0.9375rem; font-weight: 500; text-decoration: none; border: 1px solid rgba(255,255,255,0.3); color: #fff; transition: all 0.3s; }
.cta-btn-secondary:hover { background: rgba(255,255,255,0.1); }

/* --- Footer --- */
.premium-footer { width: 100%; padding: 3rem 2rem 2rem; }
.footer-inner { max-width: 72rem; margin: 0 auto; }
.footer-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 2.5rem; }
@media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .footer-grid { grid-template-columns: repeat(4, 1fr); } }
.footer-brand { grid-column: span 1; }
@media (min-width: 640px) { .footer-brand { grid-column: span 2; } }
@media (min-width: 1024px) { .footer-brand { grid-column: span 1; } }
.footer-logotext { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: #fff; }
.footer-logo { height: 2rem; width: auto; }
.footer-desc { font-size: 0.875rem; line-height: 1.6; opacity: 0.6; margin-top: 1.25rem; max-width: 20rem; }
.footer-social { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
.footer-social-link { width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); text-decoration: none; transition: all 0.2s; }
.footer-social-link:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }
.footer-section-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #fff; margin-bottom: 1rem; }
.footer-section-links { list-style: none; padding: 0; }
.footer-section-links li { margin-bottom: 0.625rem; }
.footer-section-links a { font-size: 0.875rem; opacity: 0.5; text-decoration: none; color: inherit; transition: opacity 0.2s; }
.footer-section-links a:hover { opacity: 1; }
.footer-copyright { margin-top: 3rem; padding-top: 2rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
.footer-copyright p { font-size: 0.75rem; opacity: 0.4; letter-spacing: 0.025em; }

/* --- Accordion --- */
.accordion-item { border: 1px solid rgba(0,0,0,0.08); border-radius: 0.75rem; overflow: hidden; background: #fff; }
.accordion-header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 1rem 1.25rem; cursor: pointer; font-weight: 500; font-size: 0.9375rem; list-style: none; }
.accordion-header::-webkit-details-marker { display: none; }
.accordion-header::marker { display: none; }
.accordion-chevron { transition: transform 0.2s; }
details[open] .accordion-chevron { transform: rotate(180deg); }
.accordion-body { padding: 0 1.25rem 1rem; font-size: 0.875rem; line-height: 1.6; opacity: 0.7; }

/* --- Tabs --- */
.tabs-header { display: flex; border-bottom: 1px solid rgba(0,0,0,0.08); }
.tab-button { padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 500; background: none; border: none; cursor: pointer; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s; }
.tab-active { color: #6366f1; border-bottom-color: #6366f1; }
.tab-content { padding: 1.5rem 0; }
.hidden { display: none; }

/* --- Forms --- */
.form-input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 0.75rem; font-size: 0.875rem; font-family: inherit; transition: all 0.2s; outline: none; }
.form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-textarea { min-height: 100px; resize: vertical; }

/* --- Badges --- */
.badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.badge-default { background: #f1f5f9; color: #475569; }
.badge-success { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-warning { background: rgba(245,158,11,0.1); color: #d97706; }
.badge-error { background: rgba(239,68,68,0.1); color: #dc2626; }
.badge-info { background: rgba(99,102,241,0.1); color: #6366f1; }

/* --- Alerts --- */
.premium-alert { display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: 0.75rem; border: 1px solid; }
.premium-alert-info { background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.15); color: #4338ca; }
.premium-alert-success { background: rgba(34,197,94,0.05); border-color: rgba(34,197,94,0.15); color: #15803d; }
.premium-alert-warning { background: rgba(245,158,11,0.05); border-color: rgba(245,158,11,0.15); color: #b45309; }
.premium-alert-error { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.15); color: #b91c1c; }
.alert-icon { font-size: 1.25rem; flex-shrink: 0; }
.alert-title { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; }
.alert-message { font-size: 0.8125rem; opacity: 0.8; }
.alert-dismiss { font-size: 1.25rem; opacity: 0.5; cursor: pointer; background: none; border: none; margin-left: auto; }

/* --- Divider --- */
.divider { border: none; border-top: 1px solid rgba(0,0,0,0.08); margin: 1rem 0; }

/* --- Responsive --- */
@media (max-width: 640px) {
    .hero { padding: 4rem 1.5rem; min-height: 400px; }
    .hero-buttons { flex-direction: column; width: 100%; }
    .hero-buttons a, .hero-buttons button { width: 100%; text-align: center; }
    .premium-stats { flex-direction: column; gap: 1.5rem; }
    .cta-buttons { flex-direction: column; }
    .cta-buttons a { width: 100%; text-align: center; }
}`;
}

export function generateJS(): string {
    return `// Tab switching
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabsId = this.getAttribute('data-tabs-id');
            const tabIndex = this.getAttribute('data-tab-index');

            document.querySelectorAll('.tab-content[data-tabs-id="' + tabsId + '"]').forEach(content => {
                content.classList.add('hidden');
            });

            document.querySelectorAll('.tab-button[data-tabs-id="' + tabsId + '"]').forEach(btn => {
                btn.classList.remove('tab-active');
            });

            const selectedContent = document.querySelector('.tab-content[data-tabs-id="' + tabsId + '"][data-tab-index="' + tabIndex + '"]');
            if (selectedContent) {
                selectedContent.classList.remove('hidden');
            }

            this.classList.add('tab-active');
        });
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Form submission
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Form submitted successfully!');
    });
});`;
}
