import { NextRequest, NextResponse } from "next/server";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// GET - List all projects for a user
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectsRef = collection(db, "projects");
        const q = query(
            projectsRef,
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate().toISOString(),
            }))
            .sort((a: any, b: any) => {
                // Sort by updatedAt in descending order (newest first)
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, components = [] } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Project name is required" },
                { status: 400 }
            );
        }

        const projectData = {
            name,
            description: description || "",
            components,
            userId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "projects"), projectData);

        return NextResponse.json(
            {
                project: {
                    id: docRef.id,
                    ...projectData,
                    createdAt: projectData.createdAt.toDate().toISOString(),
                    updatedAt: projectData.updatedAt.toDate().toISOString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
