import { describe, it } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Diagnostic Test - Observe Current Behavior
 * 
 * This test documents what the UNFIXED code actually generates.
 * Used to understand the root cause before implementing the fix.
 */

describe('Diagnostic - Current Export Behavior', () => {
    it('should document what the current unfixed code generates', async () => {
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

        // Document current behavior
        console.log('\n=== CURRENT EXPORT STRUCTURE (UNFIXED CODE) ===');
        console.log('Files in ZIP:');
        Object.keys(zip.files).forEach(path => {
            console.log(`  - ${path}`);
        });

        // Check specific files
        console.log('\n=== DIRECTORY STRUCTURE ===');
        console.log('Has pages/ directory:', Object.keys(zip.files).some(p => p.startsWith('pages/')));
        console.log('Has app/ directory:', Object.keys(zip.files).some(p => p.startsWith('app/')));
        console.log('Has components/ directory:', Object.keys(zip.files).some(p => p.startsWith('components/')));

        console.log('\n=== KEY FILES ===');
        console.log('pages/index.tsx exists:', zip.files['pages/index.tsx'] !== undefined);
        console.log('app/layout.tsx exists:', zip.files['app/layout.tsx'] !== undefined);
        console.log('app/page.tsx exists:', zip.files['app/page.tsx'] !== undefined);
        console.log('components/index.ts exists:', zip.files['components/index.ts'] !== undefined);
        console.log('components/Header.tsx exists:', zip.files['components/Header.tsx'] !== undefined);
        console.log('components/Hero.tsx exists:', zip.files['components/Hero.tsx'] !== undefined);

        // Show component files
        const componentFiles = Object.keys(zip.files).filter(p => p.startsWith('components/'));
        console.log('\n=== COMPONENT FILES ===');
        console.log('Component files:', componentFiles);

        // Show components/index.ts content
        if (zip.files['components/index.ts']) {
            const indexContent = await zip.files['components/index.ts'].async('string');
            console.log('\n=== components/index.ts CONTENT ===');
            console.log(indexContent.substring(0, 500));
        }

        console.log('\n=== END DIAGNOSTIC ===\n');
    });
});
