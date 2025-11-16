import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Project {
    id: string;
    name: string;
    userId: string;
    components?: any[]; // Legacy support
    pages?: any[]; // New multi-page support
    createdAt: any;
    updatedAt: any;
}

// Fetch all projects for a user
export function useProjects(userId: string | undefined) {
    return useQuery({
        queryKey: ["projects", userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await fetch("/api/projects", {
                headers: {
                    "x-user-id": userId,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await response.json();
            return data.projects as Project[];
        },
        enabled: !!userId,
    });
}

// Fetch single project
export function useProject(projectId: string | null, userId?: string) {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            if (!projectId || !userId) return null;
            const response = await fetch(`/api/projects/${projectId}`, {
                headers: {
                    "x-user-id": userId,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch project");
            }
            const data = await response.json();
            return data.project;
        },
        enabled: !!projectId && !!userId,
        staleTime: Infinity, // Never consider data stale
        gcTime: Infinity, // Keep in cache forever
        refetchOnMount: false, // Don't refetch on component mount
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: false, // Don't refetch on reconnect
    });
}

// Update project
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            projectId,
            updates,
            userId,
        }: {
            projectId: string;
            updates: Partial<Project>;
            userId: string;
        }) => {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update project");
            }

            return response.json();
        },
        onSuccess: (data, variables) => {
            // Only invalidate projects list, NOT the current project to avoid overwriting local state
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}

// Delete project
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
                headers: {
                    "x-user-id": userId,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete project");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}

// Create new project
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            userId,
        }: {
            name: string;
            userId: string;
        }) => {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create project");
            }

            const data = await response.json();
            return { projectId: data.project.id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}
