"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/cards/TemplateCard";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [activeFilter, setActiveFilter] = useState("All Templates");

  const allTemplates = [
    {
      name: "Modern Business",
      description: "Clean and professional business template",
      category: "Business",
      previewColor: "bg-gradient-to-br from-blue-100 to-blue-200",
    },
    {
      name: "Creative Portfolio",
      description: "Showcase your work with style",
      category: "Portfolio",
      previewColor: "bg-gradient-to-br from-purple-100 to-purple-200",
    },
    {
      name: "Landing Page Pro",
      description: "Convert visitors into customers",
      category: "Landing Page",
      previewColor: "bg-gradient-to-br from-green-100 to-green-200",
    },
    {
      name: "Tech Startup",
      description: "Perfect for technology companies",
      category: "Business",
      previewColor: "bg-gradient-to-br from-indigo-100 to-indigo-200",
    },
    {
      name: "Photography Portfolio",
      description: "Beautiful gallery layouts for photographers",
      category: "Portfolio",
      previewColor: "bg-gradient-to-br from-pink-100 to-pink-200",
    },
    {
      name: "SaaS Landing",
      description: "Optimized for software products",
      category: "Landing Page",
      previewColor: "bg-gradient-to-br from-orange-100 to-orange-200",
    },
    {
      name: "Restaurant Menu",
      description: "Elegant design for restaurants",
      category: "Business",
      previewColor: "bg-gradient-to-br from-red-100 to-red-200",
    },
    {
      name: "Designer Showcase",
      description: "Minimalist portfolio for designers",
      category: "Portfolio",
      previewColor: "bg-gradient-to-br from-teal-100 to-teal-200",
    },
  ];

  const filters = ["All Templates", "Business", "Portfolio", "Landing Page"];

  const filteredTemplates =
    activeFilter === "All Templates"
      ? allTemplates
      : allTemplates.filter((template) => template.category === activeFilter);

  const handleUseTemplate = (templateName: string) => {
    toast.success(`Using template: ${templateName}`);
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

      <div className="flex gap-4 mb-6">
        {filters.map((filter) => (
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.name}
            name={template.name}
            description={template.description}
            category={template.category}
            previewColor={template.previewColor}
            onUse={() => handleUseTemplate(template.name)}
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
    </div>
  );
}
