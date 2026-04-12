import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';
import * as fc from 'fast-check';

/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests verify that existing functionality (HTML exports, configuration files, etc.)
 * continues to work correctly and is NOT affected by the bug fix.
 * 
 * EXPECTED OUTCOME ON UNFIXED CODE: These tests should PASS
 * EXPECTED OUTCOME AFTER FIX: These tests should STILL PASS (no regressions)
 */

describe('Preservation Property Tests - HTML Export and Configuration', () => {
    /**
     * Property 2.1: HTML Export Preservation
     * 
     * For any export request where format !== "react" (HTML exports),
     * the system MUST generate .html files with styles.css and script.js
     * 
     * **Validates: Requirement 3.1**
     */
    it('should generate HTML files with styles.css and script.js for HTML format exports', async () => {
        // Arrange: Create an HTML export request
        const exportRequest = {
            format: 'html',
            projectName: 'test-html-project',
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

        // Act: Call the export API
        const response = await POST(request as any);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Assert: Verify HTML export structure
        const hasHtmlFile = zip.files['index.html'] !== undefined;
        const hasStylesCss = zip.files['styles.css'] !== undefined;
        const hasScriptJs = zip.files['script.js'] !== undefined;

        expect(hasHtmlFile, 'Should generate index.html file').toBe(true);
        expect(hasStylesCss, 'Should generate styles.css file').toBe(true);
        expect(hasScriptJs, 'Should generate script.js file').toBe(true);

        // Verify HTML content structure
        const htmlContent = await zip.files['index.html'].async('string');
        expect(htmlContent).toContain('<!DOCTYPE html>');
        expect(htmlContent).toContain('<html');
        expect(htmlContent).toContain('</html>');
        expect(htmlContent).toContain('<link rel="stylesheet" href="styles.css">');
        expect(htmlContent).toContain('<script src="script.js"></script>');
    });

    /**
     * Property 2.2: Multi-Page HTML Export Preservation
     * 
     * For any export request with multiple pages in HTML format,
     * the system MUST generate separate .html files for each page
     * 
     * **Validates: Requirement 3.2**
     */
    it('should generate separate HTML files for each page in multi-page exports', async () => {
        // Arrange: Create a multi-page HTML export request
        const exportRequest = {
            format: 'html',
            projectName: 'multi-page-test',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [{ type: 'Hero', props: { title: 'Home' }, children: [] }],
                },
                {
                    id: 'about',
                    name: 'About',
                    slug: 'about',
                    components: [{ type: 'Section', props: {}, children: [] }],
                },
                {
                    id: 'contact',
                    name: 'Contact',
                    slug: 'contact',
                    components: [{ type: 'Form', props: {}, children: [] }],
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

        // Assert: Verify each page has its own HTML file
        expect(zip.files['index.html'], 'Should have index.html').toBeDefined();
        expect(zip.files['about.html'], 'Should have about.html').toBeDefined();
        expect(zip.files['contact.html'], 'Should have contact.html').toBeDefined();

        // Verify shared assets are included once
        expect(zip.files['styles.css'], 'Should have styles.css').toBeDefined();
        expect(zip.files['script.js'], 'Should have script.js').toBeDefined();
    });

    /**
     * Property 2.3: Configuration Files Preservation (React Export)
     * 
     * For any React export, the system MUST generate all required configuration files:
     * - package.json
     * - next.config.js
     * - tailwind.config.js
     * - tsconfig.json
     * - postcss.config.js
     * 
     * **Validates: Requirement 3.3**
     */
    it('should generate all configuration files for React exports', async () => {
        // Arrange
        const exportRequest = {
            format: 'react',
            projectName: 'config-test-project',
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

        // Assert: Verify all configuration files exist
        expect(zip.files['package.json'], 'Should have package.json').toBeDefined();
        expect(zip.files['next.config.js'], 'Should have next.config.js').toBeDefined();
        expect(zip.files['tailwind.config.js'], 'Should have tailwind.config.js').toBeDefined();
        expect(zip.files['tsconfig.json'], 'Should have tsconfig.json').toBeDefined();
        expect(zip.files['postcss.config.js'], 'Should have postcss.config.js').toBeDefined();
        expect(zip.files['README.md'], 'Should have README.md').toBeDefined();

        // Verify package.json content
        const packageJsonContent = await zip.files['package.json'].async('string');
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.name).toBe('config-test-project');
        expect(packageJson.scripts.dev).toBe('next dev');
        expect(packageJson.scripts.build).toBe('next build');
        expect(packageJson.dependencies.react).toBeDefined();
        expect(packageJson.dependencies.next).toBeDefined();

        // Verify tsconfig.json content
        const tsconfigContent = await zip.files['tsconfig.json'].async('string');
        const tsconfig = JSON.parse(tsconfigContent);
        expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./*']);
    });

    /**
     * Property 2.4: ZIP File Headers Preservation
     * 
     * For any export request, the system MUST return a ZIP file with proper:
     * - Content-Type: application/zip
     * - Content-Disposition: attachment; filename="website-export.zip"
     * 
     * **Validates: Requirement 3.4**
     */
    it('should return ZIP file with correct Content-Type and Content-Disposition headers', async () => {
        // Arrange
        const exportRequest = {
            format: 'html',
            projectName: 'headers-test',
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

        // Assert: Verify response headers
        expect(response.headers.get('Content-Type')).toBe('application/zip');
        expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="website-export.zip"');
    });

    /**
     * Property 2.5: Error Handling Preservation
     * 
     * For any export request with invalid pages data,
     * the system MUST return a 400 error response
     * 
     * **Validates: Requirement 3.5**
     */
    it('should return 400 error for invalid pages data', async () => {
        // Test case 1: Missing pages array
        const invalidRequest1 = {
            format: 'html',
            projectName: 'test',
            // pages is missing
        };

        const request1 = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidRequest1),
        });

        const response1 = await POST(request1 as any);
        expect(response1.status).toBe(400);

        const body1 = await response1.json();
        expect(body1.error).toBe('Invalid pages data');

        // Test case 2: Pages is not an array
        const invalidRequest2 = {
            format: 'html',
            projectName: 'test',
            pages: 'not-an-array',
        };

        const request2 = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidRequest2),
        });

        const response2 = await POST(request2 as any);
        expect(response2.status).toBe(400);

        const body2 = await response2.json();
        expect(body2.error).toBe('Invalid pages data');
    });

    /**
     * Property-Based Test: HTML Export Preservation Across Various Configurations
     * 
     * This test uses fast-check to generate random HTML export configurations
     * and verify that ALL HTML exports continue to work correctly.
     */
    it('should preserve HTML export functionality for any valid HTML export configuration', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate arbitrary HTML export configurations
                fc.record({
                    projectName: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, '') || 'project'),
                    pages: fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1, maxLength: 10 }),
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            slug: fc.string({ minLength: 1, maxLength: 10 }),
                            components: fc.array(
                                fc.record({
                                    type: fc.constantFrom('Header', 'Hero', 'Footer', 'Section', 'Card', 'Button'),
                                    props: fc.record({
                                        title: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
                                    }),
                                    children: fc.constant([]),
                                }),
                                { minLength: 1, maxLength: 3 }
                            ),
                        }),
                        { minLength: 1, maxLength: 3 }
                    ),
                }),
                async (config) => {
                    // Arrange
                    const exportRequest = {
                        format: 'html',
                        projectName: config.projectName,
                        pages: config.pages,
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

                    // Assert: Core HTML export requirements
                    const hasStylesCss = zip.files['styles.css'] !== undefined;
                    const hasScriptJs = zip.files['script.js'] !== undefined;

                    // Verify each page has an HTML file
                    for (const page of config.pages) {
                        const htmlFileName = `${page.slug}.html`;
                        expect(zip.files[htmlFileName], `Should have ${htmlFileName}`).toBeDefined();
                    }

                    // Verify shared assets
                    expect(hasStylesCss, 'Should have styles.css').toBe(true);
                    expect(hasScriptJs, 'Should have script.js').toBe(true);

                    // Verify response headers
                    expect(response.headers.get('Content-Type')).toBe('application/zip');
                    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="website-export.zip"');
                }
            ),
            {
                numRuns: 20, // Run 20 random test cases for stronger guarantees
            }
        );
    });

    /**
     * Property-Based Test: Configuration Files Preservation Across Various React Exports
     * 
     * This test verifies that configuration files are consistently generated
     * regardless of the specific project configuration.
     */
    it('should consistently generate configuration files for any React export', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    projectName: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, '') || 'project'),
                    pages: fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1, maxLength: 10 }),
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            slug: fc.string({ minLength: 1, maxLength: 10 }),
                            components: fc.array(
                                fc.record({
                                    type: fc.constantFrom('Header', 'Footer', 'Hero'),
                                    props: fc.constant({}),
                                    children: fc.constant([]),
                                }),
                                { minLength: 1, maxLength: 2 }
                            ),
                        }),
                        { minLength: 1, maxLength: 2 }
                    ),
                }),
                async (config) => {
                    // Arrange
                    const exportRequest = {
                        format: 'react',
                        projectName: config.projectName,
                        pages: config.pages,
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

                    // Assert: All configuration files must exist
                    const requiredConfigFiles = [
                        'package.json',
                        'next.config.js',
                        'tailwind.config.js',
                        'tsconfig.json',
                        'postcss.config.js',
                        'README.md',
                    ];

                    for (const configFile of requiredConfigFiles) {
                        expect(zip.files[configFile], `Should have ${configFile}`).toBeDefined();
                    }

                    // Verify package.json structure
                    const packageJsonContent = await zip.files['package.json'].async('string');
                    const packageJson = JSON.parse(packageJsonContent);
                    expect(packageJson.scripts.dev).toBe('next dev');
                    expect(packageJson.dependencies.react).toBeDefined();
                    expect(packageJson.dependencies.next).toBeDefined();
                }
            ),
            {
                numRuns: 15,
            }
        );
    });
});
