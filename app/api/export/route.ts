import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateCSS, generateHTML, generateJS } from "@/lib/codeGenerator";

export async function POST(request: NextRequest) {
    try {
        const { pages, components } = await request.json();

        // Support both new pages format and legacy components format
        let pagesToExport = pages;

        if (!pagesToExport && components && Array.isArray(components)) {
            // Legacy format: convert components to single page
            pagesToExport = [
                {
                    id: "home",
                    name: "Home",
                    slug: "index",
                    components: components,
                },
            ];
        }

        if (!pagesToExport || !Array.isArray(pagesToExport)) {
            return NextResponse.json(
                { error: "Invalid pages data" },
                { status: 400 }
            );
        }

        // Generate shared CSS and JS
        const css = generateCSS();
        const js = generateJS();

        // Create zip file
        const zip = new JSZip();

        // Generate HTML for each page
        for (const page of pagesToExport) {
            const html = generateHTML(page.components, pagesToExport);

            // Support both slug and path fields
            let filename: string;
            if (page.slug) {
                filename = `${page.slug}.html`;
            } else if (page.path) {
                // Convert path to filename (e.g., "/" -> "index.html", "/about" -> "about.html")
                const pathName = page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-");
                filename = `${pathName}.html`;
            } else {
                // Fallback to page id
                filename = `${page.id}.html`;
            }

            zip.file(filename, html);
        }

        // Add shared files
        zip.file("styles.css", css);
        zip.file("script.js", js);

        // Generate zip as blob
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Return zip file
        return new NextResponse(zipBlob, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": 'attachment; filename="website-export.zip"',
            },
        });
    } catch (error) {
        console.error("Export failed:", error);
        return NextResponse.json(
            { error: "Export failed. Please try again." },
            { status: 500 }
        );
    }
}
