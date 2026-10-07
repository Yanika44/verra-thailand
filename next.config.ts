import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Mock tracking data (TRACKING_MOCK=1) must ship with the API route on Vercel previews
  outputFileTracingIncludes: {
    "/api/tracking": ["./mock/**"],
  },
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
