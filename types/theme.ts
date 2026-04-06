export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        error: string;
        success: string;
        warning: string;
    };
    fonts: {
        heading: string;
        body: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
}

export const defaultTheme: Theme = {
    colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1f2937",
        textSecondary: "#6b7280",
        border: "#e5e7eb",
        error: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
    },
    fonts: {
        heading: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
    },
    borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "1rem",
        full: "9999px",
    },
};

export const themePresets: Record<string, Theme> = {
    default: defaultTheme,
    dark: {
        ...defaultTheme,
        colors: {
            primary: "#60a5fa",
            secondary: "#a78bfa",
            accent: "#f472b6",
            background: "#111827",
            surface: "#1f2937",
            text: "#f9fafb",
            textSecondary: "#9ca3af",
            border: "#374151",
            error: "#f87171",
            success: "#34d399",
            warning: "#fbbf24",
        },
    },
    vibrant: {
        ...defaultTheme,
        colors: {
            primary: "#8b5cf6",
            secondary: "#ec4899",
            accent: "#f59e0b",
            background: "#ffffff",
            surface: "#faf5ff",
            text: "#1f2937",
            textSecondary: "#6b7280",
            border: "#e9d5ff",
            error: "#ef4444",
            success: "#10b981",
            warning: "#f59e0b",
        },
    },
    minimal: {
        ...defaultTheme,
        colors: {
            primary: "#000000",
            secondary: "#404040",
            accent: "#737373",
            background: "#ffffff",
            surface: "#fafafa",
            text: "#000000",
            textSecondary: "#737373",
            border: "#e5e5e5",
            error: "#dc2626",
            success: "#16a34a",
            warning: "#ca8a04",
        },
    },
};
