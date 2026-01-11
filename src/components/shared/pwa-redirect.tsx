"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PWARedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check if the app is running in "standalone" mode (installed PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        if (isStandalone) {
            // Redirect immediately to login or dashboard
            // We'll use /login as the entry point for installed users
            router.replace('/login');
        }
    }, [router]);

    return null; // This component doesn't render anything
}
