// @ts-nocheck
"use client";
import React from "react";
import { ComponentDefinition, Page } from "@/types/editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Settings2, Type, Paintbrush, Scissors, Link as LinkIcon, Image as ImageIcon } from "lucide-react";



interface PropertiesPanelProps {
  selectedComponent: ComponentDefinition | null;
  onUpdateComponent: (id: string, updates: Record<string, any>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  pages?: Page[];
}

export function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  pages = [],
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

    // Parse dimension value into number and unit
    const parseDimension = (value: string | undefined) => {
      if (!value || value === "auto") return { value: "", unit: "auto" };
      // Handle empty string with unit (e.g., "px" means empty value with px unit)
      if (value && !value.match(/\d/)) {
        return { value: "", unit: value };
      }
      const match = value.match(/^(\d+\.?\d*)(.*)$/);
      if (match) {
        return { value: match[1], unit: match[2] || "px" };
      }
      return { value: "", unit: "px" };
    };

    // Combine value and unit into dimension string
    const combineDimension = (value: string, unit: string) => {
      if (!value || unit === "auto") return "auto";
      return `${value}${unit}`;
    };

    // Combine value and unit, allowing empty during editing
    const combineDimensionAllowEmpty = (value: string, unit: string) => {
      if (unit === "auto") return "auto";
      if (!value) return unit; // Store just the unit when empty
      return `${value}${unit}`;
    };

