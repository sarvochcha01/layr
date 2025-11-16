# Export Fix - Support for Both `slug` and `path` Fields

## Problem

The export was generating `undefined.html` files because templates were using `path` field (e.g., `"path": "/"`) while the export API expected `slug` field (e.g., `"slug": "index"`).

## Solution

Updated the export system to support both `slug` and `path` fields for backward compatibility.

## Changes Made

### 1. Type Definition (`types/editor.ts`)

- Made `slug` field optional
- Added optional `path` field
- Both fields are now supported for flexibility

```typescript
export interface Page {
  id: string;
  name: string;
  slug?: string; // URL slug like "about-us", "contact" (legacy)
  path?: string; // URL path like "/", "/about", "/contact" (preferred)
  components: ComponentDefinition[];
}
```

### 2. Export API (`app/api/export/route.ts`)

Updated filename generation to handle both fields:

```typescript
// Support both slug and path fields
let filename: string;
if (page.slug) {
  filename = `${page.slug}.html`;
} else if (page.path) {
  // Convert path to filename (e.g., "/" -> "index.html", "/about" -> "about.html")
  const pathName =
    page.path === "/"
      ? "index"
      : page.path.replace(/^\//, "").replace(/\//g, "-");
  filename = `${pathName}.html`;
} else {
  // Fallback to page id
  filename = `${page.id}.html`;
}
```

### 3. Code Generator (`lib/codeGenerator.ts`)

Enhanced `convertLink` function to handle both formats:

- Supports `page:pageId` format for internal links
- Converts `slug` to `filename.html`
- Converts `path` to `filename.html` (e.g., `/` → `index.html`, `/about` → `about.html`)
- Handles direct path references in href attributes

```typescript
const convertLink = (href: string): string => {
  if (!href || !allPages) return href;

  // Handle page:pageId format
  if (href.startsWith("page:")) {
    const pageId = href.substring(5);
    const page = allPages.find((p) => p.id === pageId);
    if (page) {
      if (page.slug) return `${page.slug}.html`;
      else if (page.path) {
        const pathName =
          page.path === "/"
            ? "index"
            : page.path.replace(/^\//, "").replace(/\//g, "-");
        return `${pathName}.html`;
      }
      return `${page.id}.html`;
    }
  }

  // Handle direct path references (e.g., "/about")
  if (href.startsWith("/") && !href.includes(".")) {
    const page = allPages.find((p) => p.path === href);
    if (page) {
      if (page.slug) return `${page.slug}.html`;
      else {
        const pathName =
          href === "/" ? "index" : href.replace(/^\//, "").replace(/\//g, "-");
        return `${pathName}.html`;
      }
    }
  }

  return href;
};
```

## Path to Filename Conversion

| Path         | Filename         |
| ------------ | ---------------- |
| `/`          | `index.html`     |
| `/about`     | `about.html`     |
| `/contact`   | `contact.html`   |
| `/blog/post` | `blog-post.html` |

## Template Compatibility

### Old Templates (using `slug`)

- `ecommerce-store.json` ✅
- `saas-landing.json` ✅

### New Templates (using `path`)

- `design-system-demo.json` ✅

All templates now export correctly regardless of which field they use.

## Testing

The Design System Demo template now exports correctly with:

- `index.html` (from `path: "/"`)
- `components.html` (from `path: "/components"`)
- `layouts.html` (from `path: "/layouts"`)
- `pricing.html` (from `path: "/pricing"`)
- `styles.css`
- `script.js`

All navigation links between pages work correctly in the exported HTML files.
