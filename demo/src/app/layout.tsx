import type { Metadata } from "next";
import "../../../tokens.css";
import "./globals.css";
import { DevTourBuilder } from "../components/DevTourBuilder";

export const metadata: Metadata = {
  metadataBase: new URL("https://oznksc.github.io/guideloop/"),
  title: "GuideLoop — product tours for React, Vue, Svelte, Angular & Vanilla JS",
  description:
    "Contextual product tours and onboarding for React, Vue, Svelte, Angular, Vanilla JS, and Web Components.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en" data-theme="slate" suppressHydrationWarning>
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
