import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lora, JetBrains_Mono } from "next/font/google";
import "../../../tokens.css";
import "./globals.css";
import { DevTourBuilder } from "../components/DevTourBuilder";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oznksc.github.io/guideloop/"),
  title: "GuideLoop — product tours for React, Svelte, Angular & Vanilla JS",
  description:
    "Contextual product tours and onboarding for React, Svelte, Angular, Vanilla JS, and Web Components.",
  openGraph: {
    title: "GuideLoop — product tours for React, Svelte, Angular & Vanilla JS",
    description:
      "Spotlight tours and checklists — React, Svelte, Angular, imperative API, or <guide-loop>.",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${jetbrainsMono.variable} antialiased`}
      >
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
