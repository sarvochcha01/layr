// @ts-nocheck
"use client";
import React from "react";
import { ComponentDefinition } from "@/types/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";

// Temporary textarea component
const Textarea = ({ className, ...props }: any) => (
  <textarea
    className={`w-full p-2 border rounded-md ${className}`}
    {...props}
  />
);

// Temporary switch component
const Switch = ({ checked, onCheckedChange, ...props }: any) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    {...props}
  />
);

interface PropertiesPanelProps {
  selectedComponent: ComponentDefinition | null;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

export function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
}: PropertiesPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm">
              Select a component to edit its properties
            </div>
          </div>
        </div>
      </div>
    );
  }

  const updateProp = (key: string, value: any) => {
    onUpdateComponent(selectedComponent.id, { [key]: value });
  };

  const renderPropertyFields = () => {
    const { type, props } = selectedComponent;

    switch (type) {
      case "Hero":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Enter hero title"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={props.subtitle || ""}
                onChange={(e) => updateProp("subtitle", e.target.value)}
                placeholder="Enter subtitle"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="primaryButtonText">Primary Button Text</Label>
              <Input
                id="primaryButtonText"
                value={props.primaryButtonText || ""}
                onChange={(e) =>
                  updateProp("primaryButtonText", e.target.value)
                }
                placeholder="Button text"
              />
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={props.backgroundColor || "#f8fafc"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "Text":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={props.content || ""}
                onChange={(e) => updateProp("content", e.target.value)}
                placeholder="Enter text content"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="tag">HTML Tag</Label>
              <select
                id="tag"
                value={props.tag || "p"}
                onChange={(e) => updateProp("tag", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
                <option value="h6">H6</option>
                <option value="p">Paragraph</option>
                <option value="span">Span</option>
              </select>
            </div>

            <div>
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                value={props.size || "base"}
                onChange={(e) => updateProp("size", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="xs">Extra Small</option>
                <option value="sm">Small</option>
                <option value="base">Base</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
                <option value="2xl">2X Large</option>
                <option value="3xl">3X Large</option>
              </select>
            </div>

            <div>
              <Label htmlFor="color">Text Color</Label>
              <Input
                id="color"
                type="color"
                value={props.color || "#000000"}
                onChange={(e) => updateProp("color", e.target.value)}
              />
            </div>
          </div>
        );

      case "Button":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Button Text</Label>
              <Input
                id="text"
                value={props.text || ""}
                onChange={(e) => updateProp("text", e.target.value)}
                placeholder="Button text"
              />
            </div>

            <div>
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={props.href || ""}
                onChange={(e) => updateProp("href", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="variant">Variant</Label>
              <select
                id="variant"
                value={props.variant || "default"}
                onChange={(e) => updateProp("variant", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="default">Default</option>
                <option value="destructive">Destructive</option>
                <option value="outline">Outline</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
                <option value="link">Link</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fullWidth"
                checked={props.fullWidth || false}
                onCheckedChange={(checked) => updateProp("fullWidth", checked)}
              />
              <Label htmlFor="fullWidth">Full Width</Label>
            </div>

            {props.href && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="external"
                  checked={props.external || false}
                  onCheckedChange={(checked) => updateProp("external", checked)}
                />
                <Label htmlFor="external">External Link</Label>
              </div>
            )}
          </div>
        );

      case "Image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={props.src || ""}
                onChange={(e) => updateProp("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={props.alt || ""}
                onChange={(e) => updateProp("alt", e.target.value)}
                placeholder="Describe the image"
              />
            </div>

            <div>
              <Label htmlFor="rounded">Border Radius</Label>
              <select
                id="rounded"
                value={props.rounded || "md"}
                onChange={(e) => updateProp("rounded", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
        );

      case "Card":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Card title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Card description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={props.buttonText || ""}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                placeholder="Learn More"
              />
            </div>

            <div>
              <Label htmlFor="variant">Card Style</Label>
              <select
                id="variant"
                value={props.variant || "default"}
                onChange={(e) => updateProp("variant", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="default">Default</option>
                <option value="bordered">Bordered</option>
                <option value="shadow">Shadow</option>
                <option value="elevated">Elevated</option>
              </select>
            </div>
          </div>
        );

      case "Header":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="sticky"
                checked={props.sticky || false}
                onCheckedChange={(checked) => updateProp("sticky", checked)}
              />
              <Label htmlFor="sticky">Sticky Header</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="shadow"
                checked={props.shadow || false}
                onCheckedChange={(checked) => updateProp("shadow", checked)}
              />
              <Label htmlFor="shadow">Drop Shadow</Label>
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={props.backgroundColor || "#ffffff"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="padding">Padding</Label>
              <select
                id="padding"
                value={props.padding || "md"}
                onChange={(e) => updateProp("padding", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
        );

      case "Navbar":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={props.logoText || ""}
                onChange={(e) => updateProp("logoText", e.target.value)}
                placeholder="Brand Name"
              />
            </div>

            <div>
              <Label htmlFor="ctaText">CTA Button Text</Label>
              <Input
                id="ctaText"
                value={props.ctaText || ""}
                onChange={(e) => updateProp("ctaText", e.target.value)}
                placeholder="Get Started"
              />
            </div>

            <div>
              <Label htmlFor="ctaLink">CTA Button Link</Label>
              <Input
                id="ctaLink"
                value={props.ctaLink || ""}
                onChange={(e) => updateProp("ctaLink", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label>Navigation Links</Label>
              <div className="space-y-2">
                {(props.links || []).map((link: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded">
                    <div className="flex space-x-2">
                      <Input
                        value={link.text || ""}
                        onChange={(e) => {
                          const newLinks = [...(props.links || [])];
                          newLinks[index] = { ...link, text: e.target.value };
                          updateProp("links", newLinks);
                        }}
                        placeholder="Link text"
                      />
                      <Input
                        value={link.href || ""}
                        onChange={(e) => {
                          const newLinks = [...(props.links || [])];
                          newLinks[index] = { ...link, href: e.target.value };
                          updateProp("links", newLinks);
                        }}
                        placeholder="URL"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`external-${index}`}
                          checked={link.external || false}
                          onCheckedChange={(checked) => {
                            const newLinks = [...(props.links || [])];
                            newLinks[index] = { ...link, external: checked };
                            updateProp("links", newLinks);
                          }}
                        />
                        <Label htmlFor={`external-${index}`}>
                          External Link
                        </Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLinks = (props.links || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          updateProp("links", newLinks);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLinks = [
                      ...(props.links || []),
                      { text: "New Link", href: "#", external: false },
                    ];
                    updateProp("links", newLinks);
                  }}
                >
                  Add Link
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ctaExternal"
                checked={props.ctaExternal || false}
                onCheckedChange={(checked) =>
                  updateProp("ctaExternal", checked)
                }
              />
              <Label htmlFor="ctaExternal">CTA is External Link</Label>
            </div>
          </div>
        );

      case "Footer":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={props.logoText || ""}
                onChange={(e) => updateProp("logoText", e.target.value)}
                placeholder="Brand Name"
              />
            </div>

            <div>
              <Label htmlFor="copyright">Copyright Text</Label>
              <Input
                id="copyright"
                value={props.copyright || ""}
                onChange={(e) => updateProp("copyright", e.target.value)}
                placeholder="© 2024 All rights reserved"
              />
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={props.backgroundColor || "#1f2937"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                type="color"
                value={props.textColor || "#ffffff"}
                onChange={(e) => updateProp("textColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "Container":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxWidth">Max Width</Label>
              <select
                id="maxWidth"
                value={props.maxWidth || "xl"}
                onChange={(e) => updateProp("maxWidth", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="sm">Small (640px)</option>
                <option value="md">Medium (768px)</option>
                <option value="lg">Large (1024px)</option>
                <option value="xl">Extra Large (1280px)</option>
                <option value="2xl">2X Large (1536px)</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            <div>
              <Label htmlFor="padding">Padding</Label>
              <select
                id="padding"
                value={props.padding || "md"}
                onChange={(e) => updateProp("padding", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={props.backgroundColor || "#ffffff"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
              />
            </div>
          </div>
        );

      case "Grid":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="columns">Columns</Label>
              <select
                id="columns"
                value={props.columns || 3}
                onChange={(e) =>
                  updateProp("columns", parseInt(e.target.value))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>1 Column</option>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={6}>6 Columns</option>
              </select>
            </div>

            <div>
              <Label htmlFor="gap">Gap</Label>
              <select
                id="gap"
                value={props.gap || "md"}
                onChange={(e) => updateProp("gap", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="responsive"
                checked={props.responsive !== false}
                onCheckedChange={(checked) => updateProp("responsive", checked)}
              />
              <Label htmlFor="responsive">Responsive (Stack on mobile)</Label>
            </div>
          </div>
        );

      case "Video":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src">Video URL</Label>
              <Input
                id="src"
                value={props.src || ""}
                onChange={(e) => updateProp("src", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Video title"
              />
            </div>

            <div>
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <select
                id="aspectRatio"
                value={props.aspectRatio || "16/9"}
                onChange={(e) => updateProp("aspectRatio", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="16/9">16:9 (Widescreen)</option>
                <option value="4/3">4:3 (Standard)</option>
                <option value="1/1">1:1 (Square)</option>
                <option value="21/9">21:9 (Ultrawide)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoplay"
                checked={props.autoplay || false}
                onCheckedChange={(checked) => updateProp("autoplay", checked)}
              />
              <Label htmlFor="autoplay">Autoplay</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="controls"
                checked={props.controls !== false}
                onCheckedChange={(checked) => updateProp("controls", checked)}
              />
              <Label htmlFor="controls">Show Controls</Label>
            </div>
          </div>
        );

      case "Form":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Contact Form"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Form description"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="submitText">Submit Button Text</Label>
              <Input
                id="submitText"
                value={props.submitText || ""}
                onChange={(e) => updateProp("submitText", e.target.value)}
                placeholder="Submit"
              />
            </div>

            <div>
              <Label htmlFor="action">Form Action URL</Label>
              <Input
                id="action"
                value={props.action || ""}
                onChange={(e) => updateProp("action", e.target.value)}
                placeholder="https://example.com/submit"
              />
            </div>

            <div>
              <Label htmlFor="method">Method</Label>
              <select
                id="method"
                value={props.method || "POST"}
                onChange={(e) => updateProp("method", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🔧</div>
            <div className="text-sm">Properties for {type} component</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon...</div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedComponent.type} Component
        </p>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-auto p-4">{renderPropertyFields()}</div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() =>
            selectedComponent && onDuplicateComponent(selectedComponent.id)
          }
        >
          Duplicate Component
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() =>
            selectedComponent && onDeleteComponent(selectedComponent.id)
          }
        >
          Delete Component
        </Button>
      </div>
    </div>
  );
}
