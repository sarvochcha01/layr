import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Task 3.1 Verification Test
 * 
 * Verifies that the export route generates App Router structure (app/ directory)
 * instead of Pages Router structure (pages/ directory).
 */

describe('Task 3.1 - App Router Directory Structure', () => {
    it('should generate app/ directory instead of pages/ directory', async () => {
        // Arrange
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

        // Assert
        const hasAppDirectory = Object.keys(zip.files).some(path => path.startsWith('app/'));
        const hasPagesDirectory = Object.keys(zip.files).some(path => path.startsWith('pages/'));

        expect(hasAppDirectory, 'Should generate app/ directory for App Router').toBe(true);
        expect(hasPagesDirectory, 'Should NOT generate pages/ directory').toBe(false);
    });

    it('should generate app/page.tsx for home page', async () => {
        // Arrange
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

        // Assert
        const appPageExists = zip.files['app/page.tsx'] !== undefined;
        expect(appPageExists, 'Should generate app/page.tsx for home page').toBe(true);
    });

    it('should generate app/[slug]/page.tsx for additional pages', async () => {
        // Arrange
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
                            props: { title: 'Home' },
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
                            type: 'Header',
                            props: { title: 'About' },
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

        // Assert
        const appPageExists = zip.files['app/page.tsx'] !== undefined;
        const aboutPageExists = zip.files['app/about/page.tsx'] !== undefined;

        expect(appPageExists, 'Should generate app/page.tsx for home page').toBe(true);
        expect(aboutPageExists, 'Should generate app/about/page.tsx for about page').toBe(true);
    });
});
