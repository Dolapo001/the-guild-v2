import type { NextConfig } from "next";

// Backend origin the proxy forwards to. The browser only ever talks to the
// Next.js origin, so httpOnly auth cookies stay first-party (SameSite=Lax)
// and there are no cross-site/CORS cookie pitfalls.
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${BACKEND_ORIGIN}/api/v1/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
