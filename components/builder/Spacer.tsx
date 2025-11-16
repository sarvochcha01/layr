interface SpacerProps {
  height?: string;
  width?: string;
}

export function Spacer({ height = "2rem", width = "100%" }: SpacerProps) {
  return <div style={{ height, width }} />;
}
