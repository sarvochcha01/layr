import { NextRequest, NextResponse } from "next/server";
import {
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// GET - Get a single project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const projectRef = doc(db, "projects", id);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const projectData = projectSnap.data();

        // Check if user owns this project
        if (projectData.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            project: {
                id: projectSnap.id,
                ...projectData,
                createdAt: projectData.createdAt?.toDate().toISOString(),
                updatedAt: projectData.updatedAt?.toDate().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

// PATCH - Update a project
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const projectRef = doc(db, "projects", id);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const projectData = projectSnap.data();

        // Check if user owns this project
        if (projectData.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, components, thumbnail } = body;

        const updateData: any = {
            updatedAt: Timestamp.now(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (components !== undefined) updateData.components = components;
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

        await updateDoc(projectRef, updateData);

        const updatedSnap = await getDoc(projectRef);
        const updatedData = updatedSnap.data();

        return NextResponse.json({
            project: {
                id: updatedSnap.id,
                ...updatedData,
                createdAt: updatedData?.createdAt?.toDate().toISOString(),
                updatedAt: updatedData?.updatedAt?.toDate().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const projectRef = doc(db, "projects", id);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const projectData = projectSnap.data();

        // Check if user owns this project
        if (projectData.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await deleteDoc(projectRef);

        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}
