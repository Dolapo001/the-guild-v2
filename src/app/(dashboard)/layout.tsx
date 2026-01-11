"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { TopNav } from "@/components/shared/top-nav";
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
        <div className="min-h-screen bg-mesh-gradient">
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <TopNav />
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </div>
            <RoleSwitcher />
            <CartDrawer />
            {user?.role === "customer" && <MaestroChatWidget />}
        </div>
    );
}
