import { useState, useCallback } from 'react';
import { ComponentDefinition } from '@/types/editor';

export function useComponentClipboard() {
    const [clipboard, setClipboard] = useState<ComponentDefinition | null>(null);

    const copyComponent = useCallback((component: ComponentDefinition) => {
        setClipboard(component);
    }, []);

    const pasteComponent = useCallback(() => {
        return clipboard;
    }, [clipboard]);

    const hasClipboard = clipboard !== null;

    return {
        copyComponent,
        pasteComponent,
        hasClipboard,
        clipboard,
    };
}
