# Global Theme Styles System

## Overview

The theme styles system allows you to apply consistent visual styles across all components in your project. It's inspired by the 10 beautiful footer variants and extends that concept to the entire component library.

## Features

### 10 Theme Styles

1. **Standard** - Classic, professional design with balanced spacing
2. **Centered** - Symmetric, balanced layout with centered alignment
3. **Minimal** - Clean, ultra-minimal design with maximum whitespace
4. **Brand Focus** - Large, prominent branding with bold typography
5. **Magazine** - Editorial style with ruled lines and structured layout
6. **Brutalist** - Raw, high-contrast design with thick borders
7. **Glassmorphic** - Frosted glass panels with blurred backdrop
8. **Split Dark** - Two-tone split design with contrasting panels
9. **Startup** - Modern, vibrant with accent colors and clean grid
10. **Newsletter** - Prominent call-to-action with email capture focus

### Global Theme Control

- **Global Theme Toggle**: Enable/disable global theme application
- **One-Click Styling**: Apply a theme to all components at once
- **Component Override**: Individual components can still use their own theme style

## How to Use

### Setting a Global Theme

1. Click the **Palette icon** (🎨) in the editor toolbar
2. Toggle "Enable Global Theme" to ON
3. Select one of the 10 theme styles
4. All components will instantly adopt that style

### Per-Component Themes

1. Select any component
2. In the Properties Panel, find the "Theme Style" section
3. Choose a theme style for just that component
4. This overrides the global theme for that component only

### Disabling Global Theme

1. Click the Palette icon
2. Toggle "Enable Global Theme" to OFF
3. Components will use their individual theme settings

## Theme Characteristics

Each theme defines:

- **Border Style**: subtle, bold, none, or glass
- **Spacing**: compact, normal, or spacious
- **Corners**: sharp, rounded, or pill
- **Shadows**: none, subtle, elevated, or dramatic
- **Font Weight**: light, normal, medium, bold, or black
- **Text Transform**: none, uppercase, or lowercase
- **Letter Spacing**: tight, normal, wide, or wider
- **Alignment**: left, center, or right
- **Hover Effects**: subtle, lift, scale, glow, or none
- **Transitions**: fast, normal, slow, or bouncy

## Implementation Details

### Files Added

- `lib/themeStyles.ts` - Theme definitions and utility functions
- `contexts/ThemeStyleContext.tsx` - React context for global theme state
- `components/editor/ThemeStylePanel.tsx` - UI for theme selection

### Files Modified

- `components/builder/Button.tsx` - Added theme support
- `components/builder/Card.tsx` - Added theme support
- `components/builder/Navbar.tsx` - Added theme support
- `components/builder/Footer.tsx` - Already had 10 variants (inspiration!)
- `components/editor/EditorLayout.tsx` - Added theme panel button
- `components/editor/properties/registry.ts` - Added theme field to Button
- `app/editor/layout.tsx` - Wrapped with ThemeStyleProvider

### Adding Theme Support to More Components

To add theme support to any component:

1. Import the theme utilities:

```typescript
import {
  ThemeStyleVariant,
  getThemeClasses,
  getThemeStyles,
} from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";
```

2. Add `themeStyle` to the component props:

```typescript
interface MyComponentProps {
  // ... other props
  themeStyle?: ThemeStyleVariant;
}
```

3. Use the theme in the component:

```typescript
export function MyComponent({ themeStyle, ...props }: MyComponentProps) {
  const effectiveTheme = useEffectiveThemeStyle(themeStyle);
  const themeClasses = getThemeClasses(effectiveTheme);
  const themeInlineStyles = getThemeStyles(effectiveTheme);

  return (
    <div
      className={cn(
        themeClasses.border,
        themeClasses.spacing,
        themeClasses.corners,
        themeClasses.shadow,
        themeClasses.font,
        themeClasses.transition,
        themeClasses.hover
      )}
      style={themeInlineStyles}
    >
      {/* component content */}
    </div>
  );
}
```

4. Add the theme field to the registry in `components/editor/properties/registry.ts`:

```typescript
{
  id: "theme",
  title: "Theme Style",
  icon: "paintbrush",
  fields: [
    {
      key: "themeStyle",
      label: "Theme Style",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Centered", value: "centered" },
        // ... all 10 options
      ],
    },
  ],
}
```

## Tips

- Start with a global theme to establish consistency
- Override specific components for emphasis or variation
- The Footer component already has these 10 styles built-in as variants
- Glassmorphic works best with darker backgrounds
- Brutalist is perfect for bold, statement designs
- Magazine style is great for content-heavy sites

## Future Enhancements

- Save custom theme presets
- Import/export theme configurations
- Theme preview before applying
- Animated theme transitions
- Component-specific theme customization
