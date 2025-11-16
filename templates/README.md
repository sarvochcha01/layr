# Website Templates

This folder contains JSON template files that are seeded into Firestore.

## Structure

Each template file should be a JSON file with the following structure:

```json
{
  "name": "Template Name",
  "description": "Brief description of the template",
  "category": "Category Name",
  "thumbnail": "https://image-url.com/image.jpg",
  "featured": true,
  "components": [
    // Array of component definitions
  ]
}
```

## Adding New Templates

1. Create a new `.json` file in this folder (e.g., `portfolio.json`)
2. Follow the structure above
3. Run the seeding script: `npx tsx scripts/seedTemplates.ts`

## Template Categories

- **E-commerce** - Online stores and product showcases
- **SaaS** - Software as a Service landing pages
- **Portfolio** - Personal and professional portfolios
- **Restaurant** - Restaurant and food service websites
- **Blog** - Content and blogging websites
- **Landing Page** - Marketing and promotional pages
- **Business** - Corporate and business websites

## Component Types Available

- Navbar
- Hero
- Container
- Text
- Button
- Image
- Card
- Feature
- Stats
- Testimonial
- PricingCard
- Accordion
- Tabs
- CTA
- Divider
- Spacer
- Badge
- Alert
- Footer
- Header
- Grid
- Section
- Video
- Form

## Tips for Creating Templates

1. **Use realistic content** - Add actual text, not placeholders
2. **Include multiple sections** - Make templates comprehensive
3. **Add social proof** - Include testimonials, stats, etc.
4. **Use proper colors** - Choose cohesive color schemes
5. **Structure with containers** - Use Container components for layout
6. **Add CTAs** - Include clear calls-to-action
7. **Test thoroughly** - Load the template in the editor to verify

## Current Templates

- `design-system-demo.json` - Comprehensive design system showcase with all components and layout variations (4 pages)
- `ecommerce-store.json` - Complete e-commerce website (4 pages)
- `saas-landing.json` - SaaS product landing page (4 pages)

## Seeding Templates

To seed all templates to Firestore:

```bash
npx tsx scripts/seedTemplates.ts
```

This will:

1. Load all `.json` files from this folder
2. Clear existing templates in Firestore
3. Upload all templates with timestamps
