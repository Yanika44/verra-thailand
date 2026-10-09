import type { NextConfig } from "next";
import { TRACKING_ONLY } from "./src/lib/nav";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Mock tracking data (TRACKING_MOCK=1) must ship with the API route on Vercel previews
  outputFileTracingIncludes: {
    "/api/tracking": ["./mock/**"],
  },
  partialPrefetching: true,
  // Tracking-only mode: every page except /tracking goes there (temporary 307, so turning
  // TRACKING_ONLY off brings the pages back without browsers remembering the redirect)
  async redirects() {
    if (!TRACKING_ONLY) return [];
    return [{ source: "/:path((?!tracking$|api/|_next/|sitemap\\.xml$|robots\\.txt$|icon\\.png$)[^.]*)?", destination: "/tracking", permanent: false }];
  },
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
