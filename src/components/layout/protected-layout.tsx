"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { DashboardLayoutShell } from "@/components/layout/dashboard-shell";
import { DashboardSkeleton } from "@/components/shared/page-skeleton";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!user) return null;

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
