#!/bin/bash

# Tauri Setup Script
# This script helps set up the Tauri development environment

echo "🚀 Website Builder - Tauri Setup"
echo "================================"
echo ""

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed"
    echo "📥 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    echo "✅ Rust installed successfully"
else
    echo "✅ Rust is already installed ($(rustc --version))"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js is installed ($(node --version))"
fi

# Install system dependencies based on OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)
        echo "🐧 Detected Linux"
        if command -v apt-get &> /dev/null; then
            echo "📥 Installing dependencies (Debian/Ubuntu)..."
            sudo apt-get update
            sudo apt-get install -y \
                libwebkit2gtk-4.0-dev \
                build-essential \
                curl \
                wget \
                file \
                libssl-dev \
                libgtk-3-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev
        elif command -v dnf &> /dev/null; then
            echo "📥 Installing dependencies (Fedora)..."
            sudo dnf install -y \
                webkit2gtk4.0-devel \
                openssl-devel \
                curl \
                wget \
                file \
                libappindicator-gtk3-devel \
                librsvg2-devel
        fi
        ;;
    Darwin*)
        echo "🍎 Detected macOS"
        if ! command -v xcode-select &> /dev/null; then
            echo "📥 Installing Xcode Command Line Tools..."
            xcode-select --install
        else
            echo "✅ Xcode Command Line Tools already installed"
        fi
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "🪟 Detected Windows"
        echo "Please ensure you have:"
        echo "  - Microsoft C++ Build Tools"
        echo "  - WebView2 Runtime"
        echo "Visit: https://tauri.app/v1/guides/getting-started/prerequisites#windows"
        ;;
    *)
        echo "❓ Unknown OS: ${OS}"
        ;;
esac

# Install Node dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

# Install Tauri CLI
echo ""
echo "📦 Installing Tauri CLI..."
npm install --save-dev @tauri-apps/cli

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run tauri:dev' to start development"
echo "  2. Run 'npm run tauri:build' to build for production"
echo ""
echo "📚 Read TAURI-SETUP.md for more information"
