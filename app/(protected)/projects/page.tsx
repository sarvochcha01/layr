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

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      // Here you would typically make an API call to create the project
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(`Project "${projectName}" created successfully!`);
      handleDialogOpenChange(false);
      setProjectName("");
      setProjectDescription("");
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    handleDialogOpenChange(false);
    setProjectName("");
    setProjectDescription("");
  };

  const projects = [
    {
      name: "My Portfolio",
      description: "Personal portfolio website",
      status: "Published" as const,
      lastModified: "2 hours ago",
      views: "1.2K",
    },
    {
      name: "Business Site",
      description: "Company landing page",
      status: "Draft" as const,
      lastModified: "1 day ago",
      views: "0",
    },
    {
      name: "E-commerce Store",
      description: "Online shopping platform",
      status: "In Review" as const,
      lastModified: "3 days ago",
      views: "856",
    },
    {
      name: "Blog Website",
      description: "Personal blog and articles",
      status: "Published" as const,
      lastModified: "1 week ago",
      views: "3.4K",
    },
  ];

  const handleEditProject = (projectName: string) => {
    toast.info(`Editing ${projectName}`);
  };

  const handleDeleteProject = (projectName: string) => {
    toast.error(`Deleting ${projectName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Manage and organize your website projects
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.name}
            name={project.name}
            description={project.description}
            status={project.status}
            lastModified={project.lastModified}
            views={project.views}
            onEdit={() => handleEditProject(project.name)}
            onDelete={() => handleDeleteProject(project.name)}
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
                Start a new website project. You can always change these details
                later.
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
    </div>
  );
}
