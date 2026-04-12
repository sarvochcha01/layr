import { buildComponentStyle } from "@/lib/buildStyle";

interface CustomCodeProps {
  html?: string;
  css?: string;
  name?: string;
  [key: string]: any;
}

export function CustomCode({
  html = "<div>Custom Component</div>",
  css = "",
  name = "Custom",
  ...rest
}: CustomCodeProps) {
  const baseStyle = buildComponentStyle(rest);

  // Build a scoped style block
  const scopedCss = css
    ? `<style>${css}</style>`
    : "";

  return (
    <div
      className="custom-code-component w-full"
      style={baseStyle}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: scopedCss + html,
        }}
      />
    </div>
  );
}
