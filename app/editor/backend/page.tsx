"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { BackendEditorLayout } from "@/components/editor/backend/BackendEditorLayout";
import { ApiEndpoint } from "@/types/backend";

// Utility to recursively remove undefined values so Firebase doesn't complain
const sanitizeForFirestore = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const val = obj[key];
      if (val !== undefined) {
        acc[key] = sanitizeForFirestore(val);
      }
      return acc;
    }, {});
  }
  return obj;
};

export default function BackendEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const projectId = searchParams.get("projectId");
  const queryClient = useQueryClient();

  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [projectName, setProjectName] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Force fresh data when mounting the backend editor
  // (invalidates any stale cache from the frontend editor)
  useEffect(() => {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    }
  }, [projectId, queryClient]);

  // React Query hooks — allow refetch since we invalidated above
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(projectId, user?.uid);
  const updateProjectMutation = useUpdateProject();

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      router.push("/projects");
    }
  }, [projectId, router]);

  // Handle auth and project errors
  useEffect(() => {
    if (!projectId) return;
    if (authLoading || projectLoading) return;

    if (!user) {
      toast.error("Please log in");
      router.push("/projects");
      return;
    }

    if (projectError) {
      setRedirecting(true);
      toast.error("Project not found");
      router.push("/projects");
    }
  }, [projectId, user, authLoading, projectLoading, projectError, router]);

  // Load project data on initial load
  useEffect(() => {
    if (projectData && isInitialLoad) {
      setApiEndpoints(projectData.apiEndpoints || []);
      setProjectName(projectData.name || "Untitled Project");
      setIsInitialLoad(false);
    }
  }, [projectData, isInitialLoad]);

  // Auto-save when endpoints change
  useEffect(() => {
    if (!projectId || !user || isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      const updates = sanitizeForFirestore({
        apiEndpoints,
      });

      updateProjectMutation.mutate({
        projectId,
        updates,
        userId: user.uid,
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [apiEndpoints, projectId, user, isInitialLoad]);

  // Manual save
  const handleManualSave = async () => {
    if (!projectId || !user || isInitialLoad) return;
    setIsSavingManual(true);

    try {
      const updates = sanitizeForFirestore({
        apiEndpoints,
      });

      await updateProjectMutation.mutateAsync({
        projectId,
        updates,
        userId: user.uid,
      });
      toast.success("Backend configuration saved!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    } finally {
      setIsSavingManual(false);
    }
  };

  // Loading states
  if (!projectId || authLoading || projectLoading || redirecting) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <BackendEditorLayout
      endpoints={apiEndpoints}
      onEndpointsChange={setApiEndpoints}
      projectId={projectId}
      projectName={projectName}
      onSave={handleManualSave}
      isSaving={isSavingManual}
    />
  );
}
