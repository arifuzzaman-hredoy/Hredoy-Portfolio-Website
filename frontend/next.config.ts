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

  // Cache policy for /assets/*. These URLs are not content-hashed, so a long
  // max-age keeps serving the previous design after a deploy until every browser
  // and every Cloudflare edge node expires its own copy.
  //
  //   css, js and the unversioned images/fonts -> revalidate every time
  //   versioned artwork (imgs/hero-tools/*-v<N>.svg) -> immutable
  //
  // Revalidation is cheap: the origin answers 304 when the file is unchanged, so
  // a repeat visit costs one conditional request instead of a full download.
  // Next.js applies these in order and the last match wins, so the catch-all
  // comes first and the two specific rules below it.
  async headers() {
    return [
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
        // Only add files here with that suffix, otherwise a content change would
        // be pinned for a year.
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