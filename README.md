# Layr Website Builder

A professional visual website builder powered by Next.js, React, and Tauri. Build production-ready multi-page websites through an intuitive drag-and-drop interface.

## 🚀 Overview

Layr enables developers and designers to create sophisticated multi-page websites without writing code. It runs as a high-performance native desktop application with offline support, local storage, and native dialogs.

### Key Features

*   **Visual Editor**: Real-time drag-and-drop interface with live preview.
*   **Desktop Native**: Runs as a native app with offline support, local storage, and native dialogs.
*   **Component Library**: Over 50 production-ready components (Layout, Content, Interactive, Marketing).
*   **Export System**: Generate production-ready HTML/CSS or full Next.js/React projects.
*   **Productivity Tools**: Undo/Redo, Copy/Paste, Keyboard Shortcuts, Favorites.
*   **Theme System**: Global control over colors, fonts, and spacing.

## 🛠️ Getting Started

### Prerequisites

*   **Rust**: Required for Tauri backend. [Install Rust](https://rustup.rs/)
*   **Node.js**: Version 18 or higher. [Install Node.js](https://nodejs.org/)
*   **System Dependencies**:
    *   **Windows**: Microsoft C++ Build Tools and WebView2.
    *   **macOS**: Xcode Command Line Tools (`xcode-select --install`).
    *   **Linux**: `build-essential`, `libwebkit2gtk-4.0-dev`, and other GTK dependencies.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/layr.git
    cd layr
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the setup script** (optional but recommended):
    *   **Windows (PowerShell as Admin)**: `.\scripts\setup-tauri.ps1`
    *   **Linux/macOS**: `chmod +x scripts/setup-tauri.sh && ./scripts/setup-tauri.sh`

### Running the App

*   **Development Mode**:
    ```bash
    npm run tauri:dev
    ```
    This starts the Next.js dev server and the Tauri desktop window with hot-reload.

*   **Production Build**:
    ```bash
    npm run tauri:build
    ```
    Creates installers in `src-tauri/target/release/bundle/`.

## 📚 Documentation

For detailed technical documentation, API references, architecture, and troubleshooting, please refer to [DOCUMENTATION.md](./DOCUMENTATION.md).

---
Built with [Next.js](https://nextjs.org/), [Tauri](https://tauri.app/), and [React](https://react.dev/).
