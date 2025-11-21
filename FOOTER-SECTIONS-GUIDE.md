# Footer Sections & Links Guide

The Footer component now supports customizable sections and social links, allowing you to create organized footer layouts with multiple link categories.

## Features

### 1. Footer Sections

Create multiple sections (like "Products", "Company", "Resources") with their own links.

**Properties:**

- `sections`: Array of section objects
  - `title`: Section heading (e.g., "Products", "Company")
  - `links`: Array of link objects
    - `text`: Link display text
    - `href`: Link URL

### 2. Social Links

Add social media links with icons.

**Properties:**

- `socialLinks`: Array of social link objects
  - `platform`: Platform name (e.g., "Twitter", "LinkedIn")
  - `href`: Social media URL
  - `icon`: Emoji or text icon (e.g., "🐦", "💼")

### 3. Other Properties

- `logoText`: Brand name
- `description`: Brief description about your brand
- `copyright`: Copyright text
- `backgroundColor`: Footer background color
- `textColor`: Footer text color

## How to Use in the Editor

1. **Add a Footer**: Drag the Footer component from the Component Palette to your page

2. **Add Sections**:

   - In the Properties Panel, scroll to "Footer Sections"
   - Click "Add Section" to create a new section
   - Enter a section title (e.g., "Products", "Company")
   - Click "Add Link" within the section to add links
   - Enter link text and URL for each link

3. **Add Social Links**:

   - Scroll to "Social Links" in the Properties Panel
   - Click "Add Social Link"
   - Enter platform name, URL, and an emoji icon

4. **Customize Appearance**:
   - Set logo text and description
   - Customize colors using the color pickers
   - Edit copyright text

## Example Configuration

```json
{
  "type": "Footer",
  "props": {
    "logoText": "CloudFlow",
    "description": "Streamline your workflow with powerful cloud-based tools.",
    "copyright": "© 2024 CloudFlow. All rights reserved.",
    "backgroundColor": "#111827",
    "textColor": "#9ca3af",
    "sections": [
      {
        "title": "Product",
        "links": [
          { "text": "Features", "href": "#features" },
          { "text": "Pricing", "href": "#pricing" }
        ]
      },
      {
        "title": "Company",
        "links": [
          { "text": "About", "href": "#about" },
          { "text": "Blog", "href": "#blog" }
        ]
      }
    ],
    "socialLinks": [
      { "platform": "Twitter", "href": "https://twitter.com", "icon": "🐦" },
      { "platform": "LinkedIn", "href": "https://linkedin.com", "icon": "💼" }
    ]
  }
}
```

## Tips

- Use clear, descriptive section titles
- Keep link text concise
- Use emojis for social icons for a modern look
- Organize related links under the same section
- Test your footer on different viewport sizes
