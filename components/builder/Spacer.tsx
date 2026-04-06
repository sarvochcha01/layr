import { buildComponentStyle } from "@/lib/buildStyle";

interface SpacerProps {
  height?: string;
  width?: string;
  [key: string]: any;
}

export function Spacer({ height = "2rem", width = "100%", ...rest }: SpacerProps) {
  const baseStyle = buildComponentStyle({ height, width, ...rest });
  return <div style={baseStyle} />;
}
