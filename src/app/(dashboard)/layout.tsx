"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { TopNav } from "@/components/shared/top-nav";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { MaestroChatWidget } from "@/components/ui/maestro-chat-widget";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-mesh-gradient flex flex-col lg:flex-row">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0 lg:pl-64">
                <TopNav />
                <main className="flex-1 p-4 md:p-10">
                    {children}
                </main>
            </div>
            <MobileBottomNav />
            <RoleSwitcher />
            <CartDrawer />
            {user?.role === "customer" && <MaestroChatWidget />}
        </div>
    );
}
