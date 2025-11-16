# Template Seeding Script

This script seeds initial templates into your Firestore database.

## Prerequisites

1. Make sure your Firebase configuration is set up in `lib/firebase.ts`
2. Install tsx if you haven't: `npm install -D tsx`

## Running the Script

```bash
npx tsx scripts/seedTemplates.ts
```

## What it does

The script creates 6 starter templates in your Firestore `templates` collection:

1. **E-commerce Store** - Complete online store layout
2. **Landing Page Pro** - High-converting landing page
3. **Portfolio Showcase** - Modern portfolio for creatives
4. **Restaurant Menu** - Elegant restaurant website
5. **SaaS Product** - Professional SaaS landing with pricing
6. **Blog & Content** - Clean blog layout

## Firestore Structure

Each template document contains:

- `name`: Template name
- `description`: Brief description
- `category`: Category (E-commerce, Landing Page, Portfolio, etc.)
- `thumbnail`: Image URL for preview
- `featured`: Boolean flag for featured templates
- `components`: Array of ComponentDefinition objects (the actual page structure)
- `createdAt`: Timestamp

## After Seeding

Once seeded, templates will be available at `/templates` page where users can:

1. Browse templates by category
2. Click "Use Template"
3. Enter a project name
4. Create a new project with the template's components pre-loaded
