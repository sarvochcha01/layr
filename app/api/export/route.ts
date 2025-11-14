import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateCSS, generateHTML, generateJS } from "@/lib/codeGenerator";

export async function POST(request: NextRequest) {
    try {
        const { components } = await request.json();

        if (!components || !Array.isArray(components)) {
            return NextResponse.json(
                { error: "Invalid components data" },
                { status: 400 }
            );
        }

        // Generate code
        const html = generateHTML(components);
        const css = generateCSS();
        const js = generateJS();

        // Create zip file
        const zip = new JSZip();
        zip.file("index.html", html);
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
