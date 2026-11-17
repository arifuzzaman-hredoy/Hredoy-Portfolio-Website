import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://oxytumzone.com";
const SITE_NAME = "Hredoy's Portfolio";
const SITE_TITLE = "Hredoy's Portfolio — Junior DevOps Engineer";
const SITE_DESCRIPTION =
  "Arifuzzaman Hredoy — Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code.";
const SITE_IMAGE = "https://res.cloudinary.com/dvatduo79/image/upload/og/og-home.png";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Arifuzzaman Hredoy",
      url: SITE_URL,
      jobTitle: "Junior DevOps Engineer",
      description: SITE_DESCRIPTION,
      email: "mailto:arifuzzamanhredoy@gmail.com",
      sameAs: [
        "https://github.com/arifuzzaman-hredoy",
        "https://www.linkedin.com/in/arifuzzaman-hredoy/",
      ],
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ["DevOps", "Linux", "Cloud", "CI/CD", "Docker", "Kubernetes", "AWS", "Terraform", "Portfolio"],
  authors: [{ name: "Arifuzzaman Hredoy", url: SITE_URL }],
  creator: "Arifuzzaman Hredoy",
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [{ url: SITE_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
  },
  icons: {
    icon: [{ url: "https://res.cloudinary.com/dvatduo79/image/upload/favicon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "https://res.cloudinary.com/dvatduo79/image/upload/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-bs-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/css/vendors/bootstrap.min.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/carouselTicker.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/swiper-bundle.min.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/nice-select.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/font-awesome-pro.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/magnific-popup.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/odometer.css" as="style" />
        <link rel="preload" href="/assets/css/vendors/spacing.css" as="style" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="at-magic-cursor">{children}</body>
    </html>
  );
}