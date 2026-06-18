"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { TopNav } from "@/components/shared/top-nav";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { MaestroChatWidget } from "@/components/ui/maestro-chat-widget";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { CommandPalette } from "@/components/shared/command-palette";
import { AppModeGuard } from "@/components/pwa/app-mode-guard";
import { useAuth } from "@/contexts/AuthContext";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex flex-col lg:flex-row">
        {/* sidebar skeleton */}
        <div className="hidden lg:block w-64 border-r border-glass-border bg-glass-surface p-4 space-y-3">
          <div className="h-10 w-32 rounded-xl bg-muted animate-pulse" />
          <div className="pt-6 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-muted/70 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-glass-border bg-glass-surface px-6 flex items-center justify-between">
            <div className="h-5 w-40 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          </div>
          <main className="flex-1 p-4 md:p-10 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-card bg-muted/70 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
            <div className="h-72 rounded-panel bg-muted/60 animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
 <AppModeGuard>
 <div className="min-h-screen bg-mesh-gradient flex flex-col lg:flex-row">
 <Sidebar />
 <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:pl-64">
 <TopNav />
 <main className="flex-1 p-4 md:p-10">
 {children}
 </main>
 </div>
 <MobileBottomNav />
 <CartDrawer />
 <CommandPalette />
 {user?.role === "customer" && <MaestroChatWidget />}
 </div>
 </AppModeGuard>
 );
}
