"use client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SideNav } from "@/components/navigation/SideNav";
import { Loading } from "@/components/ui/loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
