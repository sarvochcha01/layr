# Layr Technical Documentation

## 1. Architecture & Technical Details

### Web vs Desktop Architecture

| Feature | Web Version | Desktop Version (Tauri) |
| :--- | :--- | :--- |
| **Storage** | Cloud (Firebase) | Local File System |
| **Auth** | Required (Firebase) | None (Local only) |
| **Offline** | Limited | Full Offline Support |
| **Performance** | Network Dependent | Instant Local Access |
| **Privacy** | Cloud Stored | Local Only |

### File Structure

```
layr/
├── src-tauri/              # Rust backend (Tauri)
│   ├── src/main.rs         # Tauri commands (save/load/export)
│   └── tauri.conf.json     # App configuration
├── app/                    # Next.js App Router frontend
├── components/             # React components
│   ├── builder/            # Draggable builder components
│   └── editor/             # Editor UI (panels, canvas)
├── lib/
│   ├── tauri-api.ts        # Bridge between frontend and Tauri
│   └── codeGenerator.ts    # Export logic
└── templates/              # JSON templates for new projects
```

### Tauri Integration

The desktop app wraps the Next.js frontend. It intercepts storage calls and redirects them to the local file system using Rust commands defined in `src-tauri/src/main.rs`.

*   **Projects Location**:
    *   Windows: `%APPDATA%\website-builder\projects\`
    *   macOS: `~/Library/Application Support/website-builder/projects/`
    *   Linux: `~/.local/share/website-builder/projects/`

---

## 2. API Reference

### Frontend API (`lib/tauri-api.ts`)

This is the main bridge between the React frontend and the Tauri backend.

*   `saveProjectLocal(project: Project): Promise<void>`
    *   Saves the project JSON to the local file system.
*   `loadProjectLocal(projectId: string): Promise<Project>`
    *   Loads a project by ID from the local file system.
*   `listProjectsLocal(): Promise<ProjectMetadata[]>`
    *   Returns a list of all available projects.
*   `deleteProjectLocal(projectId: string): Promise<void>`
    *   Permanently deletes a project file.
*   `exportProjectDesktop(pages: Page[], format: 'html' | 'react', name: string): Promise<string>`
    *   Opens a native save dialog and exports the project as a ZIP file.
*   `isTauriApp(): boolean`
    *   Returns `true` if running in the Tauri desktop environment.

### Rust Commands (`src-tauri/src/main.rs`)

These commands are invoked by the frontend via Tauri's IPC system.

*   `save_project(project: String)`
    *   Writes the project JSON string to a file.
*   `load_project(id: String) -> String`
    *   Reads and returns the project JSON string.
*   `list_projects() -> Vec<ProjectMetadata>`
    *   Scans the projects directory and returns metadata.
*   `delete_project(id: String)`
    *   Deletes the specified project file.
*   `show_save_dialog(default_name: String, filters: Vec<...>)`
    *   Opens the OS native save file dialog.

---

## 3. Features Guide

### 🎨 Global Theme System
Manage colors, fonts, and spacing across your entire project.
*   **Presets**: Default, Dark, Vibrant, Minimal.
*   **Customization**: Edit primary/secondary colors, fonts, spacing scale, and border radius.
*   **Usage**: Access via the "Theme" tab (coming soon to UI) or configure in `types/theme.ts`.

### ⌨️ Keyboard Shortcuts
Press `?` to toggle the shortcuts panel.
*   **General**: `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Esc` (Deselect).
*   **Selection**: `Ctrl+A` (Select All), `Ctrl+Click` (Multi-select).
*   **Components**: `Delete`, `Ctrl+D` (Duplicate), `Ctrl+C` (Copy), `Ctrl+V` (Paste).

### 📋 Copy & Paste
*   Select a component, `Ctrl+C` to copy, `Ctrl+V` to paste.
*   Works across pages and preserves component hierarchy.

### ⭐ Favorites & Recent
*   **Favorites**: Click the star icon on components in the palette to pin them to the top.
*   **Recent**: Automatically tracks the last 10 used components.

### 📄 Page Duplication
*   Click the duplicate icon on a page in the Pages panel to create a full copy with all components.

### ↩️ Undo/Redo
*   Tracks up to 50 actions (adding/moving/deleting components, property changes).
*   Works with `Ctrl+Z` / `Ctrl+Y`.

### 🦶 Footer Sections
*   Create organized footers with multiple link sections and social icons.
*   Customize background color, text color, logo, and copyright text via the Properties Panel.

### 📤 Export Options
1.  **HTML Export**: Generates static HTML, CSS, and JS files. Ideal for simple static hosting.
2.  **React/Next.js Export**: Generates a full Next.js project with TypeScript and Tailwind CSS. Ideal for further development.

---

## 4. Migration Guide (Web to Desktop)

If moving from the web version:
1.  **Storage**: `useProjects` hook now uses `tauri-api.ts` instead of Firebase.
2.  **Auth**: Authentication components have been removed/bypassed.
3.  **Export**: Now uses native file save dialogs instead of browser downloads.

To maintain a hybrid version, use the `isTauriApp()` check in `lib/tauri-api.ts` to switch between local and cloud storage logic.

---

## 5. Troubleshooting

*   **"Rust not found"**: Install Rust via `rustup`.
*   **"WebView2 not found" (Windows)**: Install WebView2 Runtime.
*   **Build Fails**: Try cleaning cache: `rm -rf node_modules src-tauri/target` and reinstalling.
*   **Port 3000 in use**: Change the port in `src-tauri/tauri.conf.json` and `package.json`.

---

## 6. Development Checklist

*   [ ] **Setup**: Rust & Node.js installed.
*   [ ] **Dev**: `npm run tauri:dev` runs without errors.
*   [ ] **Core**: Create, save, load, and delete projects works locally.
*   [ ] **Export**: HTML and React exports work with native dialogs.
*   [ ] **Build**: `npm run tauri:build` creates a working installer.
