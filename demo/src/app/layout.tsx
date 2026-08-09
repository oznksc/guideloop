import type { Metadata } from "next";
import "../../../tokens.css";
import "./globals.css";
import { DevTourBuilder } from "../components/DevTourBuilder";

export const metadata: Metadata = {
  metadataBase: new URL("https://oznksc.github.io/guideloop/"),
  title: {
    default: "GuideLoop — product tours for React, Vue, Svelte, Angular & Vanilla JS",
    template: "%s | GuideLoop",
  },
  description:
    "Contextual product tours and onboarding for React, Vue, Svelte, Angular, Vanilla JS, and Web Components.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "favicon.ico" },
      { url: "icon.svg", type: "image/svg+xml" },
    ],
    apple: "apple-touch-icon.png",
  },
  openGraph: {
    title: "GuideLoop — product tours for React, Vue, Svelte, Angular & Vanilla JS",
    description:
      "Spotlight tours and checklists — React, Vue, Svelte, Angular, imperative API, or <guide-loop>.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "GuideLoop — product tours and onboarding for any stack",
      },
    ],
    siteName: "GuideLoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "GuideLoop — product tours for React, Vue, Svelte, Angular & Vanilla JS",
    description:
      "Spotlight tours and checklists — React, Vue, Svelte, Angular, imperative API, or <guide-loop>.",
    images: ["/og.png"],
  },
  verification: {
    google: "8jHOUD8pYi7C18EbaUEP-5Gjv8mU2mH9if36mBpcpVw",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GuideLoop",
  url: "https://oznksc.github.io/guideloop/",
  description:
    "Contextual product tours and onboarding checklists for React, Vue, Svelte, Angular, and Vanilla JS.",
  inLanguage: "en",
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GuideLoop",
  url: "https://oznksc.github.io/guideloop/",
  description:
    "Zero-config guided tour and onboarding library with spotlight tours and checklists for React, Vue, Svelte, Angular, Vanilla JS, and Web Components.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  license: "https://opensource.org/licenses/MIT",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  softwareVersion: "2.0",
  keywords:
    "product tours, onboarding, guided tour, spotlight, React, Vue, Svelte, Angular, web component, onboarding checklist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en" data-theme="slate" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="8jHOUD8pYi7C18EbaUEP-5Gjv8mU2mH9if36mBpcpVw" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
        {/*
          Dev-only visual editor. Production builds:
          1) skip rendering here (NODE_ENV gate)
          2) resolve @guideloop/react/builder → empty shim via next.config webpack alias
        */}
        {isDev ? <DevTourBuilder /> : null}
      </body>
    </html>
  );
}
