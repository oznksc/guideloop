import type { Metadata } from "next";
import UIContent from "./UIContent";

export const metadata: Metadata = {
  title: "UI Kit — GuideLoop components across themes",
  description:
    "Interactive preview of GuideLoop UI components — buttons, tooltips, progress dots, spotlight, onboarding checklist, overlay and theme colors across Tailwind, Material and Ant Design themes.",
  alternates: {
    canonical: "/ui/",
  },
  openGraph: {
    title: "GuideLoop UI Kit — component showcase",
    description:
      "Explore GuideLoop's Tooltip, Spotlight, Progress, OnboardingChecklist and MaskedOverlay across every built-in theme.",
    type: "website",
    url: "/ui/",
  },
};

export default function UIPage() {
  return <UIContent />;
}
