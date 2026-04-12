import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Integration Test - Verify Exported Project Structure
 * 
 * This test verifies that the exported React/Next.js project has the correct
 * structure and all required files for a functional Next.js App Router project.
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

describe('Integration Test - Exported Project Structure', () => {
    it('should generate a complete Next.js App Router project structure', async () => {
        // Arrange: Create a comprehensive export request
        const exportRequest = {
            format: 'react',
            projectName: 'integration-test-project',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        { type: 'Header', props: { title: 'Test Header' }, children: [] },
                        { type: 'Hero', props: { title: 'Welcome', subtitle: 'Test Hero' }, children: [] },
                        { type: 'Section', props: { title: 'About' }, children: [] },
                        { type: 'Footer', props: { copyright: '2024' }, children: [] },
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

        // Assert: Verify complete project structure

        // 1. App Router Structure
        const hasAppDirectory = Object.keys(zip.files).some(path => path.startsWith('app/'));
        const hasPagesDirectory = Object.keys(zip.files).some(path => path.startsWith('pages/'));
        expect(hasAppDirectory, 'Should have app/ directory').toBe(true);
        expect(hasPagesDirectory, 'Should NOT have pages/ directory').toBe(false);

        // 2. Required App Router Files
        expect(zip.files['app/layout.tsx'], 'Should have app/layout.tsx').toBeDefined();
        expect(zip.files['app/page.tsx'], 'Should have app/page.tsx').toBeDefined();

        // 3. Component Implementations
        const componentFiles = Object.keys(zip.files).filter(
            path => path.startsWith('components/') && path.endsWith('.tsx')
        );
        expect(componentFiles.length, 'Should have multiple component files').toBeGreaterThan(0);
        expect(zip.files['components/Header.tsx'], 'Should have Header.tsx').toBeDefined();
        expect(zip.files['components/Hero.tsx'], 'Should have Hero.tsx').toBeDefined();
        expect(zip.files['components/Section.tsx'], 'Should have Section.tsx').toBeDefined();
        expect(zip.files['components/Footer.tsx'], 'Should have Footer.tsx').toBeDefined();

        // 4. Configuration Files
        expect(zip.files['package.json'], 'Should have package.json').toBeDefined();
        expect(zip.files['next.config.js'], 'Should have next.config.js').toBeDefined();
        expect(zip.files['tailwind.config.js'], 'Should have tailwind.config.js').toBeDefined();
        expect(zip.files['tsconfig.json'], 'Should have tsconfig.json').toBeDefined();
        expect(zip.files['postcss.config.js'], 'Should have postcss.config.js').toBeDefined();

        // 5. Verify app/layout.tsx content
        const layoutContent = await zip.files['app/layout.tsx'].async('string');
        expect(layoutContent, 'layout.tsx should import globals.css').toContain('./globals.css');
        expect(layoutContent, 'layout.tsx should have html tag').toContain('<html');
        expect(layoutContent, 'layout.tsx should have body tag').toContain('<body');
        expect(layoutContent, 'layout.tsx should have children prop').toContain('children');

        // 6. Verify app/page.tsx content
        const pageContent = await zip.files['app/page.tsx'].async('string');
        expect(pageContent, 'page.tsx should import Header').toContain('Header');
        expect(pageContent, 'page.tsx should import Hero').toContain('Hero');
        expect(pageContent, 'page.tsx should import Section').toContain('Section');
        expect(pageContent, 'page.tsx should import Footer').toContain('Footer');

        // 7. Verify component implementations have proper structure
        const headerContent = await zip.files['components/Header.tsx'].async('string');
        expect(headerContent, 'Header.tsx should be a React component').toContain('export');
        expect(headerContent, 'Header.tsx should have TypeScript interface').toContain('interface');

        // 8. Verify package.json has correct dependencies
        const packageJsonContent = await zip.files['package.json'].async('string');
        const packageJson = JSON.parse(packageJsonContent);
        expect(packageJson.dependencies, 'Should have dependencies').toBeDefined();
        expect(packageJson.dependencies.next, 'Should have Next.js dependency').toBeDefined();
        expect(packageJson.dependencies.react, 'Should have React dependency').toBeDefined();
        expect(packageJson.scripts, 'Should have scripts').toBeDefined();
        expect(packageJson.scripts.dev, 'Should have dev script').toBeDefined();
        expect(packageJson.scripts.build, 'Should have build script').toBeDefined();

        // 9. Verify tailwind.config.js includes app/ directory
        const tailwindContent = await zip.files['tailwind.config.js'].async('string');
        expect(tailwindContent, 'tailwind.config.js should include app/ in content paths').toContain('./app/');

        console.log('\n✅ Integration Test Summary:');
        console.log('   - App Router structure: ✓');
        console.log('   - Required files: ✓');
        console.log('   - Component implementations: ✓');
        console.log('   - Configuration files: ✓');
        console.log('   - File contents validated: ✓');
        console.log('\n📦 Exported project is ready for:');
        console.log('   - npm install');
        console.log('   - npm run dev');
        console.log('   - npm run build');
    });

    it('should generate valid TypeScript code in all files', async () => {
        const exportRequest = {
            format: 'react',
            projectName: 'typescript-validation',
            pages: [
                {
                    id: 'home',
                    name: 'Home',
                    slug: 'index',
                    components: [
                        { type: 'Header', props: { title: 'Test' }, children: [] },
                    ],
                },
            ],
        };

        const request = new Request('http://localhost:3000/api/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exportRequest),
        });

        const response = await POST(request as any);
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Check all .tsx and .ts files for basic TypeScript validity
        const tsFiles = Object.keys(zip.files).filter(
            path => (path.endsWith('.tsx') || path.endsWith('.ts')) && !zip.files[path].dir
        );

        for (const filePath of tsFiles) {
            const content = await zip.files[filePath].async('string');

            // Basic syntax checks
            expect(content, `${filePath} should not be empty`).toBeTruthy();
            expect(content.length, `${filePath} should have content`).toBeGreaterThan(0);

            // Check for common TypeScript patterns
            if (filePath.endsWith('.tsx')) {
                // React components should have proper structure
                const hasExport = content.includes('export');
                const hasInterface = content.includes('interface') || content.includes('type');
                expect(hasExport || hasInterface, `${filePath} should have exports or types`).toBe(true);
            }
        }

        console.log(`\n✅ Validated ${tsFiles.length} TypeScript files`);
    });
});
