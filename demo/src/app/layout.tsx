import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lora, JetBrains_Mono } from "next/font/google";
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
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
