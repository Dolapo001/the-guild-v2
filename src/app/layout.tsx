import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "sonner";

const inter = { variable: "" };
const plusJakarta = { variable: "" };

export const metadata: Metadata = {
  title: "The Guild — Install the Verified Marketplace App",
  description:
    "An install-first app for Nigeria's verified service & product marketplace. Works offline, lightning fast, secure by design. Install to continue.",
  applicationName: "The Guild",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Guild",
  },
  icons: {
    icon: "/logo.png",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "The Guild — Install the Verified Marketplace App",
    description: "An install-first app. Works offline, lightning fast, secure by design.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A237E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} antialiased bg-background text-foreground min-h-screen bg-mesh-gradient`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <WalletProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <NotificationProvider>{children}</NotificationProvider>
                    <PWARegister />
                    <Toaster
                      position="top-right"
                      richColors
                      expand={true}
                      toastOptions={{
                        style: {
                          background: "rgba(255, 255, 255, 0.98)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(26, 35, 126, 0.1)",
                          borderRadius: "16px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          color: "#1A237E",
                        },
                      }}
                    />
                  </FavoritesProvider>
                </CartProvider>
              </WalletProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
