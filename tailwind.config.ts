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
                background: "#08090e",
                foreground: "#f1f5f9",
                primary: {
                    DEFAULT: "#6366f1",
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#f59e0b",
                    foreground: "#08090e",
                },
                accent: {
                    DEFAULT: "#10b981",
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#161922",
                    foreground: "#64748b",
                },
                card: {
                    DEFAULT: "#0f1117",
                    foreground: "#f1f5f9",
                },
                border: "rgba(255,255,255,0.07)",
                input: "#161922",
                ring: "#6366f1",
                glass: {
                    border: "rgba(255,255,255,0.07)",
                    surface: "#0f1117",
                    highlight: "rgba(255,255,255,0.04)",
                },
            },
            fontFamily: {
                sans: ["var(--font-plus-jakarta)", "var(--font-inter)", "sans-serif"],
            },
            backdropBlur: {
                xs: "2px",
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0,0,0,0.4)',
                'glass-sm': '0 4px 16px 0 rgba(0,0,0,0.3)',
                'glow': '0 0 20px rgba(99,102,241,0.3)',
                'glow-sm': '0 0 10px rgba(99,102,241,0.2)',
            },
            backgroundImage: {
                'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(99,102,241,0.06) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(245,158,11,0.04) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(16,185,129,0.04) 0, transparent 50%)',
            }
        },
    },
    plugins: [],
} satisfies Config;