import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    thumbnail: string;
    featured: boolean;
}

// Fetch all templates
export function useTemplates() {
    return useQuery({
        queryKey: ["templates"],
        queryFn: async () => {
            const response = await fetch("/api/templates");
            if (!response.ok) {
                throw new Error("Failed to fetch templates");
            }
            const data = await response.json();
            return data.templates as Template[];
        },
    });
}

// Fetch single template
export function useTemplate(id: string | null) {
    return useQuery({
        queryKey: ["template", id],
        queryFn: async () => {
            if (!id) return null;
            const response = await fetch(`/api/templates/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch template");
            }
            return response.json();
        },
        enabled: !!id,
    });
}

// Create project from template
export function useCreateProjectFromTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            templateId,
            projectName,
            userId,
        }: {
            templateId: string;
            projectName: string;
            userId: string;
        }) => {
            const response = await fetch("/api/templates/use", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId, projectName, userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create project");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate projects cache when a new project is created
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}
