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
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const { user, loading: authLoading } = useAuth();

  // React Query hooks
  const { data: projects = [], isLoading: loading } = useProjects(user?.uid);
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

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

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    createProjectMutation.mutate(
      {
        name: projectName,
        userId: user.uid,
      },
      {
        onSuccess: (data) => {
          toast.success(`Project "${projectName}" created successfully!`);
          handleDialogOpenChange(false);
          setProjectName("");
          setProjectDescription("");
          router.push(`/editor?projectId=${data.projectId}`);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to create project");
        },
      }
    );
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

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    deleteProjectMutation.mutate(
      { projectId, userId: user.uid },
      {
        onSuccess: () => {
          toast.success(`Project "${projectName}" deleted successfully`);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to delete project");
        },
      }
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";

    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              description="No description"
              status="Draft"
              lastModified={formatDate(project.updatedAt)}
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
                    disabled={createProjectMutation.isPending}
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
                    disabled={createProjectMutation.isPending}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createProjectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending
                    ? "Creating..."
                    : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
