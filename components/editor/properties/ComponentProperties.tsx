"use client";

import React from "react";
import { Settings2, Type, Paintbrush, Link as LinkIcon, ImageIcon, LayoutGrid } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Page } from "@/types/editor";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { COMPONENT_SCHEMAS } from "./registry";
import { FieldDefinition, SectionIcon, StyleSectionType } from "./types";
import { TextField, TextareaField, ColorField, SelectField, SwitchField } from "./fields";
import {
  FillSection,
  DimensionsSection,
  SpacingSection,
  TypographySection,
  BordersSection,
  EffectsSection,
  PositionSection,
} from "./sections";

// ── Icon mapping ──────────────────────────────────────────
const SECTION_ICONS: Record<SectionIcon, React.ElementType> = {
  settings: Settings2,
  type: Type,
  paintbrush: Paintbrush,
  link: LinkIcon,
  image: ImageIcon,
  layout: LayoutGrid,
};

// ── Style Section Components ──────────────────────────────
const STYLE_SECTION_MAP: Record<StyleSectionType, React.ComponentType<{ props: Record<string, any>; updateProp: (k: string, v: any) => void }>> = {
  fill: FillSection,
  dimensions: DimensionsSection,
  spacing: SpacingSection,
  typography: TypographySection,
  borders: BordersSection,
  effects: EffectsSection,
  position: PositionSection,
};

// ═══════════════════════════════════════════════════════════
// Custom Array Editors — for complex props like links, items
// ═══════════════════════════════════════════════════════════

