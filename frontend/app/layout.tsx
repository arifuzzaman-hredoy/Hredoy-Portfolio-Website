import type { Metadata, Viewport } from "next";
import { getContent, getSiteImages, getSiteSettings } from "@/lib/cms";
import "./globals.css";
import "./certificates.css";

const SITE_URL = "https://oxytumzone.com";
const SITE_NAME = "Hredoy's Portfolio";
const SITE_TITLE = "Hredoy's Portfolio — Junior DevOps Engineer";
const SITE_DESCRIPTION =
  "Arifuzzaman Hredoy — Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code.";
const SITE_KEYWORDS = ["DevOps", "Linux", "Cloud", "CI/CD", "Docker", "Kubernetes", "AWS", "Terraform", "Portfolio"];

// The person behind the site comes from site_settings, so the owner edits it in
// one place. name, jobTitle, email and sameAs are the only fields the JSON-LD
// block needs; the description stays on the SEO content block.
function buildStructuredData(identity: Record<string, string>) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: identity.owner_name,
        url: SITE_URL,
        jobTitle: identity.role,
        description: SITE_DESCRIPTION,
        email: `mailto:${identity.email}`,
        sameAs: [identity.github, identity.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };
}

const DEFAULT_OG_IMAGE = "https://res.cloudinary.com/dvatduo79/image/upload/og/og-home.png";
const DEFAULT_FAVICON = "https://res.cloudinary.com/dvatduo79/image/upload/favicon.png";
const DEFAULT_APPLE_ICON = "https://res.cloudinary.com/dvatduo79/image/upload/apple-touch-icon.png";

// Runs before first paint: flags that JS is available (so the navbar can start
// hidden) and reveals the navbar once the page has finished loading.
const NAVBAR_REVEAL_BOOT = `(function () {
  var d = document;
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
  if (d.readyState === "complete") {
    reveal();
  } else {
    window.addEventListener("load", reveal, { once: true });
  }
  window.setTimeout(reveal, 3500);
})();`;

export async function generateMetadata(): Promise<Metadata> {
  const [images, content, identity] = await Promise.all([
    getSiteImages(),
    getContent(),
    getSiteSettings(),
  ]);
  const ogImage = images["og-image"] || DEFAULT_OG_IMAGE;
  const favicon = images["favicon"] || DEFAULT_FAVICON;
  const appleIcon = images["apple-touch-icon"] || DEFAULT_APPLE_ICON;

  const title = content.values["seo.title"]?.trim() || SITE_TITLE;
  const description = content.values["seo.description"]?.trim() || SITE_DESCRIPTION;
  const keywords = (content.values["seo.keywords"] ?? SITE_KEYWORDS.join(", "))
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    authors: [{ name: identity.owner_name, url: SITE_URL }],
    creator: identity.owner_name,
    alternates: { canonical: "/" },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: "/",
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_TITLE }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: favicon, type: "image/png", sizes: "64x64" }],
      apple: [{ url: appleIcon, sizes: "180x180", type: "image/png" }],
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
  const identity = await getSiteSettings();

  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NAVBAR_REVEAL_BOOT }} />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
            __html: JSON.stringify(buildStructuredData(identity)).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="at-magic-cursor">{children}</body>
    </html>
  );
}