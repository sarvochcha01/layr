import { useState, useEffect } from "react";
import { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";

export function useProjects(userId: string | null) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        if (!userId) {
            setProjects([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/projects", {
                headers: {
                    "x-user-id": userId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const data = await response.json();
            setProjects(data.projects);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [userId]);

    const createProject = async (input: CreateProjectInput) => {
        if (!userId) throw new Error("User not authenticated");

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                throw new Error("Failed to create project");
            }

            const data = await response.json();
            setProjects((prev) => [data.project, ...prev]);
            return data.project;
        } catch (err) {
            throw err;
        }
    };

    const updateProject = async (id: string, input: UpdateProjectInput) => {
        if (!userId) throw new Error("User not authenticated");

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                throw new Error("Failed to update project");
            }

            const data = await response.json();
            setProjects((prev) =>
                prev.map((p) => (p.id === id ? data.project : p))
            );
            return data.project;
        } catch (err) {
            throw err;
        }
    };

    const deleteProject = async (id: string) => {
        if (!userId) throw new Error("User not authenticated");

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
                headers: {
                    "x-user-id": userId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete project");
            }

            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            throw err;
        }
    };

    return {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects,
    };
}

export async function getProject(id: string, userId: string): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`, {
        headers: {
            "x-user-id": userId,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch project");
    }

    const data = await response.json();
    return data.project;
}
