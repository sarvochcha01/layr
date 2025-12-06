export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { SideNav } from "@/components/navigation/SideNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
