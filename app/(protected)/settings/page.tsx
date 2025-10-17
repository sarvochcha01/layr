"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("My Awesome Website");
  const [defaultTemplate, setDefaultTemplate] = useState("Modern Business");
  const [gridSize, setGridSize] = useState(20);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  const [minifyCode, setMinifyCode] = useState(true);
  const [includeComments, setIncludeComments] = useState(false);
  const [theme, setTheme] = useState("Light");
  const [exportFormat, setExportFormat] = useState("HTML/CSS");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Here you would save settings to your backend/storage
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefaults = () => {
    setSiteName("My Awesome Website");
    setDefaultTemplate("Modern Business");
    setGridSize(20);
    setAutoSave(true);
    setNotifications(false);
    setSnapToGrid(true);
    setShowRulers(false);
    setMinifyCode(true);
    setIncludeComments(false);
    setTheme("Light");
    setExportFormat("HTML/CSS");
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences and settings
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Default Site Name</Label>
              <Input
                id="siteName"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="My Awesome Website"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Template</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {defaultTemplate}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem
                    onClick={() => setDefaultTemplate("Modern Business")}
                  >
                    Modern Business
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDefaultTemplate("Creative Portfolio")}
                  >
                    Creative Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDefaultTemplate("Landing Page")}
                  >
                    Landing Page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDefaultTemplate("Minimal Blog")}
                  >
                    Minimal Blog
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                className="rounded"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              <Label htmlFor="autoSave">Enable auto-save</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications"
                className="rounded"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <Label htmlFor="notifications">Email notifications</Label>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Editor Preferences</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {theme}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setTheme("Light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("Dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("System")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gridSize">Grid Size</Label>
              <Input
                id="gridSize"
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(Number(e.target.value))}
                min="10"
                max="50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="snapToGrid"
                className="rounded"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
              />
              <Label htmlFor="snapToGrid">Snap to grid</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showRulers"
                className="rounded"
                checked={showRulers}
                onChange={(e) => setShowRulers(e.target.checked)}
              />
              <Label htmlFor="showRulers">Show rulers</Label>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Export Settings</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Export Format</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {exportFormat}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setExportFormat("HTML/CSS")}>
                    HTML/CSS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setExportFormat("React")}>
                    React
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setExportFormat("Vue")}>
                    Vue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="minifyCode"
                className="rounded"
                checked={minifyCode}
                onChange={(e) => setMinifyCode(e.target.checked)}
              />
              <Label htmlFor="minifyCode">Minify exported code</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeComments"
                className="rounded"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
              />
              <Label htmlFor="includeComments">Include comments in code</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={handleResetDefaults}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
