import type { Metadata, Viewport } from "next";
import { getContent, getSiteImages, getSiteSettings } from "@/lib/cms";
import "./globals.css";
import "./certificates.css";
import "./resume.css";

const SITE_URL =
  process.env.SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://oxytumzone.com" : "http://localhost:3001");

// The person behind the site comes from site_settings and content_blocks in PostgreSQL.
function buildStructuredData(identity: Record<string, string>, contentValues: Record<string, string>) {
  const title = contentValues["seo.title"]?.trim() ?? "";
  const description = contentValues["seo.description"]?.trim() ?? identity.bio ?? "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: identity.owner_name ?? "",
        url: SITE_URL,
        jobTitle: identity.role ?? "",
        description,
        email: identity.email ? `mailto:${identity.email}` : undefined,
        sameAs: [identity.github, identity.linkedin].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: title,
        description,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };
}

// Runs before first paint: applies saved theme (dark/light), flags JS availability,
// and reveals the navbar as soon as the DOM is ready.
const NAVBAR_REVEAL_BOOT = `(function () {
  var d = document;
  try {
    var savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      d.documentElement.setAttribute("data-bs-theme", savedTheme);
    }
  } catch (e) {}
  d.documentElement.classList.add("has-js");
  var started = false;
  var reveal = function () {
    if (started) return;
    var header = d.querySelector(".header-7");
    if (!header) return;
    started = true;
    header.classList.add("nav-ready");
    window.setTimeout(function () {
      header.classList.add("nav-settled");
    }, 1300);
  };
  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", reveal, { once: true });
  } else {
    requestAnimationFrame(reveal);
  }
  window.setTimeout(reveal, 1500);
})();`;

export async function generateMetadata(): Promise<Metadata> {
  const [images, content, identity] = await Promise.all([
    getSiteImages(),
    getContent(),
    getSiteSettings(),
  ]);
  const ogImage = images["og-image"]?.trim();
  const favicon = images["favicon"]?.trim();
  const appleIcon = images["apple-touch-icon"]?.trim();

  const title = content.values["seo.title"]?.trim() ?? "";
  const description = content.values["seo.description"]?.trim() ?? "";
  const keywords = (content.values["seo.keywords"] ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    authors: identity.owner_name ? [{ name: identity.owner_name, url: SITE_URL }] : undefined,
    creator: identity.owner_name || undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: title,
      locale: "en_US",
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon: favicon ? [{ url: favicon, type: "image/png", sizes: "64x64" }] : undefined,
      apple: appleIcon ? [{ url: appleIcon, sizes: "180x180", type: "image/png" }] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [identity, content] = await Promise.all([getSiteSettings(), getContent()]);

  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NAVBAR_REVEAL_BOOT }} />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Flex:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/vendors/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/vendors/carouselTicker.css" />
        <link rel="stylesheet" href="/assets/css/vendors/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/vendors/nice-select.css" />
        <link rel="stylesheet" href="/assets/css/vendors/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/vendors/odometer.css" />
        <link rel="stylesheet" href="/assets/css/vendors/spacing.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStructuredData(identity, content.values)).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="at-magic-cursor">{children}</body>
    </html>
  );
}