import type { Metadata } from "next";
import DocsContent from "./DocsContent";

export const metadata: Metadata = {
  title: "Documentation — GuideLoop product tours",
  description:
    "GuideLoop core documentation: install guide, step schema, lifecycle hooks, theme resolution, DOM event triggers, multi-page persistence, and imperative API reference for React, Vue, Svelte, Angular, Vanilla JS & Web Components.",
  alternates: {
    canonical: "/docs/",
  },
  openGraph: {
    title: "GuideLoop Documentation — step model, themes & lifecycle",
    description:
      "Technical specs for @guideloop/core and every framework adapter: step schema, branching, triggers, persistence, theming, and a11y.",
    type: "website",
    url: "/docs/",
  },
};

export default function DocsPage() {
  return <DocsContent />;
}