    // Common color fields for all components
    const renderColorFields = () => {
      return (
        <AccordionItem value="colors" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-gray-500" />
              Colors
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="backgroundColor" className="text-xs font-medium text-gray-600">
                Background
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={props.backgroundColor || "#ffffff"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
                />
                <Input
                  type="text"
                  value={props.backgroundColor || "#ffffff"}
                  onChange={(e) => updateProp("backgroundColor", e.target.value)}
                  className="flex-1 h-8 text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="textColor" className="text-xs font-medium text-gray-600">
                Text Color
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="textColor"
                  type="color"
                  value={props.textColor || "#000000"}
                  onChange={(e) => updateProp("textColor", e.target.value)}
                  className="w-8 h-8 p-0.5 min-h-0 cursor-pointer"
                />
                <Input
                  type="text"
                  value={props.textColor || "#000000"}
                  onChange={(e) => updateProp("textColor", e.target.value)}
                  className="flex-1 h-8 text-xs font-mono"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    // Common dimension fields for all components
    const renderDimensionFields = () => {
      const width = parseDimension(props.width || "");
      const height = parseDimension(props.height || "");

      return (
        <AccordionItem value="dimensions" className="border-b-0 border-t border-gray-100">
          <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-gray-500" />
              Layout
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs font-medium text-gray-600">Width</Label>
                <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                  <Input
                    id="width"
                    type="number"
                    value={width.value}
                    onChange={(e) => updateProp("width", combineDimensionAllowEmpty(e.target.value, width.unit))}
                    onBlur={(e) => {
                      if (!e.target.value && width.unit !== "auto") updateProp("width", "auto");
                    }}
                    placeholder="auto"
                    className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2"
                    disabled={width.unit === "auto"}
                  />
                  <select
                    value={width.unit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      updateProp("width", newUnit === "auto" ? "auto" : combineDimension(width.value || "100", newUnit));
                    }}
                    className="w-14 bg-gray-50 border-l text-xs text-gray-600 px-1 focus:outline-none"
                  >
                    <option value="auto">auto</option>
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs font-medium text-gray-600">Height</Label>
                <div className="flex gap-0 border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                  <Input
                    id="height"
                    type="number"
                    value={height.value}
                    onChange={(e) => updateProp("height", combineDimensionAllowEmpty(e.target.value, height.unit))}
                    onBlur={(e) => {
                      if (!e.target.value && height.unit !== "auto") updateProp("height", "auto");
                    }}
                    placeholder="auto"
                    className="flex-1 h-8 text-xs border-0 rounded-none shadow-none focus-visible:ring-0 px-2"
                    disabled={height.unit === "auto"}
                  />
                  <select
                    value={height.unit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      updateProp("height", newUnit === "auto" ? "auto" : combineDimension(height.value || "100", newUnit));
                    }}
                    className="w-14 bg-gray-50 border-l text-xs text-gray-600 px-1 focus:outline-none"
                  >
                    <option value="auto">auto</option>
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="rem">rem</option>
                  </select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    };

    switch (type) {
      case "Hero":
        return (
          <Accordion type="multiple" defaultValue={["content", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-gray-600">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Enter hero title" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subtitle" className="text-xs font-medium text-gray-600">Subtitle</Label>
                  <Input id="subtitle" value={props.subtitle || ""} onChange={(e) => updateProp("subtitle", e.target.value)} placeholder="Enter subtitle" className="h-8 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-gray-600">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Enter description" rows={3} className="text-sm resize-none" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="primaryButtonText" className="text-xs font-medium text-gray-600">Primary Button Text</Label>
                  <Input id="primaryButtonText" value={props.primaryButtonText || ""} onChange={(e) => updateProp("primaryButtonText", e.target.value)} placeholder="Button text" className="h-8 text-sm" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Text":
        return (
          <Accordion type="multiple" defaultValue={["content", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-medium text-gray-600">Content</Label>
                  <Textarea id="content" value={props.content || ""} onChange={(e) => updateProp("content", e.target.value)} placeholder="Enter text content" rows={4} className="text-sm resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tag" className="text-xs font-medium text-gray-600">HTML Tag</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                      <select id="tag" value={props.tag || "p"} onChange={(e) => updateProp("tag", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
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
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="size" className="text-xs font-medium text-gray-600">Size</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                      <select id="size" value={props.size || "base"} onChange={(e) => updateProp("size", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option value="xs">Extra Small</option>
                        <option value="sm">Small</option>
                        <option value="base">Base</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
                        <option value="2xl">2X Large</option>
                        <option value="3xl">3X Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Button":
        return (
          <Accordion type="multiple" defaultValue={["content", "links", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="text" className="text-xs font-medium text-gray-600">Button Text</Label>
                  <Input id="text" value={props.text || ""} onChange={(e) => updateProp("text", e.target.value)} placeholder="Button text" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-gray-600">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="default">Default</option>
                      <option value="destructive">Destructive</option>
                      <option value="outline">Outline</option>
                      <option value="secondary">Secondary</option>
                      <option value="ghost">Ghost</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="fullWidth" className="text-xs font-medium text-gray-600 cursor-pointer">Full Width</Label>
                  <Switch id="fullWidth" checked={props.fullWidth || false} onCheckedChange={(checked) => updateProp("fullWidth", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  Link Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkType" className="text-xs font-medium text-gray-600">Link Type</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select
                      id="linkType"
                      value={props.href?.startsWith("page:") ? "page" : "url"}
                      onChange={(e) => {
                        if (e.target.value === "page" && pages.length > 0) {
                          updateProp("href", `page:${pages[0].id}`);
                        } else {
                          updateProp("href", "");
                        }
                      }}
                      className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none"
                    >
                      <option value="url">External URL</option>
                      <option value="page">Internal Page</option>
                    </select>
                  </div>
                </div>

                {props.href?.startsWith("page:") ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="href" className="text-xs font-medium text-gray-600">Select Page</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                      <select id="href" value={props.href} onChange={(e) => updateProp("href", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        {pages.map((page) => (
                          <option key={page.id} value={`page:${page.id}`}>
                            {page.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="href" className="text-xs font-medium text-gray-600">Link URL</Label>
                    <Input id="href" value={props.href || ""} onChange={(e) => updateProp("href", e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                  </div>
                )}

                {props.href && !props.href.startsWith("page:") && (
                  <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                    <Label htmlFor="external" className="text-xs font-medium text-gray-600 cursor-pointer">Open in new tab</Label>
                    <Switch id="external" checked={props.external || false} onCheckedChange={(checked) => updateProp("external", checked)} className="scale-75 origin-right" />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Image":
        return (
          <Accordion type="multiple" defaultValue={["content", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Image Source
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="src" className="text-xs font-medium text-gray-600">Image URL</Label>
                  <Input id="src" value={props.src || ""} onChange={(e) => updateProp("src", e.target.value)} placeholder="https://example.com/image.jpg" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="alt" className="text-xs font-medium text-gray-600">Alt Text</Label>
                  <Input id="alt" value={props.alt || ""} onChange={(e) => updateProp("alt", e.target.value)} placeholder="Describe the image" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rounded" className="text-xs font-medium text-gray-600">Border Radius Corners</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="rounded" value={props.rounded || "md"} onChange={(e) => updateProp("rounded", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="full">Full (Circle)</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Card":
        return (
          <Accordion type="multiple" defaultValue={["content", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Card Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-gray-600">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Card title" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-gray-600">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Card description" rows={3} className="text-sm resize-none" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="buttonText" className="text-xs font-medium text-gray-600">Button Text</Label>
                  <Input id="buttonText" value={props.buttonText || ""} onChange={(e) => updateProp("buttonText", e.target.value)} placeholder="Learn More" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-gray-600">Card Style</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="default">Default</option>
                      <option value="bordered">Bordered</option>
                      <option value="shadow">Shadow</option>
                      <option value="elevated">Elevated</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Header":
        return (
          <Accordion type="multiple" defaultValue={["settings", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="settings" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  Header Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="sticky" className="text-xs font-medium text-gray-600 cursor-pointer">Sticky Header</Label>
                  <Switch id="sticky" checked={props.sticky || false} onCheckedChange={(checked) => updateProp("sticky", checked)} className="scale-75 origin-right" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="shadow" className="text-xs font-medium text-gray-600 cursor-pointer">Drop Shadow</Label>
                  <Switch id="shadow" checked={props.shadow || false} onCheckedChange={(checked) => updateProp("shadow", checked)} className="scale-75 origin-right" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-gray-600">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="padding" value={props.padding || "md"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Navbar":
        return (
          <Accordion type="multiple" defaultValue={["brand", "links", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="brand" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  Brand & CTA
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="logoText" className="text-xs font-medium text-gray-600">Logo Text</Label>
                  <Input id="logoText" value={props.logoText || ""} onChange={(e) => updateProp("logoText", e.target.value)} placeholder="Brand Name" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="ctaText" className="text-xs font-medium text-gray-600">CTA Button Text</Label>
                  <Input id="ctaText" value={props.ctaText || ""} onChange={(e) => updateProp("ctaText", e.target.value)} placeholder="Get Started" className="h-8 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ctaLink" className="text-xs font-medium text-gray-600">CTA Button Link</Label>
                  <Input id="ctaLink" value={props.ctaLink || ""} onChange={(e) => updateProp("ctaLink", e.target.value)} placeholder="https://example.com" className="h-8 text-sm" />
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="ctaExternal" className="text-xs font-medium text-gray-600 cursor-pointer">CTA is External Link</Label>
                  <Switch
                    id="ctaExternal"
                    checked={props.ctaExternal || false}
                    onCheckedChange={(checked) =>
                      updateProp("ctaExternal", checked)
                    }
                    className="scale-75 origin-right"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  Navigation Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-3">
                  {(props.links || []).map((link: any, index: number) => (
                    <div key={index} className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-xs font-semibold text-gray-500">Link #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 pointer-events-auto"
                          onClick={() => {
                            const newLinks = (props.links || []).filter((_: any, i: number) => i !== index);
                            updateProp("links", newLinks);
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          &times;
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-gray-500 font-semibold">Label</Label>
                        <Input
                          value={link.text || ""}
                          onChange={(e) => {
                            const newLinks = [...(props.links || [])];
                            newLinks[index] = { ...link, text: e.target.value };
                            updateProp("links", newLinks);
                          }}
                          placeholder="Link text"
                          className="h-7 text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-gray-500 font-semibold">Destination</Label>
                        <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
                          <div className="relative border border-gray-200 rounded-md focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                            <select
                              value={link.href?.startsWith("page:") ? "page" : "url"}
                              onChange={(e) => {
                                const newLinks = [...(props.links || [])];
                                if (e.target.value === "page" && pages.length > 0) {
                                  newLinks[index] = { ...link, href: `page:${pages[0].id}` };
                                } else {
                                  newLinks[index] = { ...link, href: "" };
                                }
                                updateProp("links", newLinks);
                              }}
                              className="w-full h-7 px-1 text-xs bg-transparent appearance-none focus:outline-none"
                            >
                              <option value="url">URL</option>
                              <option value="page">Page</option>
                            </select>
                          </div>
                          
                          {link.href?.startsWith("page:") ? (
                            <div className="relative border border-gray-200 rounded-md focus-within:ring-1 focus-within:ring-blue-500 bg-white">
                              <select
                                value={link.href}
                                onChange={(e) => {
                                  const newLinks = [...(props.links || [])];
                                  newLinks[index] = { ...link, href: e.target.value };
                                  updateProp("links", newLinks);
                                }}
                                className="w-full h-7 px-1 text-xs bg-transparent appearance-none focus:outline-none"
                              >
                                {pages.map((page) => (
                                  <option key={page.id} value={`page:${page.id}`}>
                                    {page.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <Input
                              value={link.href || ""}
                              onChange={(e) => {
                                const newLinks = [...(props.links || [])];
                                newLinks[index] = { ...link, href: e.target.value };
                                updateProp("links", newLinks);
                              }}
                              placeholder="URL"
                              className="h-7 text-xs bg-white"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Label htmlFor={`external-${index}`} className="text-[10px] uppercase text-gray-500 font-semibold cursor-pointer">Open in new tab</Label>
                        <Switch
                          id={`external-${index}`}
                          checked={link.external || false}
                          onCheckedChange={(checked) => {
                            const newLinks = [...(props.links || [])];
                            newLinks[index] = { ...link, external: checked };
                            updateProp("links", newLinks);
                          }}
                          className="scale-75 origin-right"
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 border-dashed"
                    onClick={() => {
                      const newLinks = [...(props.links || []), { text: "New Link", href: "#", external: false }];
                      updateProp("links", newLinks);
                    }}
                  >
                    + Add Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="styling" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-gray-500" />
                  Link Styling
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkColor" className="text-xs font-medium text-gray-600">Link Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="linkColor" type="color" value={props.linkColor || "#000000"} onChange={(e) => updateProp("linkColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                    <Input type="text" value={props.linkColor || "#000000"} onChange={(e) => updateProp("linkColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="linkHoverColor" className="text-xs font-medium text-gray-600">Link Hover Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="linkHoverColor" type="color" value={props.linkHoverColor || "#3b82f6"} onChange={(e) => updateProp("linkHoverColor", e.target.value)} className="w-8 h-8 p-0.5 min-h-0 cursor-pointer" />
                    <Input type="text" value={props.linkHoverColor || "#3b82f6"} onChange={(e) => updateProp("linkHoverColor", e.target.value)} className="flex-1 h-8 text-xs font-mono" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Footer":
        return (
          <Accordion type="multiple" defaultValue={["brand", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="brand" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  Footer Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="logoText" className="text-xs font-medium text-gray-600">Logo Text</Label>
                  <Input id="logoText" value={props.logoText || ""} onChange={(e) => updateProp("logoText", e.target.value)} placeholder="Brand Name" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-gray-600">Description</Label>
                  <Textarea id="description" value={props.description || ""} onChange={(e) => updateProp("description", e.target.value)} placeholder="Brief description about your brand" rows={3} className="text-sm resize-none" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  Footer Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="copyright" className="text-xs font-medium text-gray-600">Copyright Text</Label>
                  <Input id="copyright" value={props.copyright || ""} onChange={(e) => updateProp("copyright", e.target.value)} placeholder="© 2024 All rights reserved" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-medium text-gray-600">Footer Sections</div>
                  <div className="space-y-3">
                    {(props.sections || []).map((section: any, sectionIndex: number) => (
                      <div key={sectionIndex} className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between pointer-events-none">
                          <span className="text-xs font-semibold text-gray-500">Section {sectionIndex + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 pointer-events-auto"
                            onClick={() => {
                              const newSections = (props.sections || []).filter((_: any, i: number) => i !== sectionIndex);
                              updateProp("sections", newSections);
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            &times;
                          </Button>
                        </div>
                        
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-gray-500 font-semibold">Title</Label>
                          <Input
                            value={section.title || ""}
                            onChange={(e) => {
                              const newSections = [...(props.sections || [])];
                              newSections[sectionIndex] = { ...section, title: e.target.value };
                              updateProp("sections", newSections);
                            }}
                            placeholder="Section title (e.g., Products)"
                            className="h-7 text-xs bg-white"
                          />
                        </div>

                        <div className="space-y-2 pt-1 border-t border-gray-200">
                          <Label className="text-[10px] uppercase text-gray-500 font-semibold">Links</Label>
                          <div className="space-y-2">
                            {(section.links || []).map((link: any, linkIndex: number) => (
                              <div key={linkIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start bg-white p-2 rounded border border-gray-100">
                                <Input
                                  value={link.text || ""}
                                  onChange={(e) => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = [...(section.links || [])];
                                    newLinks[linkIndex] = { ...link, text: e.target.value };
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                  placeholder="Link text"
                                  className="h-7 text-xs"
                                />
                                <Input
                                  value={link.href || ""}
                                  onChange={(e) => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = [...(section.links || [])];
                                    newLinks[linkIndex] = { ...link, href: e.target.value };
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                  placeholder="URL"
                                  className="h-7 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const newSections = [...(props.sections || [])];
                                    const newLinks = (section.links || []).filter((_: any, i: number) => i !== linkIndex);
                                    newSections[sectionIndex] = { ...section, links: newLinks };
                                    updateProp("sections", newSections);
                                  }}
                                >
                                  &times;
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] h-6 border-dashed mt-2"
                            onClick={() => {
                              const newSections = [...(props.sections || [])];
                              const newLinks = [...(section.links || []), { text: "Link", href: "#" }];
                              newSections[sectionIndex] = { ...section, links: newLinks };
                              updateProp("sections", newSections);
                            }}
                          >
                            + Add section link
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed"
                      onClick={() => {
                        const newSections = [...(props.sections || []), { title: "New Section", links: [] }];
                        updateProp("sections", newSections);
                      }}
                    >
                      + Add List
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="socials" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  Social Links
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-3">
                  {(props.socialLinks || []).map((social: any, index: number) => (
                    <div key={index} className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-xs font-semibold text-gray-500">Link #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 pointer-events-auto"
                          onClick={() => {
                            const newSocials = (props.socialLinks || []).filter((_: any, i: number) => i !== index);
                            updateProp("socialLinks", newSocials);
                          }}
                        >
                          <span className="sr-only">Delete</span>
                          &times;
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase text-gray-500 font-semibold">Platform</Label>
                        <Input
                          value={social.platform || ""}
                          onChange={(e) => {
                            const newSocials = [...(props.socialLinks || [])];
                            newSocials[index] = { ...social, platform: e.target.value };
                            updateProp("socialLinks", newSocials);
                          }}
                          placeholder="Platform name (e.g., Twitter)"
                          className="h-7 text-xs bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-gray-500 font-semibold">URL</Label>
                          <Input
                            value={social.href || ""}
                            onChange={(e) => {
                              const newSocials = [...(props.socialLinks || [])];
                              newSocials[index] = { ...social, href: e.target.value };
                              updateProp("socialLinks", newSocials);
                            }}
                            placeholder="URL"
                            className="h-7 text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase text-gray-500 font-semibold">Icon</Label>
                          <Input
                            value={social.icon || ""}
                            onChange={(e) => {
                              const newSocials = [...(props.socialLinks || [])];
                              newSocials[index] = { ...social, icon: e.target.value };
                              updateProp("socialLinks", newSocials);
                            }}
                            placeholder="Emoji or text"
                            className="h-7 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 border-dashed"
                    onClick={() => {
                      const newSocials = [...(props.socialLinks || []), { platform: "Social", href: "#", icon: "🔗" }];
                      updateProp("socialLinks", newSocials);
                    }}
                  >
                    + Add Social Link
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Container":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-gray-500" />
                  Layout Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="maxWidth" className="text-xs font-medium text-gray-600">Max Width</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="maxWidth" value={props.maxWidth || "xl"} onChange={(e) => updateProp("maxWidth", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="sm">Small (640px)</option>
                      <option value="md">Medium (768px)</option>
                      <option value="lg">Large (1024px)</option>
                      <option value="xl">Extra Large (1280px)</option>
                      <option value="2xl">2X Large (1536px)</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-gray-600">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="padding" value={props.padding || "md"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="display" className="text-xs font-medium text-gray-600">Display</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="display" value={props.display || "block"} onChange={(e) => updateProp("display", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="block">Block</option>
                      <option value="flex">Flex</option>
                    </select>
                  </div>
                </div>

                {props.display === "flex" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="flexDirection" className="text-xs font-medium text-gray-600">Direction</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                          <select id="flexDirection" value={props.flexDirection || "row"} onChange={(e) => updateProp("flexDirection", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                            <option value="row-reverse">Row Reverse</option>
                            <option value="column-reverse">Column Reverse</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="flexWrap" className="text-xs font-medium text-gray-600">Wrap</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                          <select id="flexWrap" value={props.flexWrap || "nowrap"} onChange={(e) => updateProp("flexWrap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option value="nowrap">No Wrap</option>
                            <option value="wrap">Wrap</option>
                            <option value="wrap-reverse">Wrap Reverse</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="justifyContent" className="text-xs font-medium text-gray-600">Justify</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                          <select id="justifyContent" value={props.justifyContent || "start"} onChange={(e) => updateProp("justifyContent", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                            <option value="between">Space Between</option>
                            <option value="around">Space Around</option>
                            <option value="evenly">Space Evenly</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="alignItems" className="text-xs font-medium text-gray-600">Align</Label>
                        <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                          <select id="alignItems" value={props.alignItems || "start"} onChange={(e) => updateProp("alignItems", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                            <option value="stretch">Stretch</option>
                            <option value="baseline">Baseline</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gap" className="text-xs font-medium text-gray-600">Gap</Label>
                      <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                        <select id="gap" value={props.gap || "none"} onChange={(e) => updateProp("gap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                          <option value="none">None</option>
                          <option value="sm">Small</option>
                          <option value="md">Medium</option>
                          <option value="lg">Large</option>
                          <option value="xl">Extra Large</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="overflowX" className="text-xs font-medium text-gray-600">Overflow X</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                      <select id="overflowX" value={props.overflowX || "visible"} onChange={(e) => updateProp("overflowX", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                        <option value="scroll">Scroll</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="overflowY" className="text-xs font-medium text-gray-600">Overflow Y</Label>
                    <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                      <select id="overflowY" value={props.overflowY || "visible"} onChange={(e) => updateProp("overflowY", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                        <option value="scroll">Scroll</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Grid":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-gray-500" />
                  Grid Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="columns" className="text-xs font-medium text-gray-600">Columns</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="columns" value={props.columns || 3} onChange={(e) => updateProp("columns", parseInt(e.target.value))} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value={1}>1 Column</option>
                      <option value={2}>2 Columns</option>
                      <option value={3}>3 Columns</option>
                      <option value={4}>4 Columns</option>
                      <option value={6}>6 Columns</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gap" className="text-xs font-medium text-gray-600">Gap</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="gap" value={props.gap || "md"} onChange={(e) => updateProp("gap", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="responsive" className="text-xs font-medium text-gray-600 cursor-pointer">Responsive (Stack on mobile)</Label>
                  <Switch id="responsive" checked={props.responsive !== false} onCheckedChange={(checked) => updateProp("responsive", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Section":
        return (
          <Accordion type="multiple" defaultValue={["layout", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="layout" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-gray-500" />
                  Section Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="padding" className="text-xs font-medium text-gray-600">Padding</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="padding" value={props.padding || "lg"} onChange={(e) => updateProp("padding", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxWidth" className="text-xs font-medium text-gray-600">Max Width</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="maxWidth" value={props.maxWidth || "xl"} onChange={(e) => updateProp("maxWidth", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="sm">Small (640px)</option>
                      <option value="md">Medium (768px)</option>
                      <option value="lg">Large (1024px)</option>
                      <option value="xl">Extra Large (1280px)</option>
                      <option value="2xl">2X Large (1536px)</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Video":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="src" className="mb-2 block">
                Video URL
              </Label>
              <Input
                id="src"
                value={props.src || ""}
                onChange={(e) => updateProp("src", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="title" className="mb-2 block">
                Video Title
              </Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Video title"
              />
            </div>

            <div>
              <Label htmlFor="aspectRatio" className="mb-2 block">
                Aspect Ratio
              </Label>
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
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Form Title
              </Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Contact Form"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Form description"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="submitText" className="mb-2 block">
                Submit Button Text
              </Label>
              <Input
                id="submitText"
                value={props.submitText || ""}
                onChange={(e) => updateProp("submitText", e.target.value)}
                placeholder="Submit"
              />
            </div>

            <div>
              <Label htmlFor="action" className="mb-2 block">
                Form Action URL
              </Label>
              <Input
                id="action"
                value={props.action || ""}
                onChange={(e) => updateProp("action", e.target.value)}
                placeholder="https://example.com/submit"
              />
            </div>

            <div>
              <Label htmlFor="method" className="mb-2 block">
                Method
              </Label>
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

      case "Accordion":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label className="mb-2 block">Accordion Items</Label>
              <div className="space-y-2">
                {(props.items || []).map((item: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded">
                    <Input
                      value={item.title || ""}
                      onChange={(e) => {
                        const newItems = [...(props.items || [])];
                        newItems[index] = { ...item, title: e.target.value };
                        updateProp("items", newItems);
                      }}
                      placeholder="Item title"
                    />
                    <Textarea
                      value={item.content || ""}
                      onChange={(e) => {
                        const newItems = [...(props.items || [])];
                        newItems[index] = { ...item, content: e.target.value };
                        updateProp("items", newItems);
                      }}
                      placeholder="Item content"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = (props.items || []).filter(
                          (_: any, i: number) => i !== index
                        );
                        updateProp("items", newItems);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = [
                      ...(props.items || []),
                      { title: "New Item", content: "Content here" },
                    ];
                    updateProp("items", newItems);
                  }}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        );

      case "Tabs":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label className="mb-2 block">Tab Items</Label>
              <div className="space-y-2">
                {(props.tabs || []).map((tab: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded">
                    <Input
                      value={tab.label || ""}
                      onChange={(e) => {
                        const newTabs = [...(props.tabs || [])];
                        newTabs[index] = { ...tab, label: e.target.value };
                        updateProp("tabs", newTabs);
                      }}
                      placeholder="Tab label"
                    />
                    <Textarea
                      value={tab.content || ""}
                      onChange={(e) => {
                        const newTabs = [...(props.tabs || [])];
                        newTabs[index] = { ...tab, content: e.target.value };
                        updateProp("tabs", newTabs);
                      }}
                      placeholder="Tab content"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTabs = (props.tabs || []).filter(
                          (_: any, i: number) => i !== index
                        );
                        updateProp("tabs", newTabs);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTabs = [
                      ...(props.tabs || []),
                      { label: "New Tab", content: "Content here" },
                    ];
                    updateProp("tabs", newTabs);
                  }}
                >
                  Add Tab
                </Button>
              </div>
            </div>
          </div>
        );

      case "Testimonial":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="quote" className="mb-2 block">
                Quote
              </Label>
              <Textarea
                id="quote"
                value={props.quote || ""}
                onChange={(e) => updateProp("quote", e.target.value)}
                placeholder="Enter testimonial quote"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="author" className="mb-2 block">
                Author Name
              </Label>
              <Input
                id="author"
                value={props.author || ""}
                onChange={(e) => updateProp("author", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="role" className="mb-2 block">
                Author Role
              </Label>
              <Input
                id="role"
                value={props.role || ""}
                onChange={(e) => updateProp("role", e.target.value)}
                placeholder="CEO, Company"
              />
            </div>
            <div>
              <Label htmlFor="avatar" className="mb-2 block">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={props.avatar || ""}
                onChange={(e) => updateProp("avatar", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div>
              <Label htmlFor="rating" className="mb-2 block">
                Rating (1-5)
              </Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={props.rating || 5}
                onChange={(e) => updateProp("rating", parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      case "PricingCard":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Plan Name
              </Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Pro Plan"
              />
            </div>
            <div>
              <Label htmlFor="price" className="mb-2 block">
                Price
              </Label>
              <Input
                id="price"
                value={props.price || ""}
                onChange={(e) => updateProp("price", e.target.value)}
                placeholder="$29"
              />
            </div>
            <div>
              <Label htmlFor="period" className="mb-2 block">
                Billing Period
              </Label>
              <Input
                id="period"
                value={props.period || ""}
                onChange={(e) => updateProp("period", e.target.value)}
                placeholder="/month"
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Plan description"
                rows={2}
              />
            </div>
            <div>
              <Label className="mb-2 block">Features</Label>
              <div className="space-y-2">
                {(props.features || []).map(
                  (feature: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...(props.features || [])];
                          newFeatures[index] = e.target.value;
                          updateProp("features", newFeatures);
                        }}
                        placeholder="Feature"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFeatures = (props.features || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          updateProp("features", newFeatures);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFeatures = [
                      ...(props.features || []),
                      "New feature",
                    ];
                    updateProp("features", newFeatures);
                  }}
                >
                  Add Feature
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="buttonText" className="mb-2 block">
                Button Text
              </Label>
              <Input
                id="buttonText"
                value={props.buttonText || ""}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                placeholder="Get Started"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={props.featured || false}
                onCheckedChange={(checked) => updateProp("featured", checked)}
              />
              <Label htmlFor="featured">Featured Plan</Label>
            </div>
          </div>
        );

      case "Feature":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="icon" className="mb-2 block">
                Icon (Emoji)
              </Label>
              <Input
                id="icon"
                value={props.icon || ""}
                onChange={(e) => updateProp("icon", e.target.value)}
                placeholder="⭐"
              />
            </div>
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Feature title"
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Feature description"
                rows={3}
              />
            </div>
          </div>
        );

      case "Stats":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="accentColor" className="mb-2 block">
                Accent Color (for values)
              </Label>
              <Input
                id="accentColor"
                type="color"
                value={props.accentColor || "#3b82f6"}
                onChange={(e) => updateProp("accentColor", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Statistics</Label>
              <div className="space-y-2">
                {(props.stats || []).map((stat: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded">
                    <Input
                      value={stat.value || ""}
                      onChange={(e) => {
                        const newStats = [...(props.stats || [])];
                        newStats[index] = { ...stat, value: e.target.value };
                        updateProp("stats", newStats);
                      }}
                      placeholder="100+"
                    />
                    <Input
                      value={stat.label || ""}
                      onChange={(e) => {
                        const newStats = [...(props.stats || [])];
                        newStats[index] = { ...stat, label: e.target.value };
                        updateProp("stats", newStats);
                      }}
                      placeholder="Customers"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newStats = (props.stats || []).filter(
                          (_: any, i: number) => i !== index
                        );
                        updateProp("stats", newStats);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStats = [
                      ...(props.stats || []),
                      { value: "100+", label: "Stat" },
                    ];
                    updateProp("stats", newStats);
                  }}
                >
                  Add Stat
                </Button>
              </div>
            </div>
          </div>
        );

      case "CTA":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                value={props.title || ""}
                onChange={(e) => updateProp("title", e.target.value)}
                placeholder="Ready to get started?"
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={props.description || ""}
                onChange={(e) => updateProp("description", e.target.value)}
                placeholder="Join thousands of users today"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="buttonText" className="mb-2 block">
                Button Text
              </Label>
              <Input
                id="buttonText"
                value={props.buttonText || ""}
                onChange={(e) => updateProp("buttonText", e.target.value)}
                placeholder="Get Started"
              />
            </div>
            <div>
              <Label htmlFor="buttonLink" className="mb-2 block">
                Button Link
              </Label>
              <Input
                id="buttonLink"
                value={props.buttonLink || ""}
                onChange={(e) => updateProp("buttonLink", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case "Divider":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="thickness" className="mb-2 block">
                Thickness
              </Label>
              <select
                id="thickness"
                value={props.thickness || "1"}
                onChange={(e) => updateProp("thickness", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="4">4px</option>
                <option value="8">8px</option>
              </select>
            </div>
            <div>
              <Label htmlFor="color" className="mb-2 block">
                Color
              </Label>
              <Input
                id="color"
                type="color"
                value={props.color || "#e5e7eb"}
                onChange={(e) => updateProp("color", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="style" className="mb-2 block">
                Style
              </Label>
              <select
                id="style"
                value={props.style || "solid"}
                onChange={(e) => updateProp("style", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>
        );

      case "Spacer":
        return (
          <div className="space-y-4">
            {renderColorFields()}
            {renderDimensionFields()}
            <div>
              <Label htmlFor="size" className="mb-2 block">
                Size
              </Label>
              <select
                id="size"
                value={props.size || "md"}
                onChange={(e) => updateProp("size", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="xs">Extra Small (8px)</option>
                <option value="sm">Small (16px)</option>
                <option value="md">Medium (32px)</option>
                <option value="lg">Large (64px)</option>
                <option value="xl">Extra Large (128px)</option>
              </select>
            </div>
          </div>
        );

      case "Badge":
        return (
          <Accordion type="multiple" defaultValue={["content", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Badge Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="text" className="text-xs font-medium text-gray-600">Text</Label>
                  <Input id="text" value={props.text || ""} onChange={(e) => updateProp("text", e.target.value)} placeholder="New" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-gray-600">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="variant" value={props.variant || "default"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="default">Default</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
        );

      case "Alert":
        return (
          <Accordion type="multiple" defaultValue={["content", "colors", "dimensions"]} className="w-full">
            <AccordionItem value="content" className="border-b-0 border-t border-gray-100 first:border-t-0">
              <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide data-[state=open]:bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  Alert Content
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-gray-600">Title</Label>
                  <Input id="title" value={props.title || ""} onChange={(e) => updateProp("title", e.target.value)} placeholder="Alert title" className="h-8 text-sm" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-medium text-gray-600">Message</Label>
                  <Textarea id="message" value={props.message || ""} onChange={(e) => updateProp("message", e.target.value)} placeholder="Alert message" rows={2} className="text-sm resize-none" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variant" className="text-xs font-medium text-gray-600">Variant</Label>
                  <div className="relative border rounded-md focus-within:ring-1 focus-within:ring-blue-500">
                    <select id="variant" value={props.variant || "info"} onChange={(e) => updateProp("variant", e.target.value)} className="w-full h-8 px-2 text-sm bg-transparent appearance-none focus:outline-none">
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-100">
                  <Label htmlFor="dismissible" className="text-xs font-medium text-gray-600 cursor-pointer">Dismissible</Label>
                  <Switch id="dismissible" checked={props.dismissible || false} onCheckedChange={(checked) => updateProp("dismissible", checked)} className="scale-75 origin-right" />
                </div>
              </AccordionContent>
            </AccordionItem>
            {renderColorFields()}
            {renderDimensionFields()}
          </Accordion>
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
