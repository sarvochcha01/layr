import { ComponentPropertySchema } from "./types";

/**
 * Complete Property Schema Registry
 * 
 * Every builder component is mapped here with:
 * 1. Its component-specific property sections (content, settings, etc.)
 * 2. Which shared style sections apply (fill, dimensions, spacing, etc.)
 * 
 * Props are matched against each builder component's actual TypeScript interface.
 */
export const COMPONENT_SCHEMAS: Record<string, ComponentPropertySchema> = {

  // ═══════════════════════════════════════════════════════════
  // CONTENT COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Hero: {
    sections: [
      {
        id: "content",
        title: "Content",
        icon: "type",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Enter hero title" },
          { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Enter subtitle" },
          { key: "badge", label: "Badge Text", type: "text", placeholder: "Badge text" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Enter description", rows: 3 },
          { key: "primaryButtonText", label: "Primary Button Text", type: "text", placeholder: "Button text" },
          { key: "primaryButtonLink", label: "Primary Button Link", type: "link-editor", placeholder: "https://example.com" },
          { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", placeholder: "Optional" },
          { key: "secondaryButtonLink", label: "Secondary Button Link", type: "link-editor", placeholder: "https://example.com" },
          {
            key: "alignment", label: "Alignment", type: "select",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          {
            key: "size", label: "Size", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ],
          },
          { key: "showScrollIndicator", label: "Show Scroll Indicator", type: "switch" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "effects"],
  },

  Text: {
    sections: [
      {
        id: "content",
        title: "Content",
        icon: "type",
        fields: [
          { key: "content", label: "Content", type: "textarea", placeholder: "Enter text content", rows: 4 },
          {
            key: "tag", label: "HTML Tag", type: "select", halfWidth: true,
            options: [
              { label: "H1", value: "h1" },
              { label: "H2", value: "h2" },
              { label: "H3", value: "h3" },
              { label: "H4", value: "h4" },
              { label: "H5", value: "h5" },
              { label: "H6", value: "h6" },
              { label: "Paragraph", value: "p" },
              { label: "Span", value: "span" },
            ],
          },
          {
            key: "size", label: "Size", type: "select", halfWidth: true,
            options: [
              { label: "Extra Small", value: "xs" },
              { label: "Small", value: "sm" },
              { label: "Base", value: "base" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
              { label: "2X Large", value: "2xl" },
              { label: "3X Large", value: "3xl" },
            ],
          },
          {
            key: "weight", label: "Font Weight", type: "select", halfWidth: true,
            options: [
              { label: "Light", value: "light" },
              { label: "Normal", value: "normal" },
              { label: "Medium", value: "medium" },
              { label: "Semi Bold", value: "semibold" },
              { label: "Bold", value: "bold" },
              { label: "Extra Bold", value: "extrabold" },
            ],
          },
          {
            key: "align", label: "Alignment", type: "select", halfWidth: true,
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Justify", value: "justify" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "typography", "effects"],
  },

  Button: {
    sections: [
      {
        id: "content",
        title: "Content",
        icon: "type",
        fields: [
          { key: "text", label: "Button Text", type: "text", placeholder: "Button text" },
          {
            key: "variant", label: "Variant", type: "select",
            options: [
              { label: "Default", value: "default" },
              { label: "Destructive", value: "destructive" },
              { label: "Outline", value: "outline" },
              { label: "Secondary", value: "secondary" },
              { label: "Ghost", value: "ghost" },
              { label: "Link", value: "link" },
            ],
          },
          {
            key: "size", label: "Size", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Default", value: "default" },
              { label: "Large", value: "lg" },
              { label: "Icon", value: "icon" },
            ],
          },
          { key: "fullWidth", label: "Full Width", type: "switch" },
          { key: "disabled", label: "Disabled", type: "switch" },
          { key: "external", label: "Open in New Tab", type: "switch" },
        ],
      },
      {
        id: "links",
        title: "Link Settings",
        icon: "link",
        fields: [
          { key: "href", label: "Link URL", type: "link-editor", placeholder: "https://example.com" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Standard", value: "standard" },
              { label: "Centered", value: "centered" },
              { label: "Minimal", value: "minimal" },
              { label: "Brand Focus", value: "brand-focus" },
              { label: "Magazine", value: "magazine" },
              { label: "Brutalist", value: "brutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Split Dark", value: "split-dark" },
              { label: "Startup", value: "startup" },
              { label: "Newsletter", value: "newsletter" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects"],
  },

  Image: {
    sections: [
      {
        id: "content",
        title: "Image Source",
        icon: "image",
        fields: [
          { key: "src", label: "Image URL", type: "text", placeholder: "https://example.com/image.jpg" },
          { key: "alt", label: "Alt Text", type: "text", placeholder: "Describe the image" },
          {
            key: "objectFit", label: "Image Fit", type: "select",
            options: [
              { label: "Cover (Fill & Crop)", value: "cover" },
              { label: "Contain (Fit Inside)", value: "contain" },
              { label: "Fill (Stretch)", value: "fill" },
              { label: "Scale Down", value: "scale-down" },
              { label: "None (Original Size)", value: "none" },
            ],
          },
          {
            key: "rounded", label: "Border Radius", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Full (Circle)", value: "full" },
            ],
          },
          {
            key: "loading", label: "Loading", type: "select",
            options: [
              { label: "Lazy", value: "lazy" },
              { label: "Eager", value: "eager" },
            ],
          },
          { key: "link", label: "Link URL (optional)", type: "link-editor", placeholder: "https://example.com" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["dimensions", "spacing", "borders", "effects"],
  },

  Card: {
    sections: [
      {
        id: "content",
        title: "Card Content",
        icon: "type",
        fields: [
          { key: "icon", label: "Icon (emoji/text)", type: "text", placeholder: "•" },
          { key: "title", label: "Title", type: "text", placeholder: "Card title" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Card description", rows: 3 },
          { key: "buttonText", label: "Button Text", type: "text", placeholder: "Learn More" },
          { key: "buttonLink", label: "Button Link", type: "link-editor", placeholder: "https://example.com" },
          {
            key: "variant", label: "Card Style", type: "select",
            options: [
              { label: "Default", value: "default" },
              { label: "Bordered", value: "bordered" },
              { label: "Shadow", value: "shadow" },
              { label: "Elevated", value: "elevated" },
            ],
          },
        ],
      },
      {
        id: "images",
        title: "Images",
        icon: "image",
        fields: [
          { key: "topImage", label: "Top Image URL", type: "text", placeholder: "https://example.com/image.jpg" },
          {
            key: "topImageObjectFit", label: "Top Image Fit", type: "select",
            options: [
              { label: "Cover (Fill & Crop)", value: "cover" },
              { label: "Contain (Fit Inside)", value: "contain" },
              { label: "Fill (Stretch)", value: "fill" },
              { label: "Scale Down", value: "scale-down" },
              { label: "None (Original Size)", value: "none" },
            ],
          },
          { key: "bottomBackgroundImageUrl", label: "Bottom Background Image URL", type: "text", placeholder: "https://example.com/bg.jpg" },
          {
            key: "bottomBackgroundSize", label: "Bottom Background Fit", type: "select",
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
              { label: "Auto", value: "auto" },
              { label: "Stretch", value: "100% 100%" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects"],
  },

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Navbar: {
    sections: [
      {
        id: "brand",
        title: "Brand & CTA",
        icon: "settings",
        fields: [
          { key: "logo", label: "Logo Image URL", type: "text", placeholder: "https://example.com/logo.png" },
          { key: "logoText", label: "Logo Text", type: "text", placeholder: "Brand Name" },
          { key: "ctaText", label: "CTA Button Text", type: "text", placeholder: "Get Started" },
          { key: "ctaLink", label: "CTA Button Link", type: "link-editor", placeholder: "https://example.com" },
          { key: "ctaExternal", label: "CTA is External Link", type: "switch" },
        ],
      },
      {
        id: "links",
        title: "Navigation Links",
        icon: "link",
        fields: [
          { key: "links", label: "Navigation Links", type: "items-editor", editorType: "nav-links" },
        ],
      },
      {
        id: "styling",
        title: "Link Styling",
        icon: "paintbrush",
        fields: [
          { key: "linkColor", label: "Link Color", type: "color" },
          { key: "linkHoverColor", label: "Link Hover Color", type: "color" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions"],
  },

  Header: {
    sections: [
      {
        id: "settings",
        title: "Header Settings",
        icon: "settings",
        fields: [
          { key: "sticky", label: "Sticky Header", type: "switch" },
          { key: "shadow", label: "Drop Shadow", type: "switch" },
          { key: "padding", label: "Padding", type: "text", placeholder: "1rem 2rem" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "effects"],
  },

  Footer: {
    sections: [
      {
        id: "brand",
        title: "Footer Content",
        icon: "settings",
        fields: [
          {
            key: "variant", label: "Layout Style", type: "select",
            options: [
              { label: "Standard", value: "standard" },
              { label: "Centered", value: "centered" },
              { label: "Minimal", value: "minimal" },
              { label: "Brand Focus", value: "brand-focus" },
              { label: "Magazine", value: "magazine" },
              { label: "Brutalist", value: "brutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Split Dark", value: "split-dark" },
              { label: "Startup", value: "startup" },
              { label: "Newsletter", value: "newsletter" },
            ],
          },
          { key: "logo", label: "Logo Image URL", type: "text", placeholder: "https://example.com/logo.png" },
          { key: "logoText", label: "Logo Text", type: "text", placeholder: "Brand Name" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Brief description", rows: 3 },
          { key: "copyright", label: "Copyright Text", type: "text", placeholder: "© 2024 All rights reserved" },
          { key: "accentColor", label: "Accent Color", type: "color" },
          { key: "privacyLink", label: "Privacy Policy Link", type: "link-editor", placeholder: "https://example.com" },
          { key: "termsLink", label: "Terms of Service Link", type: "link-editor", placeholder: "https://example.com" },
        ],
      },
      {
        id: "newsletter",
        title: "Newsletter (newsletter variant)",
        icon: "settings",
        fields: [
          { key: "newsletterTitle", label: "Newsletter Heading", type: "text", placeholder: "Stay in the loop" },
          { key: "newsletterSubtitle", label: "Newsletter Subheading", type: "textarea", placeholder: "Get updates...", rows: 2 },
        ],
      },
      {
        id: "links",
        title: "Footer Links",
        icon: "link",
        fields: [
          { key: "sections", label: "Footer Sections", type: "items-editor", editorType: "footer-sections" },
        ],
      },
      {
        id: "socials",
        title: "Social Links",
        icon: "link",
        fields: [
          { key: "socialLinks", label: "Social Links", type: "items-editor", editorType: "social-links" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Visual Theme", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions"],
  },

  // ═══════════════════════════════════════════════════════════
  // LAYOUT COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Container: {
    sections: [
      {
        id: "settings",
        title: "Container Settings",
        icon: "layout",
        fields: [
          {
            key: "tag", label: "HTML Tag", type: "select",
            options: [
              { label: "div", value: "div" },
              { label: "main", value: "main" },
              { label: "section", value: "section" },
              { label: "article", value: "article" },
              { label: "aside", value: "aside" },
              { label: "header", value: "header" },
              { label: "footer", value: "footer" },
            ],
          },
          {
            key: "display", label: "Display", type: "select",
            options: [
              { label: "Flex", value: "flex" },
              { label: "Block", value: "block" },
            ],
          },
          {
            key: "flexDirection", label: "Flex Direction", type: "select",
            options: [
              { label: "Row", value: "row" },
              { label: "Column", value: "column" },
              { label: "Row Reverse", value: "row-reverse" },
              { label: "Column Reverse", value: "column-reverse" },
            ],
          },
          {
            key: "flexWrap", label: "Flex Wrap", type: "select",
            options: [
              { label: "No Wrap", value: "nowrap" },
              { label: "Wrap", value: "wrap" },
              { label: "Wrap Reverse", value: "wrap-reverse" },
            ],
          },
          {
            key: "justifyContent", label: "Justify Content", type: "select",
            options: [
              { label: "Start", value: "start" },
              { label: "Center", value: "center" },
              { label: "End", value: "end" },
              { label: "Between", value: "between" },
              { label: "Around", value: "around" },
              { label: "Evenly", value: "evenly" },
            ],
          },
          {
            key: "alignItems", label: "Align Items", type: "select",
            options: [
              { label: "Start", value: "start" },
              { label: "Center", value: "center" },
              { label: "End", value: "end" },
              { label: "Stretch", value: "stretch" },
              { label: "Baseline", value: "baseline" },
            ],
          },
          {
            key: "gap", label: "Gap", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ],
          },
          {
            key: "maxWidth", label: "Max Width", type: "select",
            options: [
              { label: "SM", value: "sm" },
              { label: "MD", value: "md" },
              { label: "LG", value: "lg" },
              { label: "XL", value: "xl" },
              { label: "2XL", value: "2xl" },
              { label: "3XL", value: "3xl" },
              { label: "4XL", value: "4xl" },
              { label: "5XL", value: "5xl" },
              { label: "6XL", value: "6xl" },
              { label: "7XL", value: "7xl" },
              { label: "Full", value: "full" },
            ],
          },
          {
            key: "padding", label: "Padding", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ],
          },
          {
            key: "margin", label: "Margin", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
              { label: "Auto", value: "auto" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects", "position"],
  },

  Grid: {
    sections: [
      {
        id: "settings",
        title: "Grid Settings",
        icon: "layout",
        fields: [
          {
            key: "columns", label: "Columns", type: "select",
            options: [
              { label: "1 Column", value: "1" },
              { label: "2 Columns", value: "2" },
              { label: "3 Columns", value: "3" },
              { label: "4 Columns", value: "4" },
              { label: "5 Columns", value: "5" },
              { label: "6 Columns", value: "6" },
            ],
          },
          {
            key: "gap", label: "Gap", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
              { label: "Custom", value: "custom" },
            ],
          },
          { key: "gapCustom", label: "Custom Gap", type: "text", placeholder: "20px" },
          { key: "responsive", label: "Responsive Breakpoints", type: "switch" },
          { key: "equalHeight", label: "Equal Height Children", type: "switch" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  Section: {
    sections: [
      {
        id: "settings",
        title: "Section Settings",
        icon: "layout",
        fields: [
          {
            key: "padding", label: "Padding", type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ],
          },
          {
            key: "maxWidth", label: "Max Width", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
              { label: "2X Large", value: "2xl" },
              { label: "Full", value: "full" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  // ═══════════════════════════════════════════════════════════
  // MEDIA COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Video: {
    sections: [
      {
        id: "settings",
        title: "Video Settings",
        icon: "settings",
        fields: [
          { key: "youtubeId", label: "YouTube ID", type: "text", placeholder: "e.g. dQw4w9WgXcQ" },
          { key: "vimeoId", label: "Vimeo ID", type: "text", placeholder: "e.g. 76979871" },
          { key: "src", label: "Direct Video URL (MP4, WebM)", type: "text", placeholder: "https://example.com/video.mp4" },
          { key: "poster", label: "Poster Image URL", type: "text", placeholder: "https://example.com/poster.jpg" },
          {
            key: "aspectRatio", label: "Aspect Ratio", type: "select",
            options: [
              { label: "16:9", value: "16:9" },
              { label: "4:3", value: "4:3" },
              { label: "1:1", value: "1:1" },
              { label: "21:9", value: "21:9" },
            ],
          },
          { key: "autoplay", label: "Autoplay", type: "switch" },
          { key: "loop", label: "Loop", type: "switch" },
          { key: "muted", label: "Muted", type: "switch" },
          { key: "controls", label: "Controls", type: "switch" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["dimensions", "spacing", "borders", "effects"],
  },

  // ═══════════════════════════════════════════════════════════
  // INTERACTIVE COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Form: {
    sections: [
      {
        id: "settings",
        title: "Form Settings",
        icon: "settings",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Contact Us" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Fill out the form below", rows: 2 },
          { key: "submitText", label: "Submit Button Text", type: "text", placeholder: "Submit" },
          { key: "action", label: "Form Action URL", type: "link-editor", placeholder: "https://example.com" },
          {
            key: "method", label: "Method", type: "select",
            options: [
              { label: "POST", value: "POST" },
              { label: "GET", value: "GET" },
            ],
          },
          {
            key: "layout", label: "Layout", type: "select",
            options: [
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ],
          },
          { key: "fields", label: "Form Fields", type: "items-editor", editorType: "form-fields" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  Accordion: {
    sections: [
      {
        id: "settings",
        title: "Accordion Settings",
        icon: "settings",
        fields: [
          { key: "allowMultiple", label: "Allow Multiple Open", type: "switch" },
          { key: "items", label: "Accordion Items", type: "items-editor", editorType: "accordion-items" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  Tabs: {
    sections: [
      {
        id: "settings",
        title: "Tabs Settings",
        icon: "settings",
        fields: [
          {
            key: "variant", label: "Style", type: "select",
            options: [
              { label: "Underline", value: "underline" },
              { label: "Pills", value: "pills" },
              { label: "Bordered", value: "bordered" },
            ],
          },
          { key: "tabHeadingColor", label: "Tab Heading Color", type: "color" },
          { key: "contentTextColor", label: "Content Text Color", type: "color" },
          { key: "activeTabColor", label: "Active Tab Color", type: "color" },
          { key: "tabs", label: "Tab Items", type: "items-editor", editorType: "tab-items" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  // ═══════════════════════════════════════════════════════════
  // MARKETING COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Testimonial: {
    sections: [
      {
        id: "content",
        title: "Content",
        icon: "type",
        fields: [
          { key: "quote", label: "Quote", type: "textarea", placeholder: "Customer testimonial...", rows: 3 },
          { key: "author", label: "Author Name", type: "text", placeholder: "John Doe" },
          { key: "role", label: "Role/Position", type: "text", placeholder: "CEO" },
          { key: "company", label: "Company", type: "text", placeholder: "Acme Corp" },
          { key: "avatar", label: "Avatar URL", type: "text", placeholder: "https://example.com/avatar.jpg" },
          {
            key: "rating", label: "Rating (0-5)", type: "number",
            min: 0, max: 5, step: 0.5,
          },
          {
            key: "variant", label: "Style", type: "select",
            options: [
              { label: "Card", value: "card" },
              { label: "Minimal", value: "minimal" },
              { label: "Featured", value: "featured" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects"],
  },

  PricingCard: {
    sections: [
      {
        id: "content",
        title: "Pricing Content",
        icon: "type",
        fields: [
          { key: "title", label: "Plan Name", type: "text", placeholder: "Professional" },
          { key: "price", label: "Price", type: "text", placeholder: "$49" },
          { key: "period", label: "Period", type: "text", placeholder: "mo" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Plan description", rows: 2 },
          { key: "buttonText", label: "Button Text", type: "text", placeholder: "GET STARTED" },
          { key: "buttonLink", label: "Button Link", type: "link-editor", placeholder: "https://example.com" },
          {
            key: "buttonVariant", label: "Button Style", type: "select",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
            ],
          },
          { key: "featured", label: "Featured (highlighted)", type: "switch" },
          { key: "badge", label: "Badge Text", type: "text", placeholder: "POPULAR" },
          { key: "features", label: "Features", type: "items-editor", editorType: "pricing-features" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects"],
  },

  Feature: {
    sections: [
      {
        id: "content",
        title: "Feature Content",
        icon: "type",
        fields: [
          {
            key: "icon", label: "Icon", type: "select",
            options: [
              { label: "⚡ Zap", value: "zap" },
              { label: "🛡️ Shield", value: "shield" },
              { label: "⭐ Star", value: "star" },
              { label: "❤️ Heart", value: "heart" },
              { label: "⚙️ Settings", value: "settings" },
              { label: "🌐 Globe", value: "globe" },
              { label: "🔒 Lock", value: "lock" },
              { label: "💻 CPU", value: "cpu" },
              { label: "📚 Layers", value: "layers" },
              { label: "💡 Code", value: "code" },
              { label: "🚀 Rocket", value: "rocket" },
              { label: "🎯 Target", value: "target" },
              { label: "👁️ Eye", value: "eye" },
              { label: "🔔 Bell", value: "bell" },
              { label: "🏆 Award", value: "award" },
              { label: "📊 Chart", value: "chart" },
              { label: "✅ Check", value: "check" },
              { label: "☁️ Cloud", value: "cloud" },
              { label: "🗄️ Database", value: "database" },
              { label: "✏️ Pen", value: "pen" },
              { label: "📱 Phone", value: "phone" },
              { label: "👥 Users", value: "users" },
              { label: "✨ Sparkles", value: "sparkles" },
              { label: "📈 Trending", value: "trending" },
              { label: "💡 Lightbulb", value: "lightbulb" },
              { label: "📦 Package", value: "package" },
            ],
          },
          { key: "title", label: "Title", type: "text", placeholder: "Feature Title" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Feature description", rows: 3 },
          {
            key: "layout", label: "Layout", type: "select",
            options: [
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ],
          },
          {
            key: "iconSize", label: "Icon Size", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
          { key: "iconColor", label: "Icon Color", type: "color" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "effects"],
  },

  Stats: {
    sections: [
      {
        id: "content",
        title: "Stats Content",
        icon: "type",
        fields: [
          {
            key: "layout", label: "Layout", type: "select",
            options: [
              { label: "Horizontal", value: "horizontal" },
              { label: "Grid", value: "grid" },
            ],
          },
          {
            key: "columns", label: "Grid Columns", type: "select",
            options: [
              { label: "2 Columns", value: "2" },
              { label: "3 Columns", value: "3" },
              { label: "4 Columns", value: "4" },
            ],
          },
          { key: "accentColor", label: "Number Color", type: "color" },
          { key: "stats", label: "Stats Items", type: "items-editor", editorType: "stats-items" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  CTA: {
    sections: [
      {
        id: "content",
        title: "CTA Content",
        icon: "type",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Ready to get started?" },
          { key: "description", label: "Description", type: "textarea", placeholder: "Join thousands of users today", rows: 2 },
          { key: "primaryButtonText", label: "Primary Button Text", type: "text", placeholder: "Start Free Trial" },
          { key: "primaryButtonLink", label: "Primary Button Link", type: "link-editor", placeholder: "https://example.com" },
          { key: "secondaryButtonText", label: "Secondary Button Text", type: "text", placeholder: "Optional secondary button" },
          { key: "secondaryButtonLink", label: "Secondary Button Link", type: "link-editor", placeholder: "https://example.com" },
          {
            key: "alignment", label: "Alignment", type: "select",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ],
          },
          {
            key: "size", label: "Size", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing", "borders", "effects"],
  },

  // ═══════════════════════════════════════════════════════════
  // UI COMPONENTS
  // ═══════════════════════════════════════════════════════════

  Divider: {
    sections: [
      {
        id: "settings",
        title: "Divider Settings",
        icon: "settings",
        fields: [
          { key: "text", label: "Text (optional)", type: "text", placeholder: "or" },
          {
            key: "variant", label: "Line Style", type: "select",
            options: [
              { label: "Solid", value: "solid" },
              { label: "Dashed", value: "dashed" },
              { label: "Dotted", value: "dotted" },
            ],
          },
          {
            key: "thickness", label: "Thickness", type: "select",
            options: [
              { label: "Thin", value: "thin" },
              { label: "Medium", value: "medium" },
              { label: "Thick", value: "thick" },
            ],
          },
          { key: "color", label: "Line Color", type: "color" },
          {
            key: "spacing", label: "Vertical Spacing", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["dimensions"],
  },

  Spacer: {
    sections: [
      {
        id: "settings",
        title: "Spacer Settings",
        icon: "settings",
        fields: [
          { key: "height", label: "Height", type: "text", placeholder: "2rem" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["dimensions"],
  },

  Badge: {
    sections: [
      {
        id: "content",
        title: "Badge Content",
        icon: "type",
        fields: [
          { key: "text", label: "Text", type: "text", placeholder: "New" },
          {
            key: "variant", label: "Variant", type: "select",
            options: [
              { label: "Default", value: "default" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Error", value: "error" },
              { label: "Info", value: "info" },
            ],
          },
          {
            key: "size", label: "Size", type: "select",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
          { key: "rounded", label: "Rounded (Pill Shape)", type: "switch" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill"],
  },

  Alert: {
    sections: [
      {
        id: "content",
        title: "Alert Content",
        icon: "type",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "Alert title" },
          { key: "message", label: "Message", type: "textarea", placeholder: "Alert message", rows: 2 },
          {
            key: "variant", label: "Variant", type: "select",
            options: [
              { label: "Info", value: "info" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Error", value: "error" },
            ],
          },
          { key: "dismissible", label: "Dismissible", type: "switch" },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["fill", "dimensions", "spacing"],
  },

  CustomCode: {
    sections: [
      {
        id: "settings",
        title: "Custom Code",
        icon: "settings",
        fields: [
          { key: "name", label: "Component Name", type: "text", placeholder: "Custom" },
          { key: "html", label: "HTML", type: "textarea", placeholder: "<div>Custom Code</div>", rows: 6 },
          { key: "css", label: "CSS", type: "textarea", placeholder: ".custom { color: red; }", rows: 4 },
        ],
      },
      {
        id: "theme",
        title: "Theme Style",
        icon: "paintbrush",
        fields: [
          {
            key: "themeStyle", label: "Theme Style", type: "select",
            options: [
              { label: "Dark Pro", value: "dark-pro" },
              { label: "Light Clean", value: "light-clean" },
              { label: "Midnight Glam", value: "midnight-glam" },
              { label: "Brutalist", value: "brutalist" },
              { label: "NeoBrutalist", value: "neobrutalist" },
              { label: "Glassmorphic", value: "glassmorphic" },
              { label: "Sunset Gradient", value: "sunset-gradient" },
              { label: "Cyberpunk", value: "cyberpunk" },
              { label: "Forest Organic", value: "forest-organic" },
              { label: "Ocean Depth", value: "ocean-depth" },
            ],
          },
        ],
      },
    ],
    styleSections: ["dimensions", "spacing"],
  },
};
