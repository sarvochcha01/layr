# Tauri Setup Script for Windows (PowerShell)
# Run as Administrator for best results

Write-Host "🚀 Website Builder - Tauri Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some installations may require admin rights" -ForegroundColor Gray
    Write-Host ""
}

# Function to download and install
function Install-FromUrl {
    param($url, $output, $name)
    Write-Host "📥 Downloading $name..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host "✅ Downloaded $name" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to download $name" -ForegroundColor Red
        return $false
    }
}

# Check and install Rust
$rustInstalled = Get-Command rustc -ErrorAction SilentlyContinue
if (-not $rustInstalled) {
    Write-Host "❌ Rust is not installed" -ForegroundColor Red
    Write-Host "📥 Installing Rust..." -ForegroundColor Cyan
    
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $rustupPath = "$env:TEMP\rustup-init.exe"
    
    if (Install-FromUrl $rustupUrl $rustupPath "Rust installer") {
        Write-Host "🔧 Running Rust installer..." -ForegroundColor Cyan
        Start-Process -FilePath $rustupPath -ArgumentList "-y" -Wait -NoNewWindow
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Add cargo to current session
        $env:Path += ";$env:USERPROFILE\.cargo\bin"
        
        Write-Host "✅ Rust installed successfully" -ForegroundColor Green
        Remove-Item $rustupPath -ErrorAction SilentlyContinue
    } else {
        Write-Host "❌ Failed to install Rust" -ForegroundColor Red
        Write-Host "   Please install manually from: https://rustup.rs/" -ForegroundColor Yellow
        exit 1
    }
} else {
    $rustVersion = rustc --version
    Write-Host "✅ Rust is already installed ($rustVersion)" -ForegroundColor Green
}

# Check Node.js
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "📥 Installing Node.js..." -ForegroundColor Cyan
    
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodePath = "$env:TEMP\node-installer.msi"
    
    if (Install-FromUrl $nodeUrl $nodePath "Node.js installer") {
        Write-Host "🔧 Running Node.js installer..." -ForegroundColor Cyan
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodePath`" /quiet /norestart" -Wait -NoNewWindow
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Host "✅ Node.js installed successfully" -ForegroundColor Green
        Remove-Item $nodePath -ErrorAction SilentlyContinue
    } else {
        Write-Host "❌ Failed to install Node.js" -ForegroundColor Red
        Write-Host "   Please install manually from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed ($nodeVersion)" -ForegroundColor Green
}

# Check and install WebView2
Write-Host ""
Write-Host "🌐 Checking for WebView2 Runtime..." -ForegroundColor Yellow
$webview2Path = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
if (-not (Test-Path $webview2Path)) {
    Write-Host "📥 Installing WebView2 Runtime..." -ForegroundColor Cyan
    
    $webview2Url = "https://go.microsoft.com/fwlink/p/?LinkId=2124703"
    $webview2Path = "$env:TEMP\webview2-installer.exe"
    
    if (Install-FromUrl $webview2Url $webview2Path "WebView2 Runtime") {
        Write-Host "🔧 Running WebView2 installer..." -ForegroundColor Cyan
        Start-Process -FilePath $webview2Path -ArgumentList "/silent /install" -Wait -NoNewWindow
        Write-Host "✅ WebView2 Runtime installed" -ForegroundColor Green
        Remove-Item $webview2Path -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️  Failed to install WebView2 automatically" -ForegroundColor Yellow
        Write-Host "   Download from: https://go.microsoft.com/fwlink/p/?LinkId=2124703" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ WebView2 Runtime is installed" -ForegroundColor Green
}

# Check for Visual Studio Build Tools
Write-Host ""
Write-Host "🔧 Checking for Microsoft C++ Build Tools..." -ForegroundColor Yellow

$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$buildToolsInstalled = $false

if (Test-Path $vsWhere) {
    $vsInstances = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsInstances) {
        Write-Host "✅ Visual Studio Build Tools found" -ForegroundColor Green
        $buildToolsInstalled = $true
    }
}

if (-not $buildToolsInstalled) {
    Write-Host "⚠️  Visual Studio Build Tools not found" -ForegroundColor Yellow
    Write-Host "📥 Installing Visual Studio Build Tools..." -ForegroundColor Cyan
    Write-Host "   This may take 10-15 minutes..." -ForegroundColor Gray
    
    $buildToolsUrl = "https://aka.ms/vs/17/release/vs_BuildTools.exe"
    $buildToolsPath = "$env:TEMP\vs_buildtools.exe"
    
    if (Install-FromUrl $buildToolsUrl $buildToolsPath "VS Build Tools installer") {
        Write-Host "🔧 Running VS Build Tools installer..." -ForegroundColor Cyan
        Write-Host "   Installing C++ build tools (this takes a while)..." -ForegroundColor Gray
        
        $args = "--quiet --wait --norestart --nocache " +
                "--add Microsoft.VisualStudio.Workload.VCTools " +
                "--add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 " +
                "--add Microsoft.VisualStudio.Component.Windows10SDK.19041"
        
        Start-Process -FilePath $buildToolsPath -ArgumentList $args -Wait -NoNewWindow
        Write-Host "✅ Visual Studio Build Tools installed" -ForegroundColor Green
        Remove-Item $buildToolsPath -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚠️  Failed to install Build Tools automatically" -ForegroundColor Yellow
        Write-Host "   Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Gray
        Write-Host "   Select 'Desktop development with C++' during installation" -ForegroundColor Gray
    }
}

# Install Node dependencies
Write-Host ""
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to run!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Close and reopen your terminal (to refresh environment)" -ForegroundColor White
Write-Host "  2. Run: npm run tauri:dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 First run will take 5-10 minutes (compiling Rust)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
