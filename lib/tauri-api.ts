// Tauri API wrapper for desktop-specific features
// This ONLY adds desktop enhancements, does NOT replace Firebase/cloud storage

interface TauriAPI {
    invoke: (cmd: string, args?: any) => Promise<any>;
    isAvailable: boolean;
}

// Check if we're running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Get Tauri API if available
const getTauriAPI = (): TauriAPI | null => {
    if (isTauri && typeof window !== 'undefined') {
        const tauri = (window as any).__TAURI__;
        return {
            invoke: tauri.invoke,
            isAvailable: true,
        };
    }
    return null;
};

export const tauri = getTauriAPI();

// Check if running in Tauri
export function isTauriApp(): boolean {
    return isTauri;
}

// Native save dialog (for exports)
export async function showNativeSaveDialog(
    defaultName: string,
    fileType: 'zip' | 'html' | 'json' = 'zip'
): Promise<string | null> {
    if (!tauri) return null;

    const filters: [string, string[]][] = [];

    switch (fileType) {
        case 'zip':
            filters.push(['ZIP Archive', ['zip']]);
            break;
        case 'html':
            filters.push(['HTML File', ['html']]);
            break;
        case 'json':
            filters.push(['JSON File', ['json']]);
            break;
    }

    try {
        const path = await tauri.invoke('show_save_dialog', {
            defaultName,
            filters,
        });
        return path;
    } catch (error) {
        console.error('Save dialog error:', error);
        return null;
    }
}

// Native open dialog
export async function showNativeOpenDialog(
    fileType: 'json' | 'zip' = 'json'
): Promise<string | null> {
    if (!tauri) return null;

    const filters: [string, string[]][] = [];

    switch (fileType) {
        case 'json':
            filters.push(['JSON File', ['json']]);
            break;
        case 'zip':
            filters.push(['ZIP Archive', ['zip']]);
            break;
    }

    try {
        const path = await tauri.invoke('show_open_dialog', { filters });
        return path;
    } catch (error) {
        console.error('Open dialog error:', error);
        return null;
    }
}

// Show native message dialog
export async function showNativeMessage(
    title: string,
    message: string
): Promise<void> {
    if (tauri) {
        try {
            await tauri.invoke('show_message', { title, message });
        } catch (error) {
            console.error('Message dialog error:', error);
            alert(message);
        }
    } else {
        alert(message);
    }
}

// Show native confirmation dialog
export async function showNativeConfirm(
    title: string,
    message: string
): Promise<boolean> {
    if (tauri) {
        try {
            return await tauri.invoke('show_confirm', { title, message });
        } catch (error) {
            console.error('Confirm dialog error:', error);
            return confirm(message);
        }
    }
    return confirm(message);
}

// Open URL in default browser
export async function openInBrowser(url: string): Promise<void> {
    if (tauri) {
        try {
            await tauri.invoke('open_url', { url });
        } catch (error) {
            console.error('Open URL error:', error);
            window.open(url, '_blank');
        }
    } else {
        window.open(url, '_blank');
    }
}

// Get app version
export async function getAppVersion(): Promise<string> {
    if (isTauri) {
        return '1.0.0'; // You can add a Rust command to get this dynamically
    }
    return 'web';
}

// Enhanced export with native dialog
export async function exportWithNativeDialog(
    blob: Blob,
    defaultName: string,
    fileType: 'zip' | 'html' = 'zip'
): Promise<boolean> {
    if (!tauri) {
        // Fallback to browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }

    try {
        // Show native save dialog
        const savePath = await showNativeSaveDialog(defaultName, fileType);

        if (!savePath) {
            return false; // User cancelled
        }

        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Write file using Tauri's fs API
        const fs = (window as any).__TAURI__.fs;
        await fs.writeBinaryFile(savePath, uint8Array);

        return true;
    } catch (error) {
        console.error('Export error:', error);
        // Fallback to browser download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }
}
