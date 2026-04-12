# Bugfix Requirements Document

## Introduction

The Next.js export functionality currently generates an outdated Pages Router structure instead of the modern App Router structure. The exported project is non-functional because it only includes component export declarations without actual implementations, and lacks the required App Router files (app/layout.tsx and app/page.tsx). This prevents users from running the exported project with `npm install && npm run dev`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN exporting a project in React/Next.js format THEN the system generates a pages/ directory structure (Pages Router) instead of app/ directory (App Router)

1.2 WHEN exporting a project in React/Next.js format THEN the system creates a components folder containing only index.ts with export statements but no actual component implementation files

1.3 WHEN exporting a project in React/Next.js format THEN the system does not generate app/layout.tsx file required for App Router

1.4 WHEN exporting a project in React/Next.js format THEN the system does not generate app/page.tsx file required for App Router

1.5 WHEN attempting to run the exported project with npm run dev THEN the system fails because component implementations are missing

### Expected Behavior (Correct)

2.1 WHEN exporting a project in React/Next.js format THEN the system SHALL generate an app/ directory structure following Next.js App Router conventions

2.2 WHEN exporting a project in React/Next.js format THEN the system SHALL create a components folder containing actual component implementation files (Header.tsx, Footer.tsx, Hero.tsx, Section.tsx, etc.) not just export declarations

2.3 WHEN exporting a project in React/Next.js format THEN the system SHALL generate app/layout.tsx with proper root layout structure including html and body tags

2.4 WHEN exporting a project in React/Next.js format THEN the system SHALL generate app/page.tsx that imports and uses the page components

2.5 WHEN running npm install && npm run dev on the exported project THEN the system SHALL start the development server successfully without errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN exporting a project in HTML format THEN the system SHALL CONTINUE TO generate HTML files with styles.css and script.js as before

3.2 WHEN exporting multiple pages in React/Next.js format THEN the system SHALL CONTINUE TO generate separate page files for each page

3.3 WHEN exporting a project THEN the system SHALL CONTINUE TO include package.json, next.config.js, tailwind.config.js, and other configuration files

3.4 WHEN exporting a project THEN the system SHALL CONTINUE TO return a zip file with proper Content-Type and Content-Disposition headers

3.5 WHEN the export API receives invalid pages data THEN the system SHALL CONTINUE TO return a 400 error response
