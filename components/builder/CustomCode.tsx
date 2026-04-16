import { buildComponentStyle } from "@/lib/buildStyle";
import { ThemeStyleVariant, getThemeCSSVars } from "@/lib/themeStyles";
import { useEffectiveThemeStyle } from "@/contexts/ThemeStyleContext";

interface CustomCodeProps {
  html?: string;
  css?: string;
  name?: string;
  themeStyle?: ThemeStyleVariant;
  [key: string]: any;
}

export function CustomCode({
  html = "<div>Custom Component</div>",
  css = "",
  name = "Custom",
  themeStyle,
  ...rest
}: CustomCodeProps) {
  const baseStyle = buildComponentStyle(rest);
  const effectiveTheme = useEffectiveThemeStyle(themeStyle, !!themeStyle);
  const cssVars = getThemeCSSVars(effectiveTheme);


  // Build a scoped style block
  const scopedCss = css
    ? `<style>${css}</style>`
    : "";

  return (
    <div
      className="custom-code-component w-full"
      style={{ ...baseStyle, ...cssVars }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: scopedCss + html,
        }}
      />
    </div>
  );
}
