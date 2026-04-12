import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Task 3.2: Generate app/layout.tsx file
 * 
 * This test verifies that:
 * - app/layout.tsx is generated when format === "react"
 * - The layout includes proper TypeScript types (children: React.ReactNode)
 * - The layout imports global styles from @/styles/globals.css
 * - The layout includes metadata export for title and description
 * - The layout has proper html and body tags
 */
describe('Task 3.2 - Generate app/layout.tsx', () => {
    it('should generate app/layout.tsx with proper structure', async () => {
        // Arrange
        const requestBody = {
            format: 'react',
            projectName: 'Test Project',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        {
                            type: 'Header',
                            props: { title: 'Welcome' },
                            children: [],
                        },
                    ],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        // Act
        const response = await POST(request as any);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert - app/layout.tsx should exist
        const appLayoutExists = zip.files['app/layout.tsx'] !== undefined;
        expect(appLayoutExists, 'app/layout.tsx should be generated').toBe(true);

        // Get the content of app/layout.tsx
        const layoutContent = await zip.files['app/layout.tsx'].async('string');

        // Verify layout structure
        expect(layoutContent).toContain("import type { Metadata } from 'next'");
        expect(layoutContent).toContain("import './globals.css'");
        expect(layoutContent).toContain('export const metadata: Metadata');
        expect(layoutContent).toContain('title:');
        expect(layoutContent).toContain('description:');
        expect(layoutContent).toContain('export default function RootLayout');
        expect(layoutContent).toContain('children: React.ReactNode');
        expect(layoutContent).toContain('<html lang="en">');
        expect(layoutContent).toContain('<body');
        expect(layoutContent).toContain('{children}');
        expect(layoutContent).toContain('</body>');
        expect(layoutContent).toContain('</html>');

        // Verify project name is in metadata
        expect(layoutContent).toContain('Test Project');
    });

    it('should generate app/layout.tsx for different project names', async () => {
        // Arrange
        const requestBody = {
            format: 'react',
            projectName: 'My Awesome Site',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        // Act
        const response = await POST(request as any);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert
        const layoutContent = await zip.files['app/layout.tsx'].async('string');
        expect(layoutContent).toContain('My Awesome Site');
    });

    it('should NOT generate app/layout.tsx for HTML format (preservation)', async () => {
        // Arrange
        const requestBody = {
            format: 'html',
            projectName: 'Test Project',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });

        // Act
        const response = await POST(request as any);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert - app/layout.tsx should NOT exist for HTML format
        const appLayoutExists = zip.files['app/layout.tsx'] !== undefined;
        expect(appLayoutExists, 'app/layout.tsx should NOT be generated for HTML format').toBe(false);

        // Verify HTML format still works (preservation)
        const htmlFileExists = zip.files['index.html'] !== undefined;
        expect(htmlFileExists, 'HTML file should still be generated').toBe(true);
    });
});
