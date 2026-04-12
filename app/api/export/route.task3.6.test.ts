import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Task 3.6: Update configuration files for App Router
 * 
 * **Validates: Requirements 2.1, 2.5**
 * 
 * These tests verify that configuration files are updated to support App Router structure:
 * - tailwind.config.js content paths include app/ directory (and NOT pages/)
 * - README.md reflects App Router structure (app/ instead of pages/)
 * - tsconfig.json paths configuration works with @/ alias
 * - All configuration files are compatible with Next.js 14+ App Router
 */

describe('Task 3.6: Configuration Files for App Router', () => {
    /**
     * Test: Tailwind Config Should Use App Router Paths
     * 
     * Verify that tailwind.config.js includes app/ directory in content paths
     * and does NOT include pages/ directory (since we're using App Router exclusively)
     */
    it('should generate tailwind.config.js with app/ directory and without pages/ directory', async () => {
        // Arrange
        const exportRequest = {
            format: 'react',
            projectName: 'tailwind-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [{ type: 'Header', props: {}, children: [] }],
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

        // Assert: Verify tailwind.config.js exists and has correct content
        expect(zip.files['tailwind.config.js'], 'Should have tailwind.config.js').toBeDefined();

        const tailwindConfigContent = await zip.files['tailwind.config.js'].async('string');

        // Should include app/ directory for App Router
        expect(tailwindConfigContent).toContain("'./app/**/*.{js,ts,jsx,tsx,mdx}'");

        // Should include components/ directory
        expect(tailwindConfigContent).toContain("'./components/**/*.{js,ts,jsx,tsx,mdx}'");

        // Should NOT include pages/ directory (we're using App Router only)
        expect(tailwindConfigContent).not.toContain("'./pages/**/*.{js,ts,jsx,tsx,mdx}'");
    });

    /**
     * Test: README Should Reflect App Router Structure
     * 
     * Verify that README.md mentions /app directory for App Router pages
     */
    it('should generate README.md that reflects App Router structure', async () => {
        // Arrange
        const exportRequest = {
            format: 'react',
            projectName: 'readme-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [{ type: 'Hero', props: {}, children: [] }],
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

        // Assert: Verify README.md mentions App Router structure
        expect(zip.files['README.md'], 'Should have README.md').toBeDefined();

        const readmeContent = await zip.files['README.md'].async('string');

        // Should mention /app directory for App Router
        expect(readmeContent).toContain('/app');
        expect(readmeContent).toContain('App Router');

        // Should mention components directory
        expect(readmeContent).toContain('/components');
    });

    /**
     * Test: tsconfig.json Should Support @/ Path Alias
     * 
     * Verify that tsconfig.json has proper paths configuration for @/ alias
     * which is used throughout the generated code
     */
    it('should generate tsconfig.json with @/ path alias configuration', async () => {
        // Arrange
        const exportRequest = {
            format: 'react',
            projectName: 'tsconfig-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [{ type: 'Section', props: {}, children: [] }],
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

        // Assert: Verify tsconfig.json has @/* path alias
        expect(zip.files['tsconfig.json'], 'Should have tsconfig.json').toBeDefined();

        const tsconfigContent = await zip.files['tsconfig.json'].async('string');
        const tsconfig = JSON.parse(tsconfigContent);

        // Should have @/* path alias pointing to root
        expect(tsconfig.compilerOptions.paths).toBeDefined();
        expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./*']);

        // Should have proper compiler options for Next.js 14+
        expect(tsconfig.compilerOptions.jsx).toBe('preserve');
        expect(tsconfig.compilerOptions.module).toBe('esnext');
        expect(tsconfig.compilerOptions.moduleResolution).toBe('node');
    });

    /**
     * Test: All Configuration Files Compatible with Next.js 14+ App Router
     * 
     * Verify that all configuration files work together for App Router
     */
    it('should generate all configuration files compatible with Next.js 14+ App Router', async () => {
        // Arrange
        const exportRequest = {
            format: 'react',
            projectName: 'app-router-config-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        { type: 'Header', props: { title: 'Welcome' }, children: [] },
                        { type: 'Hero', props: {}, children: [] },
                        { type: 'Footer', props: {}, children: [] },
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

        // Assert: Verify all required files exist
        expect(zip.files['package.json']).toBeDefined();
        expect(zip.files['next.config.js']).toBeDefined();
        expect(zip.files['tailwind.config.js']).toBeDefined();
        expect(zip.files['tsconfig.json']).toBeDefined();
        expect(zip.files['postcss.config.js']).toBeDefined();
        expect(zip.files['README.md']).toBeDefined();

        // Verify package.json has Next.js 15+
        const packageJsonContent = await zip.files['package.json'].async('string');
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.dependencies.next).toContain('^15');

        // Verify App Router structure exists
        expect(zip.files['app/layout.tsx']).toBeDefined();
        expect(zip.files['app/page.tsx']).toBeDefined();

        // Verify components exist
        expect(zip.files['components/Header.tsx']).toBeDefined();
        expect(zip.files['components/Hero.tsx']).toBeDefined();
        expect(zip.files['components/Footer.tsx']).toBeDefined();

        // Verify app folder with globals.css exists
        expect(zip.files['app/globals.css']).toBeDefined();
    });

    /**
     * Test: Configuration Files Should NOT Affect HTML Exports
     * 
     * Verify that HTML exports don't get React configuration files
     * (preservation requirement)
     */
    it('should not generate React configuration files for HTML exports', async () => {
        // Arrange
        const exportRequest = {
            format: 'html',
            projectName: 'html-no-config-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [{ type: 'Hero', props: {}, children: [] }],
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

        // Assert: HTML export should NOT have React config files
        expect(zip.files['package.json']).toBeUndefined();
        expect(zip.files['next.config.js']).toBeUndefined();
        expect(zip.files['tailwind.config.js']).toBeUndefined();
        expect(zip.files['tsconfig.json']).toBeUndefined();
        expect(zip.files['postcss.config.js']).toBeUndefined();

        // Should have HTML files instead
        expect(zip.files['index.html']).toBeDefined();
        expect(zip.files['styles.css']).toBeDefined();
        expect(zip.files['script.js']).toBeDefined();
    });
});
