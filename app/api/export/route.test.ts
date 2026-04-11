import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';
import * as fc from 'fast-check';

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * This test encodes the EXPECTED behavior (App Router structure with complete components).
 * It is designed to FAIL on unfixed code to confirm the bug exists.
 * 
 * When this test PASSES after the fix, it confirms the bug is resolved.
 */

describe('Bug Condition Exploration - Next.js Export Structure', () => {
    /**
     * Property 1: Bug Condition - App Router Structure with Complete Components
     * 
     * For any export request where format === "react", the export function SHOULD:
     * - Generate an app/ directory structure (NOT pages/)
     * - Create app/layout.tsx file
     * - Create app/page.tsx file
     * - Create actual component implementation files (Header.tsx, Footer.tsx, etc.)
     * - NOT generate pages/ directory
     * 
     * EXPECTED OUTCOME ON UNFIXED CODE: This test will FAIL
     * - Current code generates pages/ instead of app/
     * - Current code does NOT generate app/layout.tsx or app/page.tsx
     * - Current code only generates components/index.ts without implementations
     */
    it('should generate App Router structure with complete component implementations when format is react', async () => {
        // Arrange: Create a minimal React export request
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

        // Assert: Verify App Router structure (EXPECTED behavior)

        // 1. Should generate app/ directory, NOT pages/ directory
        const hasAppDirectory = Object.keys(zip.files).some(path => path.startsWith('app/'));
        const hasPagesDirectory = Object.keys(zip.files).some(path => path.startsWith('pages/'));

        expect(hasAppDirectory, 'Should generate app/ directory for App Router').toBe(true);
        expect(hasPagesDirectory, 'Should NOT generate pages/ directory (Pages Router is outdated)').toBe(false);

        // 2. Should generate app/layout.tsx
        const appLayoutExists = zip.files['app/layout.tsx'] !== undefined;
        expect(appLayoutExists, 'Should generate app/layout.tsx for App Router').toBe(true);

        // 3. Should generate app/page.tsx
        const appPageExists = zip.files['app/page.tsx'] !== undefined;
        expect(appPageExists, 'Should generate app/page.tsx for App Router').toBe(true);

        // 4. Should generate actual component implementation files
        const headerComponentExists = zip.files['components/Header.tsx'] !== undefined;
        const heroComponentExists = zip.files['components/Hero.tsx'] !== undefined;

        expect(headerComponentExists, 'Should generate components/Header.tsx implementation').toBe(true);
        expect(heroComponentExists, 'Should generate components/Hero.tsx implementation').toBe(true);

        // 5. Verify components/index.ts exists but is NOT the only file in components/
        const componentFiles = Object.keys(zip.files).filter(path => path.startsWith('components/'));
        const hasOnlyIndexTs = componentFiles.length === 1 && componentFiles[0] === 'components/index.ts';

        expect(hasOnlyIndexTs, 'Should NOT have only components/index.ts - need actual implementations').toBe(false);
        expect(componentFiles.length, 'Should have multiple component files').toBeGreaterThan(1);
    });

    /**
     * Property-Based Test: App Router structure for various project configurations
     * 
     * This test uses fast-check to generate random project configurations
     * and verify that ALL React exports generate App Router structure.
     * 
     * Scoped to concrete failing case for deterministic bug reproduction.
     */
    it('should generate App Router structure for any React export configuration', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate arbitrary project configurations
                fc.record({
                    projectName: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, '') || 'project'),
                    pages: fc.array(
                        fc.record({
                            id: fc.string({ minLength: 1, maxLength: 10 }),
                            name: fc.string({ minLength: 1, maxLength: 20 }),
                            slug: fc.string({ minLength: 1, maxLength: 10 }),
                            components: fc.array(
                                fc.record({
                                    type: fc.constantFrom('Header', 'Hero', 'Footer', 'Section'),
                                    props: fc.record({
                                        title: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
                                    }),
                                    children: fc.constant([]),
                                }),
                                { minLength: 1, maxLength: 3 }
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

                    // Assert: Core App Router requirements
                    const hasAppDirectory = Object.keys(zip.files).some(path => path.startsWith('app/'));
                    const hasPagesDirectory = Object.keys(zip.files).some(path => path.startsWith('pages/'));
                    const appLayoutExists = zip.files['app/layout.tsx'] !== undefined;
                    const appPageExists = zip.files['app/page.tsx'] !== undefined;

                    // These assertions encode the EXPECTED behavior
                    expect(hasAppDirectory).toBe(true);
                    expect(hasPagesDirectory).toBe(false);
                    expect(appLayoutExists).toBe(true);
                    expect(appPageExists).toBe(true);
                }
            ),
            {
                numRuns: 10, // Run 10 random test cases
                endOnFailure: true, // Stop on first failure to see counterexample
            }
        );
    });
});
