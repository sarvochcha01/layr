import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: Request) {
    try {
        const { templateId, projectName, userId } = await request.json();

        if (!templateId || !projectName || !userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Fetch the template
        const templateRef = doc(db, "templates", templateId);
        const templateDoc = await getDoc(templateRef);

        if (!templateDoc.exists()) {
            return NextResponse.json(
                { error: "Template not found" },
                { status: 404 }
            );
        }

        const templateData = templateDoc.data();

        // Create a new project with the template's components
        const projectsRef = collection(db, "projects");
        const newProject = await addDoc(projectsRef, {
            name: projectName,
            userId,
            components: templateData.components || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            templateId,
            templateName: templateData.name,
        });

        return NextResponse.json({
            projectId: newProject.id,
            message: "Project created from template successfully",
        });
    } catch (error) {
        console.error("Error creating project from template:", error);
        return NextResponse.json(
            { error: "Failed to create project from template" },
            { status: 500 }
        );
    }
}
