import type { NextConfig } from "next";

const BACKEND_URL = (
  process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",

  // Proxy CMS API and uploaded media to the Go backend so the browser talks to
  // a single origin. The backend URL is configurable per environment.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },

  // Cache static assets aggressively to speed up repeat visits. Assets use
  // fixed URLs (no content hashing), so max-age is capped at 1 day with
  // stale-while-revalidate to pick up updates in the background.
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;