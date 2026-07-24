import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../../tokens.css";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://oznksc.github.io/guideloop/"),
  title: "GuideLoop — React tours and onboarding",
  description:
    "Build contextual product tours and persistent onboarding checklists for React.",
  openGraph: {
    title: "GuideLoop — React tours and onboarding",
    description:
      "A live product onboarding experience built with GuideLoop for React.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
