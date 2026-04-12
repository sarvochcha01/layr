"use client";

import { Theme, themePresets } from "@/types/theme";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ThemePanelProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemePanel({ theme, onThemeChange }: ThemePanelProps) {
  const updateColor = (key: keyof Theme["colors"], value: string) => {
    onThemeChange({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    });
  };

  const applyPreset = (presetName: string) => {
    onThemeChange(themePresets[presetName]);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Global Theme</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Theme Presets */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-700 uppercase">
            Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(themePresets).map((presetName) => (
              <Button
                key={presetName}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(presetName)}
                className="capitalize"
              >
                {presetName}
              </Button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-700 uppercase">
            Colors
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="primary" className="mb-2 block text-xs">
                Primary
              </Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={theme.colors.primary}
                  onChange={(e) => updateColor("primary", e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.primary}
                  onChange={(e) => updateColor("primary", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary" className="mb-2 block text-xs">
                Secondary
              </Label>
              <div className="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  value={theme.colors.secondary}
                  onChange={(e) => updateColor("secondary", e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.secondary}
                  onChange={(e) => updateColor("secondary", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent" className="mb-2 block text-xs">
                Accent
              </Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={theme.colors.accent}
                  onChange={(e) => updateColor("accent", e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.accent}
                  onChange={(e) => updateColor("accent", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background" className="mb-2 block text-xs">
                Background
              </Label>
              <div className="flex gap-2">
                <Input
                  id="background"
                  type="color"
                  value={theme.colors.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="text" className="mb-2 block text-xs">
                Text
              </Label>
              <div className="flex gap-2">
                <Input
                  id="text"
                  type="color"
                  value={theme.colors.text}
                  onChange={(e) => updateColor("text", e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.text}
                  onChange={(e) => updateColor("text", e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fonts */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-700 uppercase">
            Typography
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="headingFont" className="mb-2 block text-xs">
                Heading Font
              </Label>
              <Input
                id="headingFont"
                type="text"
                value={theme.fonts.heading}
                onChange={(e) =>
                  onThemeChange({
                    ...theme,
                    fonts: { ...theme.fonts, heading: e.target.value },
                  })
                }
                className="text-xs"
                placeholder="Font family"
              />
            </div>

            <div>
              <Label htmlFor="bodyFont" className="mb-2 block text-xs">
                Body Font
              </Label>
              <Input
                id="bodyFont"
                type="text"
                value={theme.fonts.body}
                onChange={(e) =>
                  onThemeChange({
                    ...theme,
                    fonts: { ...theme.fonts, body: e.target.value },
                  })
                }
                className="text-xs"
                placeholder="Font family"
              />
            </div>
          </div>
        </div>

        {/* Spacing */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-700 uppercase">
            Spacing Scale
          </div>
          <div className="space-y-2">
            {(Object.keys(theme.spacing) as Array<keyof Theme["spacing"]>).map(
              (key) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="text-xs w-8 uppercase">{key}</Label>
                  <Input
                    type="text"
                    value={theme.spacing[key]}
                    onChange={(e) =>
                      onThemeChange({
                        ...theme,
                        spacing: { ...theme.spacing, [key]: e.target.value },
                      })
                    }
                    className="flex-1 text-xs"
                    placeholder="e.g., 1rem"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
