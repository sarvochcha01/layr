import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Task 3.3 Test: Generate app/page.tsx file
 * 
 * **Validates: Requirements 1.4, 2.4**
 * 
 * This test verifies that:
 * - app/page.tsx is generated with proper App Router conventions
 * - The page imports components from @/components
 * - The page exports metadata for SEO
 * - The page renders components based on page.components data
 */

describe('Task 3.3 - Generate app/page.tsx file', () => {
    it('should generate app/page.tsx with proper App Router structure', async () => {
        // Arrange: Create a React export request
        const exportRequest = {
            format: 'react',
            projectName: 'test-project',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        {
                            type: 'Header',
                            props: { title: 'Test Header' },
                            children: [],
                        },
                        {
                            type: 'Hero',
                            props: { title: 'Welcome', subtitle: 'Test subtitle' },
                            children: [],
                        },
                        {
                            type: 'Footer',
                            props: {},
                            children: [],
                        },
                    ],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportRequest),
        });

        // Act: Call the export API
        const response = await POST(request as any);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert: Verify app/page.tsx exists
        const appPageExists = zip.files['app/page.tsx'] !== undefined;
        expect(appPageExists, 'Should generate app/page.tsx').toBe(true);

        // Get the content of app/page.tsx
        const appPageContent = await zip.files['app/page.tsx'].async('string');

        // Verify it imports from @/components (not ./components)
        expect(appPageContent).toContain("from '@/components'");

        // Verify it imports the necessary components
        expect(appPageContent).toContain('Header');
        expect(appPageContent).toContain('Hero');
        expect(appPageContent).toContain('Footer');

        // Verify it exports metadata
        expect(appPageContent).toContain('export const metadata');
        expect(appPageContent).toContain("import type { Metadata } from 'next'");

        // Verify it has a default export function
        expect(appPageContent).toContain('export default function Page()');

        // Verify it renders the components
        expect(appPageContent).toContain('<Header');
        expect(appPageContent).toContain('<Hero');
        expect(appPageContent).toContain('<Footer');

        // Verify component props are included
        expect(appPageContent).toContain('title="Test Header"');
        expect(appPageContent).toContain('title="Welcome"');
        expect(appPageContent).toContain('subtitle="Test subtitle"');
    });

    it('should generate app/page.tsx with custom metadata', async () => {
        // Arrange: Create a React export request with custom page name
        const exportRequest = {
            format: 'react',
            projectName: 'my-awesome-site',
            pages: [
                {
                    id: 'home',
                    name: 'Landing Page',
                    slug: 'index',
                    components: [
                        {
                            type: 'Hero',
                            props: { title: 'Welcome' },
                            children: [],
                        },
                    ],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportRequest),
        });

        // Act
        const response = await POST(request as any);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert: Verify metadata includes page name and project name
        const appPageContent = await zip.files['app/page.tsx'].async('string');

        expect(appPageContent).toContain("title: 'LandingPage'");
        expect(appPageContent).toContain("description: 'LandingPage - my-awesome-site'");
    });

    it('should use generateAppPage for home page and generateReactComponent for other pages', async () => {
        // Arrange: Create a multi-page React export request
        const exportRequest = {
            format: 'react',
            projectName: 'multi-page-site',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        {
                            type: 'Hero',
                            props: { title: 'Home Page' },
                            children: [],
                        },
                    ],
                },
                {
                    id: 'about',
                    name: 'About',
                    slug: 'about',
                    components: [
                        {
                            type: 'Section',
                            props: { title: 'About Us' },
                            children: [],
                        },
                    ],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportRequest),
        });

        // Act
        const response = await POST(request as any);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert: Verify home page uses generateAppPage (has metadata export)
        const homePageContent = await zip.files['app/page.tsx'].async('string');
        expect(homePageContent).toContain('export const metadata');
        expect(homePageContent).toContain("from '@/components'");

        // Assert: Verify about page uses generateReactComponent (also imports from @/components for App Router compatibility)
        const aboutPageContent = await zip.files['app/about/page.tsx'].async('string');
        expect(aboutPageContent).toContain("from '@/components'");
        expect(aboutPageContent).not.toContain('export const metadata');
    });
});
