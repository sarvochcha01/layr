import { ComponentDefinition } from "./editor";

export interface Project {
    id: string;
    name: string;
    description?: string;
    components: ComponentDefinition[];
    thumbnail?: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    components?: ComponentDefinition[];
}

export interface UpdateProjectInput {
    name?: string;
    description?: string;
    components?: ComponentDefinition[];
    thumbnail?: string;
}
