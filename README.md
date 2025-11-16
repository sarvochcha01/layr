# Layr

A professional visual website builder powered by Next.js, React, and Firebase. Build production-ready multi-page websites through an intuitive drag-and-drop interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Overview

Layr is a modern website builder that enables developers and designers to create sophisticated multi-page websites without writing code. Built on enterprise-grade technologies, it provides a complete solution for rapid website prototyping and production deployment.

## Key Features

### Visual Editor

- Real-time drag-and-drop interface with live preview
- Multi-page website support with seamless navigation
- Component hierarchy visualization
- Intelligent auto-save functionality

### Component Library

Over 25 production-ready components organized by category:

**Layout Components**

- Navbar, Footer, Header, Container, Grid, Section

**Content Components**

- Hero, Card, Text, Button, Image, Video

**Interactive Components**

- Accordion, Tabs, Form, Alert, Badge

**Marketing Components**

- CTA, Testimonial, PricingCard, Feature, Stats

**Utility Components**

- Divider, Spacer

### Advanced Customization

- Complete flexbox control (direction, wrap, justify, align, gap)
- Comprehensive styling options (colors, spacing, borders, shadows)
- Responsive design system
- Overflow management (horizontal and vertical scrolling)

### Export System

- Generate production-ready HTML, CSS, and JavaScript
- Multi-page export with working inter-page navigation
- Clean, semantic code output
- Deploy-ready static files

### Project Management

- Secure authentication via Firebase (Email and Google OAuth)
- Cloud-based project storage
- Template library with professional pre-built designs
- Optimized data fetching with React Query

## Technology Stack

| Category         | Technology                   |
| ---------------- | ---------------------------- |
| Framework        | Next.js 15 (App Router)      |
| UI Library       | React 19                     |
| Language         | TypeScript 5                 |
| Styling          | Tailwind CSS 3               |
| Database         | Firebase Firestore           |
| Authentication   | Firebase Auth                |
| State Management | TanStack Query (React Query) |
| Drag & Drop      | dnd-kit                      |
| Form Handling    | React Hook Form + Zod        |
| UI Components    | Radix UI + shadcn/ui         |

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, pnpm, or bun package manager
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/layr.git
cd layr
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. (Optional) Seed template data:

```bash
npx tsx scripts/seedTemplates.ts
```

5. Start the development server:

```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

## Project Architecture

```
layr/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (protected)/         # Protected application routes
│   ├── api/                 # API endpoints
│   └── editor/              # Visual editor interface
├── components/
│   ├── builder/             # Builder component library
│   ├── editor/              # Editor UI components
│   ├── ui/                  # Shared UI components
│   └── cards/               # Card components
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── lib/
│   ├── codeGenerator.ts     # Code generation engine
│   ├── firebase.ts          # Firebase configuration
│   └── utils.ts             # Utility functions
├── templates/               # Template definitions (JSON)
├── types/                   # TypeScript type definitions
└── scripts/                 # Build and utility scripts
```

## Usage Guide

### Creating Projects

1. Authenticate using email or Google OAuth
2. Create a new project or select from template library
3. Build pages using drag-and-drop interface
4. Customize components via properties panel
5. Manage multiple pages through pages panel
6. Export completed website as static files

### Component Management

- **Adding**: Drag components from palette or use "Add Component" button
- **Selection**: Click any component to select and edit
- **Customization**: Modify properties in the properties panel
- **Organization**: Reorder and nest components via drag-and-drop
- **Deletion**: Select component and press Delete key

### Page Management

- **Creation**: Add new pages via pages panel
- **Navigation**: Switch between pages for editing
- **Configuration**: Rename pages and set URL paths
- **Linking**: Connect pages using Button and Navbar components

### Export Process

1. Click "Export" in the editor toolbar
2. Download generated ZIP archive
3. Extract files to desired location
4. Open `index.html` in browser to preview
5. Deploy to any static hosting service (Vercel, Netlify, etc.)

## Documentation

- [Component Library Reference](./templates/README.md)
- [Template System Guide](./templates/DESIGN-SYSTEM-DEMO.md)
- [Export System Documentation](./EXPORT-FIX.md)
- [Scripts Documentation](./scripts/README.md)

## Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Lucide](https://lucide.dev/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

---

**Layr** - Professional Website Builder | Built with Next.js and React
