import { ApiEndpoint, DbCollection } from "./backend";

/** Firebase config that users provide for their own project's auth & database */
export interface UserFirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
}

export interface ComponentDefinition {
    id: string;
    type: string;
    props: Record<string, any>;
    children: ComponentDefinition[];
    isGlobal?: string; // Global group name, e.g. "Main Navbar"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  components?: ComponentDefinition[];
  pages?: { name: string; path: string; components: ComponentDefinition[] }[];
  timestamp: string;
}

export interface Page {
    id: string;
    name: string;
    slug?: string; // URL slug like "about-us", "contact" (legacy)
    path?: string; // URL path like "/", "/about", "/contact" (preferred)
    components: ComponentDefinition[];
    backgroundColor?: string;
    backgroundType?: "solid" | "gradient" | "image";
    backgroundGradient?: string; // Legacy CSS gradient string
    gradientStart?: string; // New: gradient start color
    gradientEnd?: string; // New: gradient end color
    gradientDirection?: string; // New: gradient direction
    gradientAngle?: string; // New: custom angle
    backgroundImageUrl?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    componentSpacing?: "none" | "compact" | "normal" | "relaxed" | "loose"; // Spacing between components
}

// Flexible: keyed by global name → template component
export type GlobalComponents = Record<string, ComponentDefinition>;

// Custom reusable components saved by the user
export type CustomComponents = Record<string, ComponentDefinition>;

export interface Project {
    id: string;
    name: string;
    pages: Page[];
    globalComponents?: GlobalComponents;
    apiEndpoints?: ApiEndpoint[];
    dbCollections?: DbCollection[];       // User-defined database collections
    firebaseConfig?: UserFirebaseConfig;  // User's own Firebase config for their app
    globalThemeStyle?: string; // Global theme for the project
    isGlobalThemeEnabled?: boolean; // Whether global theme is active
    themeOverrides?: {
        accentColor?: string;
        bgColor?: string;
        textColor?: string;
        fontFamily?: string;
        headingFontFamily?: string;
    };
    createdAt: any;
    updatedAt: any;
}

export interface EditorState {
    components: ComponentDefinition[];
    selectedComponentId: string | null;
    draggedComponent: any;
}

export interface DropZoneData {
    type: "drop-zone";
    targetId?: string;
    position: "before" | "after" | "inside";
}

export interface ComponentData {
    type: "component";
    componentId: string;
}

export interface PaletteItemData {
    type: "palette-item";
    componentType: string;
}