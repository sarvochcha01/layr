# New Features Guide

This guide covers all the newly implemented features in the website builder.

## 🎨 1. Global Theme System

Manage colors, fonts, and spacing across your entire project.

### Features

- **Theme Presets**: Choose from Default, Dark, Vibrant, or Minimal themes
- **Color Palette**: Customize primary, secondary, accent, background, text, and utility colors
- **Typography**: Set heading and body fonts
- **Spacing Scale**: Define consistent spacing (xs, sm, md, lg, xl)
- **Border Radius**: Configure border radius values

### How to Use

1. Click on the "Theme" tab in the left panel (coming soon - needs UI integration)
2. Select a preset or customize individual values
3. Changes apply across all components automatically

### Theme Structure

```typescript
{
  colors: {
    primary, secondary, accent,
    background, surface, text, textSecondary,
    border, error, success, warning
  },
  fonts: { heading, body },
  spacing: { xs, sm, md, lg, xl },
  borderRadius: { sm, md, lg, full }
}
```

---

## ⌨️ 2. Keyboard Shortcuts Panel

Quick reference for all keyboard shortcuts.

### How to Access

- Press `?` key to toggle the shortcuts panel
- Or click the help icon in the toolbar (if added)

### Available Shortcuts

**General**

- `Ctrl + Z` - Undo
- `Ctrl + Y` or `Ctrl + Shift + Z` - Redo
- `Esc` - Deselect all

**Selection**

- `Ctrl + A` - Select all components
- `Click` - Select component
- `Ctrl + Click` - Multi-select

**Components**

- `Delete` - Delete selected
- `Ctrl + D` - Duplicate selected
- `Ctrl + C` - Copy component
- `Ctrl + V` - Paste component

**Navigation**

- `Tab` - Next field
- `Shift + Tab` - Previous field

---

## 📋 3. Copy & Paste Components

Copy components and paste them anywhere, even across pages.

### How to Use

1. Select a component
2. Press `Ctrl + C` to copy
3. Navigate to where you want to paste
4. Press `Ctrl + V` to paste

### Features

- Copies component with all properties
- Generates new unique IDs automatically
- Preserves component hierarchy (children)
- Works across different pages

---

## ⭐ 4. Favorites & Recent Components

Quick access to your most-used components.

### Favorites

- **Add to Favorites**: Hover over a component in the palette and click the star icon
- **Remove from Favorites**: Click the filled star icon
- **Access**: Favorites appear at the top of the component palette

### Recent Components

- Automatically tracks the last 10 components you've used
- Appears below Favorites in the palette
- Updates in real-time as you add components

### Storage

- Favorites and recent components are stored in browser localStorage
- Persists across sessions
- Per-browser (not synced across devices)

---

## 📄 5. Page Duplication

Quickly duplicate entire pages with all their components.

### How to Use

1. In the Pages panel, hover over a page
2. Click the duplicate icon (copy icon)
3. A new page is created with "(Copy)" suffix
4. All components are cloned with new IDs

### Features

- Deep clones all components and their children
- Generates unique IDs for all cloned components
- Preserves all component properties
- Automatically switches to the new page

### Use Cases

- Create variations of existing pages
- Use as templates for similar pages
- Quick prototyping
- A/B testing different layouts

---

## ⚛️ 6. React/Next.js Export

Export your website as a fully functional Next.js project.

### How to Use

1. Click the "Export" button dropdown
2. Choose "Export as React"
3. Download the ZIP file
4. Extract and run:
   ```bash
   npm install
   npm run dev
   ```

### What's Included

**Project Structure**

```
my-website/
├── pages/           # Next.js pages
│   ├── index.tsx
│   └── [other-pages].tsx
├── components/      # React components
│   └── index.ts
├── styles/          # Global styles
│   └── globals.css
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

**Configuration Files**

- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS setup

**Features**

- TypeScript support
- Tailwind CSS pre-configured
- All pages as separate route files
- Component-based architecture
- Ready for deployment to Vercel

### HTML Export (Existing)

- Choose "Export as HTML" for static website
- Includes HTML, CSS, and JavaScript files
- Ready to host on any static hosting service

---

## 🔄 Comparison: HTML vs React Export

| Feature           | HTML Export        | React Export          |
| ----------------- | ------------------ | --------------------- |
| **File Type**     | Static HTML/CSS/JS | TypeScript/TSX        |
| **Framework**     | None               | Next.js + React       |
| **Styling**       | Tailwind CDN       | Tailwind (installed)  |
| **Deployment**    | Any static host    | Vercel, Netlify, etc. |
| **Customization** | Limited            | Full React ecosystem  |
| **Build Step**    | No                 | Yes (npm run build)   |
| **Best For**      | Simple sites       | Complex apps          |

---

## 💡 Tips & Best Practices

### Theme System

- Start with a preset and customize from there
- Use consistent spacing values for better design
- Test your theme on different components

### Keyboard Shortcuts

- Learn the most common shortcuts first (Ctrl+Z, Ctrl+C/V)
- Use `?` to quickly reference shortcuts
- Shortcuts work when focus is on the canvas

### Favorites

- Add components you use frequently
- Keep your favorites list manageable (5-10 components)
- Recent components help you find what you just used

### Page Duplication

- Duplicate before making major changes (like a backup)
- Use descriptive names for duplicated pages
- Clean up unused duplicates regularly

### React Export

- Test your site before exporting
- Review the generated code
- Customize the React components as needed
- Use for projects that need dynamic features

---

## 🐛 Troubleshooting

### Shortcuts Not Working

- Make sure focus is on the canvas or editor body
- Shortcuts don't work in input fields (by design)
- Check if another browser extension is intercepting keys

### Copy/Paste Not Working

- Only one component can be copied at a time
- Make sure you've selected a component before copying
- Paste only works when you have something copied

### Favorites Not Saving

- Check browser localStorage is enabled
- Clear browser cache if issues persist
- Favorites are per-browser

### React Export Issues

- Make sure all pages have valid names
- Check that components have proper props
- Run `npm install` before `npm run dev`

---

## 🚀 Coming Soon

Features planned for future releases:

- Theme panel in UI (currently code-only)
- Export theme with project
- Component library/marketplace
- More export formats (Vue, Svelte)
- Cloud sync for favorites
- Collaborative editing

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
