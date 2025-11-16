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

        // Check if it's an internal page link (format: "page:pageId")
        if (href.startsWith('page:')) {
            const pageId = href.substring(5);
            const page = allPages.find(p => p.id === pageId);
            if (page) {
                // Support both slug and path fields
                if (page.slug) {
                    return `${page.slug}.html`;
                } else if (page.path) {
                    const pathName = page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-");
                    return `${pathName}.html`;
                } else {
                    return `${page.id}.html`;
                }
            }
        }

        // Also handle direct path references (e.g., "/about" -> "about.html")
        if (href.startsWith('/') && !href.includes('.')) {
            const page = allPages.find(p => p.path === href);
            if (page) {
                if (page.slug) {
                    return `${page.slug}.html`;
                } else {
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
                const headerClasses = `w-full bg-white border-b ${props.sticky ? 'sticky top-0 z-50' : ''} ${props.shadow ? 'shadow-md' : ''}`;
                return `
<header class="${headerClasses}"${getInlineStyles(props)}>
    ${children.map(renderComponent).join("")}
</header>`;

            case "Navbar":
                const links = props.links || [];
                const linkColor = props.linkColor || '#6b7280';
                const linkHoverColor = props.linkHoverColor || '#1f2937';

                return `
<nav class="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto"${getInlineStyles(props)}>
    <div class="text-xl font-bold">${props.logoText || "Brand"}</div>
    <button class="md:hidden flex flex-col gap-1" onclick="toggleMobileMenu()">
        <span class="w-6 h-0.5 bg-gray-800"></span>
        <span class="w-6 h-0.5 bg-gray-800"></span>
        <span class="w-6 h-0.5 bg-gray-800"></span>
    </button>
    <div id="navbar-menu" class="hidden md:flex items-center gap-8">
        <ul class="flex gap-8">
            ${links.map((link: any) => `
            <li><a href="${convertLink(link.href)}" class="hover:opacity-75 transition-opacity" style="color: ${linkColor}" onmouseover="this.style.color='${linkHoverColor}'" onmouseout="this.style.color='${linkColor}'">${link.text}</a></li>
            `).join('')}
        </ul>
        ${props.ctaText && props.ctaLink ? `<a href="${convertLink(props.ctaLink)}" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">${props.ctaText}</a>` : ''}
    </div>
</nav>`;

            case "Hero":
                const sizeClasses = { sm: 'py-12 sm:py-16 px-4', md: 'py-16 sm:py-24 px-4 sm:px-6', lg: 'py-20 sm:py-32 px-4 sm:px-8', xl: 'py-24 sm:py-40 px-4 sm:px-12' };
                const alignmentClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };
                const heroSize = sizeClasses[props.size as keyof typeof sizeClasses] || sizeClasses.lg;
                const heroAlign = alignmentClasses[props.alignment as keyof typeof alignmentClasses] || alignmentClasses.center;

                return `
<section class="relative flex items-center justify-center min-h-[500px] w-full ${heroSize} ${heroAlign}"${getInlineStyles(props, { backgroundColor: '#f8f9fa', textColor: '#1f2937' })}>
    ${props.backgroundImage ? '<div class="absolute inset-0 bg-black bg-opacity-40"></div>' : ''}
    <div class="relative z-10 max-w-4xl mx-auto px-4">
        ${props.subtitle ? `<p class="text-xs sm:text-sm font-medium uppercase tracking-wide mb-3 sm:mb-4 opacity-80">${props.subtitle}</p>` : ''}
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">${props.title || "Welcome to Our Website"}</h1>
        <p class="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">${props.description || "Build amazing websites with our powerful tools"}</p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a href="${props.primaryButtonLink || '#'}" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto">${props.primaryButtonText || "Get Started"}</a>
            ${props.secondaryButtonText ? `<a href="${props.secondaryButtonLink || '#'}" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-8 border-2 border-gray-300 hover:bg-gray-100 w-full sm:w-auto">${props.secondaryButtonText}</a>` : ''}
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
                const containerOverflowX = { visible: 'overflow-x-visible', hidden: 'overflow-x-hidden', scroll: 'overflow-x-scroll', auto: 'overflow-x-auto' };
                const containerOverflowY = { visible: 'overflow-y-visible', hidden: 'overflow-y-hidden', scroll: 'overflow-y-scroll', auto: 'overflow-y-auto' };

                const containerClasses = [
                    containerMaxWidth[props.maxWidth as keyof typeof containerMaxWidth] || containerMaxWidth.xl,
                    containerPadding[props.padding as keyof typeof containerPadding] || containerPadding.md,
                    'mx-auto',
                    containerDisplay,
                    props.display === 'flex' && (containerFlexDir[props.flexDirection as keyof typeof containerFlexDir] || containerFlexDir.row),
                    props.display === 'flex' && (containerFlexWrap[props.flexWrap as keyof typeof containerFlexWrap] || containerFlexWrap.nowrap),
                    props.display === 'flex' && (containerJustify[props.justifyContent as keyof typeof containerJustify] || containerJustify.start),
                    props.display === 'flex' && (containerAlign[props.alignItems as keyof typeof containerAlign] || containerAlign.start),
                    props.display === 'flex' && (containerGap[props.gap as keyof typeof containerGap] || ''),
                    containerOverflowX[props.overflowX as keyof typeof containerOverflowX] || containerOverflowX.visible,
                    containerOverflowY[props.overflowY as keyof typeof containerOverflowY] || containerOverflowY.visible,
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
                const gapMap = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' };
                return `
<div class="grid ${gridCols} ${gapMap[props.gap as keyof typeof gapMap] || gapMap.md}"${getInlineStyles(props)}>
    ${children.map(renderComponent).join("")}
</div>`;

            case "Card":
                return `
<div class="bg-white rounded-lg overflow-hidden ${props.variant === 'bordered' ? 'border' : ''} ${props.variant === 'shadow' ? 'shadow-md' : ''} ${props.variant === 'elevated' ? 'shadow-lg' : ''}"${getInlineStyles(props)}>
    ${props.image ? `<img src="${props.image}" alt="${props.title || ''}" class="w-full h-48 object-cover" />` : ''}
    <div class="p-6">
        <h3 class="text-xl font-bold mb-2">${props.title || "Card Title"}</h3>
        <p class="text-gray-600 mb-4">${props.description || "Card description"}</p>
        ${props.buttonText ? `<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">${props.buttonText}</button>` : ''}
    </div>
</div>`;

            case "Button":
                const btnVariantClasses: Record<string, string> = {
                    default: 'bg-blue-600 text-white hover:bg-blue-700',
                    destructive: 'bg-red-600 text-white hover:bg-red-700',
                    outline: 'border-2 border-gray-300 hover:bg-gray-100',
                    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                    ghost: 'hover:bg-gray-100',
                    link: 'text-blue-600 underline hover:no-underline',
                };
                const btnSizeClasses: Record<string, string> = {
                    sm: 'px-3 py-1.5 text-sm',
                    default: 'px-4 py-2',
                    lg: 'px-6 py-3 text-lg',
                };
                const btnClass = `${btnVariantClasses[props.variant || 'default']} ${btnSizeClasses[props.size || 'default']} ${props.fullWidth ? 'w-full' : ''} rounded-md font-medium transition-colors`;
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
                return `<img src="${props.src || ''}" alt="${props.alt || ''}" class="w-full h-auto rounded-${props.rounded || 'md'}"${getInlineStyles(props)} />`;

            case "Footer":
                const sections = props.sections || [];
                const socialLinks = props.socialLinks || [];
                const currentYear = new Date().getFullYear();
                const defaultCopyright = `© ${currentYear} ${props.logoText || 'Brand'}. All rights reserved.`;

                return `
<footer class="w-full py-8 sm:py-12 px-4 sm:px-8"${getInlineStyles(props, { backgroundColor: '#1f2937', textColor: '#ffffff' })}>
    <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div class="space-y-4">
                ${props.logo ? `<img src="${props.logo}" alt="Logo" class="h-8 w-auto" />` : `<span class="text-xl font-bold">${props.logoText || "Brand"}</span>`}
                ${props.description ? `<p class="text-sm opacity-80 leading-relaxed">${props.description}</p>` : ''}
                ${socialLinks.length > 0 ? `
                <div class="flex space-x-4">
                    ${socialLinks.map((social: any) => `<a href="${social.href}" class="opacity-80 hover:opacity-100 transition-opacity" target="_blank" rel="noopener noreferrer">${social.icon || social.platform}</a>`).join('')}
                </div>` : ''}
            </div>
            ${sections.map((section: any) => `
            <div class="space-y-4">
                <h3 class="font-semibold text-lg">${section.title}</h3>
                <ul class="space-y-2">
                    ${section.links.map((link: any) => `<li><a href="${link.href}" class="text-sm opacity-80 hover:opacity-100 transition-opacity">${link.text}</a></li>`).join('')}
                </ul>
            </div>`).join('')}
        </div>
        <div class="mt-8 pt-8 border-t border-white/20 text-center">
            <p class="text-sm opacity-80">${props.copyright || defaultCopyright}</p>
        </div>
    </div>
</footer>`;

            case "Form":
                const fields = props.fields || [];
                return `
<div class="max-w-md mx-auto"${getInlineStyles(props)}>
    ${props.title ? `<h2 class="text-2xl font-bold mb-2">${props.title}</h2>` : ''}
    ${props.description ? `<p class="text-gray-600 mb-6">${props.description}</p>` : ''}
    <form action="${props.action || '#'}" method="${props.method || 'POST'}" class="space-y-4">
        ${fields.map((field: any) => `
        <div class="space-y-2">
            <label for="${field.id}" class="block font-medium text-sm">${field.label}</label>
            ${field.type === 'textarea'
                        ? `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} class="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>`
                        : `<input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />`
                    }
        </div>
        `).join('')}
        <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">${props.submitText || 'Submit'}</button>
    </form>
</div>`;

            case "Video":
                if (props.youtubeId) {
                    return `
<div class="relative w-full pb-[56.25%] rounded-lg overflow-hidden"${getInlineStyles(props)}>
    <iframe src="https://www.youtube.com/embed/${props.youtubeId}" title="${props.title || 'Video'}" class="absolute top-0 left-0 w-full h-full" allowfullscreen></iframe>
</div>`;
                }
                if (props.src) {
                    return `<video src="${props.src}" ${props.controls !== false ? 'controls' : ''} ${props.autoplay ? 'autoplay' : ''} ${props.muted ? 'muted' : ''} ${props.loop ? 'loop' : ''} class="w-full h-auto rounded-lg"${getInlineStyles(props)}></video>`;
                }
                return '';

            case "Accordion":
                const accordionItems = props.items || [];
                return `
<div class="space-y-2"${getInlineStyles(props)}>
    ${accordionItems.map((item: any, idx: number) => `
    <details class="border rounded-lg">
        <summary class="px-4 py-3 cursor-pointer font-medium hover:bg-gray-50">${item.title}</summary>
        <div class="px-4 py-3 border-t">${item.content}</div>
    </details>
    `).join('')}
</div>`;

            case "Tabs":
                const tabs = props.tabs || [];
                return `
<div${getInlineStyles(props)}>
    <div class="flex border-b">
        ${tabs.map((tab: any, idx: number) => `
        <button class="px-4 py-2 font-medium ${idx === 0 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}" onclick="showTab(${idx})">${tab.label}</button>
        `).join('')}
    </div>
    ${tabs.map((tab: any, idx: number) => `
    <div id="tab-${idx}" class="p-4 ${idx !== 0 ? 'hidden' : ''}">${tab.content}</div>
    `).join('')}
</div>`;

            case "Testimonial":
                const stars = '★'.repeat(props.rating || 5) + '☆'.repeat(5 - (props.rating || 5));
                return `
<div class="p-6 rounded-lg"${getInlineStyles(props)}>
    <div class="text-yellow-400 text-xl mb-3">${stars}</div>
    <p class="text-lg mb-4 italic">"${props.quote || ''}"</p>
    <div class="flex items-center gap-3">
        ${props.avatar ? `<img src="${props.avatar}" alt="${props.author}" class="w-12 h-12 rounded-full" />` : ''}
        <div>
            <div class="font-semibold">${props.author || ''}</div>
            <div class="text-sm opacity-75">${props.role || ''}</div>
        </div>
    </div>
</div>`;

            case "PricingCard":
                const features = props.features || [];
                return `
<div class="p-8 rounded-lg border-2 ${props.featured ? 'border-blue-500 shadow-xl' : 'border-gray-200 shadow-md'}"${getInlineStyles(props)}>
    ${props.featured ? '<div class="text-center mb-4"><span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span></div>' : ''}
    <div class="text-center mb-6">
        <h3 class="text-2xl font-bold mb-2">${props.title || ''}</h3>
        <div class="mb-2">
            <span class="text-4xl font-bold">${props.price || ''}</span>
            <span class="text-gray-600">${props.period || ''}</span>
        </div>
        <p class="text-sm opacity-75">${props.description || ''}</p>
    </div>
    <ul class="space-y-3 mb-6">
        ${features.map((feature: string) => `
        <li class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            <span>${feature}</span>
        </li>
        `).join('')}
    </ul>
    <button class="w-full ${props.featured ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'} text-${props.featured ? 'white' : 'gray-900'} px-6 py-3 rounded-md font-medium transition-colors">${props.buttonText || 'Get Started'}</button>
</div>`;

            case "Feature":
                return `
<div class="p-6 rounded-lg text-center"${getInlineStyles(props)}>
    <div class="text-4xl mb-4">${props.icon || '✨'}</div>
    <h3 class="text-xl font-bold mb-2">${props.title || ''}</h3>
    <p class="opacity-75">${props.description || ''}</p>
</div>`;

            case "Stats":
                const stats = props.stats || [];
                const accentColor = props.accentColor || '#3b82f6';
                return `
<div class="flex justify-around items-center flex-wrap gap-8 p-8"${getInlineStyles(props)}>
    ${stats.map((stat: any) => `
    <div class="text-center">
        <div class="text-4xl font-bold mb-2" style="color: ${accentColor}">${stat.value}</div>
        <div class="text-sm opacity-75 uppercase tracking-wide">${stat.label}</div>
    </div>
    `).join('')}
</div>`;

            case "CTA":
                return `
<div class="text-center py-16 px-8"${getInlineStyles(props)}>
    <h2 class="text-3xl font-bold mb-4">${props.title || ''}</h2>
    <p class="text-lg mb-8 opacity-90">${props.description || ''}</p>
    <a href="${convertLink(props.buttonLink || '#')}" class="inline-block bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">${props.buttonText || 'Get Started'}</a>
</div>`;

            case "Divider":
                return `<hr class="border-t-${props.thickness || '1'} ${props.style === 'dashed' ? 'border-dashed' : props.style === 'dotted' ? 'border-dotted' : ''}" style="border-color: ${props.color || '#e5e7eb'}"${getInlineStyles(props)} />`;

            case "Spacer":
                const spacerSizeMap = { xs: '8px', sm: '16px', md: '32px', lg: '64px', xl: '128px' };
                return `<div style="height: ${spacerSizeMap[props.size as keyof typeof spacerSizeMap] || spacerSizeMap.md}"${getInlineStyles(props)}></div>`;

            case "Badge":
                const variantColors = {
                    default: 'bg-gray-200 text-gray-900',
                    success: 'bg-green-100 text-green-800',
                    warning: 'bg-yellow-100 text-yellow-800',
                    error: 'bg-red-100 text-red-800',
                    info: 'bg-blue-100 text-blue-800'
                };
                return `<span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${variantColors[props.variant as keyof typeof variantColors] || variantColors.default}"${getInlineStyles(props)}>${props.text || ''}</span>`;

            case "Alert":
                const alertVariants = {
                    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'ℹ️' },
                    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: '✓' },
                    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: '⚠️' },
                    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: '✕' }
                };
                const alertStyle = alertVariants[props.variant as keyof typeof alertVariants] || alertVariants.info;
                return `
<div class="p-4 rounded-lg border ${alertStyle.bg} ${alertStyle.border} ${alertStyle.text}"${getInlineStyles(props)}>
    <div class="flex items-start gap-3">
        <span class="text-2xl">${alertStyle.icon}</span>
        <div class="flex-1">
            <h4 class="font-semibold mb-1">${props.title || ''}</h4>
            <p class="text-sm">${props.message || ''}</p>
        </div>
        ${props.dismissible ? '<button class="text-xl hover:opacity-75">×</button>' : ''}
    </div>
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
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
</head>
<body>
    ${components.map(renderComponent).join("\n")}
    <script src="script.js"></script>
</body>
</html>`;
}

export function generateCSS(): string {
    // Tailwind handles all CSS via CDN
    return `/* Tailwind CSS is loaded via CDN in the HTML file */`;
}

export function generateJS(): string {
    return `// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.getElementById('navbar-menu');
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('flex');
    }
}

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
        console.log('Form submitted');
        alert('Form submitted! Check console for details.');
    });
});`;
}
