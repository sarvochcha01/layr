import { describe, it, expect } from 'vitest';
import { POST } from './route';
import JSZip from 'jszip';

/**
 * Inspection Test - Document Current Fixed Behavior
 */

describe('Inspect Current Export Structure', () => {
    it('should show what files are currently generated', async () => {
        const exportRequest = {
            format: 'react',
            projectName: 'test-project',
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

        const files = Object.keys(zip.files);

        // Document what we found
        const hasPagesDir = files.some(f => f.startsWith('pages/'));
        const hasAppDir = files.some(f => f.startsWith('app/'));
        const hasComponentsDir = files.some(f => f.startsWith('components/'));

        // This documents the FIXED behavior
        expect(hasPagesDir).toBe(false); // Fixed: does NOT generate pages/
        expect(hasAppDir).toBe(true); // Fixed: DOES generate app/
        expect(hasComponentsDir).toBe(true); // Fixed: generates components/

        // Check specific files
        expect(zip.files['pages/index.tsx']).toBeUndefined(); // Fixed: does NOT generate pages/index.tsx
        expect(zip.files['app/layout.tsx']).toBeDefined(); // Fixed: DOES generate app/layout.tsx
        expect(zip.files['app/page.tsx']).toBeDefined(); // Fixed: DOES generate app/page.tsx
        expect(zip.files['components/index.ts']).toBeDefined(); // Fixed: generates components/index.ts
        expect(zip.files['components/Header.tsx']).toBeDefined(); // Fixed: DOES generate component implementations

        // Show component files for documentation
        const componentFiles = files.filter(f => f.startsWith('components/') && f.endsWith('.tsx'));
        expect(componentFiles.length).toBeGreaterThan(0); // Should have actual component implementation files
    });
});
