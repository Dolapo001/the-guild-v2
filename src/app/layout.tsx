import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";

const inter = { variable: "" };
const plusJakarta = { variable: "" };

export const metadata: Metadata = {
  title: "The Guild | Verified Service Marketplace",
  description: "Connect with verified service providers in Nigeria.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
