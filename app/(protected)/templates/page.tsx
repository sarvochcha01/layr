"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateCard } from "@/components/cards/TemplateCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTemplates,
  useCreateProjectFromTemplate,
} from "@/hooks/useTemplates";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  featured: boolean;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [projectName, setProjectName] = useState("");

  // React Query hooks
  const { data: templates = [], isLoading: loading } = useTemplates();
  const createProjectMutation = useCreateProjectFromTemplate();

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates =
    activeFilter === "All"
      ? templates
      : templates.filter((template) => template.category === activeFilter);

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setProjectName(`${template.name} Project`);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    createProjectMutation.mutate(
      {
        templateId: selectedTemplate!.id,
        projectName,
        userId: user.uid,
      },
      {
        onSuccess: (data) => {
          toast.success("Project created successfully!");
          router.push(`/editor?projectId=${data.projectId}`);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to create project");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground">
          Choose from professionally designed templates to kickstart your
          project
        </p>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        {categories.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            onClick={() => setActiveFilter(filter)}
            className="px-4 py-2"
          >
            {filter}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                name={template.name}
                description={template.description}
                category={template.category}
                previewColor="bg-gradient-to-br from-blue-100 to-blue-200"
                thumbnail={template.thumbnail}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No templates found for the selected category.
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project from Template</DialogTitle>
            <DialogDescription>
              Create a new project using the "{selectedTemplate?.name}" template
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                disabled={createProjectMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTemplate(null)}
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
  );
}
