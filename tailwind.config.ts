import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#f8f9fa",
                foreground: "#1f2937",
                primary: {
                    DEFAULT: "#1a237e", // Deep Royal Blue
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#ffb74d", // Soft Gold
                    foreground: "#1a237e",
                },
                accent: {
                    DEFAULT: "#00695c", // Professional Teal
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#f1f5f9",
                    foreground: "#64748b",
                },
                glass: {
                    border: "rgba(255, 255, 255, 0.3)",
                    surface: "rgba(255, 255, 255, 0.7)", // Frosted White
                    highlight: "rgba(255, 255, 255, 0.5)",
                },
            },
            fontFamily: {
                sans: ["var(--font-plus-jakarta)", "var(--font-inter)", "sans-serif"],
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(26, 35, 126, 0.05) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(255, 183, 77, 0.05) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 105, 92, 0.05) 0, transparent 50%)',
            }
        },
    },
    plugins: [],
} satisfies Config;
