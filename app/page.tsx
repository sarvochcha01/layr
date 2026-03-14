"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/loading";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/projects");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading />
    </div>
  );
}
