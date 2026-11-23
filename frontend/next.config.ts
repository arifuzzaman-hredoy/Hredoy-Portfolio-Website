import type { NextConfig } from "next";

const BACKEND_URL = (
  process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },

  // Proxy CMS API and uploaded media to the Go backend so the browser talks to
  // a single origin. The backend URL is configurable per environment.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },

  // Cache policy:
  // 1. Pages/HTML: strict no-cache so browsers always fetch the latest content.
  // 2. /assets/*: revalidate with origin, busted by ?v= query string on deploy.
  // 3. /assets/imgs/hero-tools/*-v<N>.svg: immutable versioned artwork.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // imgs/hero-tools holds the five tech marks, each published with a -v<N>
        // suffix (docker-v3.svg), so the URL changes whenever the artwork does.
        source: "/assets/imgs/hero-tools/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/css/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/assets/js/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;