function NavLinksEditor({ links, updateProp, pages }: { links: any[]; updateProp: (k: string, v: any) => void; pages?: Page[] }) {
  return (
    <div className="space-y-3">
      {(links || []).map((link: any, index: number) => (
        <div key={index} className="space-y-3 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Link #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("links", links.filter((_: any, i: number) => i !== index))}>
              <span className="sr-only">Delete</span>&times;
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Label</Label>
            <Input value={link.text || ""} onChange={(e) => { const n = [...links]; n[index] = { ...link, text: e.target.value }; updateProp("links", n); }} placeholder="Link text" className="h-7 text-xs bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Destination</Label>
            <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
              <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
                <select value={link.href?.startsWith("page:") ? "page" : "url"}
                  onChange={(e) => {
                    const n = [...links];
                    if (e.target.value === "page" && pages && pages.length > 0) {
                      n[index] = { ...link, href: `page:${pages[0].id}` };
                    } else {
                      n[index] = { ...link, href: "" };
                    }
                    updateProp("links", n);
                  }}
                  className="w-full h-7 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none">
                  <option className="bg-background text-foreground" value="url">URL</option>
                  <option className="bg-background text-foreground" value="page">Page</option>
                </select>
              </div>
              {link.href?.startsWith("page:") ? (
                <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
                  <select value={link.href} onChange={(e) => { const n = [...links]; n[index] = { ...link, href: e.target.value }; updateProp("links", n); }}
                    className="w-full h-7 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none">
                    {(pages || []).map((page) => (
                      <option className="bg-background text-foreground" key={page.id} value={`page:${page.id}`}>{page.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input value={link.href || ""} onChange={(e) => { const n = [...links]; n[index] = { ...link, href: e.target.value }; updateProp("links", n); }} placeholder="URL" className="h-7 text-xs bg-background" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor={`external-${index}`} className="text-[10px] uppercase text-muted-foreground font-semibold cursor-pointer">Open in new tab</Label>
            <Switch id={`external-${index}`} checked={link.external || false}
              onCheckedChange={(checked) => { const n = [...links]; n[index] = { ...link, external: checked }; updateProp("links", n); }}
              className="scale-75 origin-right" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("links", [...(links || []), { text: "New Link", href: "#", external: false }])}>
        + Add Link
      </Button>
    </div>
  );
}

function FooterSectionsEditor({ sections, updateProp }: { sections: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(sections || []).map((section: any, sectionIndex: number) => (
        <div key={sectionIndex} className="space-y-3 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Section {sectionIndex + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("sections", sections.filter((_: any, i: number) => i !== sectionIndex))}>
              <span className="sr-only">Delete</span>&times;
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Title</Label>
            <Input value={section.title || ""} onChange={(e) => { const n = [...sections]; n[sectionIndex] = { ...section, title: e.target.value }; updateProp("sections", n); }} placeholder="Section title" className="h-7 text-xs bg-background" />
          </div>
          <div className="space-y-2 pt-1 border-t border-border">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Links</Label>
            {(section.links || []).map((link: any, linkIndex: number) => (
              <div key={linkIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start bg-background p-2 rounded border border-border/50">
                <Input value={link.text || ""} onChange={(e) => { const ns = [...sections]; const nl = [...(section.links || [])]; nl[linkIndex] = { ...link, text: e.target.value }; ns[sectionIndex] = { ...section, links: nl }; updateProp("sections", ns); }} placeholder="Link text" className="h-7 text-xs" />
                <Input value={link.href || ""} onChange={(e) => { const ns = [...sections]; const nl = [...(section.links || [])]; nl[linkIndex] = { ...link, href: e.target.value }; ns[sectionIndex] = { ...section, links: nl }; updateProp("sections", ns); }} placeholder="URL" className="h-7 text-xs" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => { const ns = [...sections]; ns[sectionIndex] = { ...section, links: (section.links || []).filter((_: any, i: number) => i !== linkIndex) }; updateProp("sections", ns); }}>&times;</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-[10px] h-6 border-dashed mt-2"
              onClick={() => { const ns = [...sections]; ns[sectionIndex] = { ...section, links: [...(section.links || []), { text: "Link", href: "#" }] }; updateProp("sections", ns); }}>
              + Add section link
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("sections", [...(sections || []), { title: "New Section", links: [] }])}>
        + Add List
      </Button>
    </div>
  );
}

function SocialLinksEditor({ socialLinks, updateProp }: { socialLinks: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(socialLinks || []).map((social: any, index: number) => (
        <div key={index} className="space-y-3 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Link #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("socialLinks", socialLinks.filter((_: any, i: number) => i !== index))}>
              <span className="sr-only">Delete</span>&times;
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Platform</Label>
            <Input value={social.platform || ""} onChange={(e) => { const n = [...socialLinks]; n[index] = { ...social, platform: e.target.value }; updateProp("socialLinks", n); }} placeholder="Platform name" className="h-7 text-xs bg-background" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">URL</Label>
              <Input value={social.href || ""} onChange={(e) => { const n = [...socialLinks]; n[index] = { ...social, href: e.target.value }; updateProp("socialLinks", n); }} placeholder="URL" className="h-7 text-xs bg-background" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Icon</Label>
              <Input value={social.icon || ""} onChange={(e) => { const n = [...socialLinks]; n[index] = { ...social, icon: e.target.value }; updateProp("socialLinks", n); }} placeholder="Emoji or text" className="h-7 text-xs bg-background" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("socialLinks", [...(socialLinks || []), { platform: "Social", href: "#", icon: "🔗" }])}>
        + Add Social Link
      </Button>
    </div>
  );
}

function AccordionItemsEditor({ items, updateProp }: { items: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(items || []).map((item: any, index: number) => (
        <div key={index} className="space-y-2 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Item #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("items", items.filter((_: any, i: number) => i !== index))}>&times;</Button>
          </div>
          <Input value={item.title || ""} onChange={(e) => { const n = [...items]; n[index] = { ...item, title: e.target.value }; updateProp("items", n); }} placeholder="Title" className="h-7 text-xs bg-background" />
          <Input value={item.content || ""} onChange={(e) => { const n = [...items]; n[index] = { ...item, content: e.target.value }; updateProp("items", n); }} placeholder="Content" className="h-7 text-xs bg-background" />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("items", [...(items || []), { title: "New Item", content: "Content here" }])}>
        + Add Item
      </Button>
    </div>
  );
}

function TabItemsEditor({ tabs, updateProp }: { tabs: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(tabs || []).map((tab: any, index: number) => (
        <div key={index} className="space-y-2 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Tab #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("tabs", tabs.filter((_: any, i: number) => i !== index))}>&times;</Button>
          </div>
          <Input value={tab.label || ""} onChange={(e) => { const n = [...tabs]; n[index] = { ...tab, label: e.target.value }; updateProp("tabs", n); }} placeholder="Tab label" className="h-7 text-xs bg-background" />
          <Input value={tab.content || ""} onChange={(e) => { const n = [...tabs]; n[index] = { ...tab, content: e.target.value }; updateProp("tabs", n); }} placeholder="Content" className="h-7 text-xs bg-background" />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("tabs", [...(tabs || []), { label: "New Tab", content: "Tab content" }])}>
        + Add Tab
      </Button>
    </div>
  );
}

function StatsItemsEditor({ stats, updateProp }: { stats: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(stats || []).map((stat: any, index: number) => (
        <div key={index} className="space-y-2 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Stat #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("stats", stats.filter((_: any, i: number) => i !== index))}>&times;</Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input value={stat.value || ""} onChange={(e) => { const n = [...stats]; n[index] = { ...stat, value: e.target.value }; updateProp("stats", n); }} placeholder="Value" className="h-7 text-xs bg-background" />
            <Input value={stat.label || ""} onChange={(e) => { const n = [...stats]; n[index] = { ...stat, label: e.target.value }; updateProp("stats", n); }} placeholder="Label" className="h-7 text-xs bg-background" />
            <Input value={stat.suffix || ""} onChange={(e) => { const n = [...stats]; n[index] = { ...stat, suffix: e.target.value }; updateProp("stats", n); }} placeholder="Suffix" className="h-7 text-xs bg-background" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("stats", [...(stats || []), { value: "0", label: "LABEL", suffix: "" }])}>
        + Add Stat
      </Button>
    </div>
  );
}

function PricingFeaturesEditor({ features, updateProp }: { features: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(features || []).map((feature: any, index: number) => {
        const featureObj = typeof feature === "string" ? { text: feature, included: true } : feature;
        return (
          <div key={index} className="flex items-center gap-2 p-2 bg-muted border border-border rounded-md">
            <Switch checked={featureObj.included} onCheckedChange={(checked) => { const n = [...features]; n[index] = { ...featureObj, included: checked }; updateProp("features", n); }} className="scale-75" />
            <Input value={featureObj.text || ""} onChange={(e) => { const n = [...features]; n[index] = { ...featureObj, text: e.target.value }; updateProp("features", n); }} placeholder="Feature text" className="h-7 text-xs bg-background flex-1" />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => updateProp("features", features.filter((_: any, i: number) => i !== index))}>&times;</Button>
          </div>
        );
      })}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("features", [...(features || []), { text: "New Feature", included: true }])}>
        + Add Feature
      </Button>
    </div>
  );
}

function FormFieldsEditor({ fields, updateProp }: { fields: any[]; updateProp: (k: string, v: any) => void }) {
  return (
    <div className="space-y-3">
      {(fields || []).map((field: any, index: number) => (
        <div key={index} className="space-y-2 p-3 bg-muted border border-border rounded-md">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground">Field #{index + 1}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 pointer-events-auto"
              onClick={() => updateProp("fields", fields.filter((_: any, i: number) => i !== index))}>&times;</Button>
          </div>
          <Input value={field.label || ""} onChange={(e) => { const n = [...fields]; n[index] = { ...field, label: e.target.value }; updateProp("fields", n); }} placeholder="Label" className="h-7 text-xs bg-background" />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative border border-border rounded-md bg-background">
              <select value={field.type || "text"} onChange={(e) => { const n = [...fields]; n[index] = { ...field, type: e.target.value }; updateProp("fields", n); }}
                className="w-full h-7 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
              </select>
            </div>
            <Input value={field.placeholder || ""} onChange={(e) => { const n = [...fields]; n[index] = { ...field, placeholder: e.target.value }; updateProp("fields", n); }} placeholder="Placeholder" className="h-7 text-xs bg-background" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Required</Label>
            <Switch checked={field.required || false} onCheckedChange={(c) => { const n = [...fields]; n[index] = { ...field, required: c }; updateProp("fields", n); }} className="scale-75 origin-right" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-dashed"
        onClick={() => updateProp("fields", [...(fields || []), { id: `field_${Date.now()}`, type: "text", label: "New Field", placeholder: "" }])}>
        + Add Field
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

interface ComponentPropertiesProps {
  type: string;
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
  pages?: Page[];
}

export function ComponentProperties({ type, props, updateProp, pages }: ComponentPropertiesProps) {
  const schema = COMPONENT_SCHEMAS[type];

  if (!schema) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No property schema defined for component type: <strong>{type}</strong>
      </div>
    );
  }

  // Determine which accordion sections to render
  const defaultOpenSections = [
    ...(schema.sections.length > 0 ? [schema.sections[0].id] : []),
    "fill",
    "dimensions",
  ];

  // Render a single field definition
  const renderField = (field: FieldDefinition) => {
    const value = props[field.key];

    // Custom array editors
    if (field.type === "items-editor") {
      switch (field.editorType) {
        case "nav-links":
          return <NavLinksEditor key={field.key} links={value || []} updateProp={updateProp} pages={pages} />;
        case "footer-sections":
          return <FooterSectionsEditor key={field.key} sections={value || []} updateProp={updateProp} />;
        case "social-links":
          return <SocialLinksEditor key={field.key} socialLinks={value || []} updateProp={updateProp} />;
        case "accordion-items":
          return <AccordionItemsEditor key={field.key} items={value || []} updateProp={updateProp} />;
        case "tab-items":
          return <TabItemsEditor key={field.key} tabs={value || []} updateProp={updateProp} />;
        case "stats-items":
          return <StatsItemsEditor key={field.key} stats={value || []} updateProp={updateProp} />;
        case "pricing-features":
          return <PricingFeaturesEditor key={field.key} features={value || []} updateProp={updateProp} />;
        case "form-fields":
          return <FormFieldsEditor key={field.key} fields={value || []} updateProp={updateProp} />;
        default:
          return null;
      }
    }

    // Switch fields render differently — no label wrapper
    if (field.type === "switch") {
      return (
        <SwitchField
          key={field.key}
          id={field.key}
          label={field.label}
          value={value}
          onChange={(v) => updateProp(field.key, v)}
        />
      );
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <Label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
          {field.label}
        </Label>
        {field.type === "text" && (
          <TextField
            id={field.key}
            value={value || ""}
            onChange={(v) => updateProp(field.key, v)}
            placeholder={field.placeholder}
          />
        )}
        {field.type === "textarea" && (
          <TextareaField
            id={field.key}
            value={value || ""}
            onChange={(v) => updateProp(field.key, v)}
            placeholder={field.placeholder}
            rows={field.rows}
          />
        )}
        {field.type === "color" && (
          <ColorField
            id={field.key}
            value={value || ""}
            onChange={(v) => updateProp(field.key, v)}
          />
        )}
        {field.type === "select" && field.options && (
          <SelectField
            id={field.key}
            value={value || field.options[0]?.value || ""}
            onChange={(v) => updateProp(field.key, v)}
            options={field.options}
          />
        )}
        {field.type === "number" && (
          <Input
            id={field.key}
            type="number"
            value={value ?? ""}
            onChange={(e) => updateProp(field.key, e.target.value === "" ? "" : Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            className="h-8 text-sm"
          />
        )}
        {field.type === "slider" && (
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.01}
            value={value ?? field.defaultValue ?? 0}
            onChange={(e) => updateProp(field.key, parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        )}
      </div>
    );
  };

  return (
    <Accordion type="multiple" defaultValue={defaultOpenSections} className="w-full">
      {/* Component-Specific Sections */}
      {schema.sections.map((section) => {
        const IconComponent = SECTION_ICONS[section.icon] || Settings2;
        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b-0 border-t border-border/50 first:border-t-0"
          >
            <AccordionTrigger className="hover:no-underline py-3 px-4 text-xs font-semibold opacity-90 uppercase tracking-wide data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                {section.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
              {section.fields.map(renderField)}
            </AccordionContent>
          </AccordionItem>
        );
      })}

      {/* Shared Style Sections — only the ones this component needs */}
      {schema.styleSections.map((sectionType) => {
        const SectionComponent = STYLE_SECTION_MAP[sectionType];
        return <SectionComponent key={sectionType} props={props} updateProp={updateProp} />;
      })}
    </Accordion>
  );
}
