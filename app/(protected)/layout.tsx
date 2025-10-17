import { AuthGuard } from "@/components/auth/AuthGuard";
import { SideNav } from "@/components/navigation/SideNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <SideNav />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
