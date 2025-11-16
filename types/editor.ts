export interface ComponentDefinition {
    id: string;
    type: string;
    props: Record<string, any>;
    children: ComponentDefinition[];
}

export interface Page {
    id: string;
    name: string;
    slug?: string; // URL slug like "about-us", "contact" (legacy)
    path?: string; // URL path like "/", "/about", "/contact" (preferred)
    components: ComponentDefinition[];
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