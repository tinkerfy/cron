import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,

  // Optimize images (if any are added later)
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/api/filters/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=60" },
        ],
      },
      {
        source: "/api/cron-jobs/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=10" },
        ],
      },
    ];
  },

  // Experimental: optimize server-side package imports
  experimental: {
    optimizePackageImports: ["mysql2"],
  },
};

export default nextConfig;
