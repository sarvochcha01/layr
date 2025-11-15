"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { CreateCard } from "@/components/cards/CreateCard";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { projects, loading, error, createProject, deleteProject } =
    useProjects(user?.uid || null);

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { userId: user?.uid, authLoading });
    console.log("Projects:", projects.length, projects);
    if (error) console.error("Projects error:", error);
  }, [user, authLoading, projects, error]);

  // Refetch projects when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user?.uid) {
        console.log("Page visible, refetching projects...");
        // The useProjects hook will automatically refetch when userId changes
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  // Check if dialog should be opened from URL parameter
  useEffect(() => {
    const openDialog = searchParams.get("openDialog");
    if (openDialog === "true") {
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  // Remove URL parameter when dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && searchParams.get("openDialog") === "true") {
      // Remove the openDialog parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("openDialog");
      router.replace(newUrl.pathname + newUrl.search);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsCreating(true);
    try {
      const project = await createProject({
        name: projectName,
        description: projectDescription,
        components: [],
      });

      toast.success(`Project "${projectName}" created successfully!`);
      handleDialogOpenChange(false);
      setProjectName("");
      setProjectDescription("");

      // Navigate to editor with the new project
      router.push(`/editor?projectId=${project.id}`);
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    handleDialogOpenChange(false);
    setProjectName("");
    setProjectDescription("");
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success(`Project "${projectName}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Manage and organize your website projects
        </p>
      </div>

      {authLoading || loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            {authLoading ? "Authenticating..." : "Loading projects..."}
          </div>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">
            Please log in to view your projects
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-destructive">Error: {error}</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              description={project.description || "No description"}
              status="Draft"
              lastModified={formatDate(project.updatedAt.toString())}
              views="0"
              onClick={() => handleEditProject(project.id)}
              onDelete={() => handleDeleteProject(project.id, project.name)}
            />
          ))}

          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <CreateCard
                title="Create New Project"
                onClick={() => handleDialogOpenChange(true)}
              />
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new website project. You can always change these
                  details later.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="My Awesome Website"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateProject();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="project-description"
                    placeholder="Brief description of your project"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateProject} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
