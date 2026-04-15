import { Page } from "@/types/editor";

// ── Field Definitions ──────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "select"
  | "switch"
  | "number"
  | "slider"
  | "items-editor"    // Custom: Navbar links, Accordion items, etc.
  | "link-editor";    // Custom: Button href, CTA links

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  options?: SelectOption[];
  // For sliders
  min?: number;
  max?: number;
  step?: number;
  // For textareas
  rows?: number;
  // Custom editor type identifier
  editorType?: string;
  // Whether the field spans full width in a grid layout
  fullWidth?: boolean;
  // Half-width to pair in a grid
  halfWidth?: boolean;
}

// ── Section Definitions ────────────────────────────────────

export type SectionIcon = "settings" | "type" | "paintbrush" | "link" | "image" | "layout";

export interface PropertySection {
  id: string;
  title: string;
  icon: SectionIcon;
  fields: FieldDefinition[];
}

// ── Shared Style Section Types ─────────────────────────────

export type StyleSectionType =
  | "fill"
  | "dimensions"
  | "spacing"
  | "typography"
  | "borders"
  | "effects"
  | "position";

// ── Component Property Schema ──────────────────────────────

export interface ComponentPropertySchema {
  /** Component-specific property sections */
  sections: PropertySection[];
  /** Which shared style sections this component should show */
  styleSections: StyleSectionType[];
}

// ── Shared Props ───────────────────────────────────────────

export interface PropertyFieldProps {
  value: any;
  onChange: (value: any) => void;
  label: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

export interface StyleSectionProps {
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
  componentType?: string;
}

export interface ComponentPropertiesProps {
  type: string;
  props: Record<string, any>;
  updateProp: (key: string, value: any) => void;
  pages?: Page[];
}
