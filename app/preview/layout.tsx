import { ThemeStyleProvider } from "@/contexts/ThemeStyleContext";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeStyleProvider>{children}</ThemeStyleProvider>;
}
