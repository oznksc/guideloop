"use client";
import React, { useState, useCallback, useMemo } from "react";
import { GuideLoop } from "../../../src/components/GuideLoop";
import {
  OnboardingChecklist,
  OnboardingItem,
} from "../../../src/components/OnboardingChecklist";
import { Placement } from "@popperjs/core";
import { SettingsPanel, Settings } from "../components/SettingsPanel";
import { Dashboard } from "../components/Dashboard";
import { tourSets, themeVariants } from "../components/tourSets";

const defaultSettings: Settings = {
  selectedTour: "basic",
  theme: "tailwind",
  themeVariant: "default",
  animationPreset: "dynamic",
  buttonLabelPreset: "turkish",
  featurePreset: "full",
  placement: "bottom",
  spotlightPadding: 8,
  overlay: true,
  keyboard: true,
  scrollSmooth: true,
  animations: {
    tooltip: { enter: "fade-in 0.3s ease-out", exit: "fade-out 0.2s ease-in", duration: 300, timing: "ease" },
    spotlight: { enter: "scale-in 0.3s ease-out", exit: "scale-out 0.2s ease-in", duration: 300, timing: "ease" },
    overlay: { enter: "fade-in 0.3s ease-out", exit: "fade-out 0.2s ease-in", duration: 300, timing: "ease" },
  },
  initialStep: 0,
  buttonLabels: { next: "İleri", prev: "Geri", skip: "Atla", finish: "Bitir" },
  zIndex: 9999,
  eventLog: [],
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString("tr-TR");
    setSettings((prev) => ({
      ...prev,
      eventLog: [...prev.eventLog.slice(-19), `[${timestamp}] ${message}`],
    }));
  }, []);

  const steps = useMemo(() => {
    const tourData = tourSets.find((t) => t.id === settings.selectedTour);
    if (!tourData) return [];
    return tourData.steps.map((step) => ({
      ...step,
      placement: (step.placement || settings.placement) as Placement,
    }));
  }, [settings.selectedTour, settings.placement]);

  const handleStartTour = useCallback(() => {
    addLog("Tour başlatıldı");
    setShowWalkthrough(true);
  }, [addLog]);

  const handleClose = useCallback(() => {
    addLog("Tour kapatıldı");
    setShowWalkthrough(false);
  }, [addLog]);

  const handleStepChange = useCallback((step: number) => {
    addLog(`Step değişti: ${step + 1}`);
    const target = steps[step]?.target;
    if (target && target !== "#alertBox") {
      document.dispatchEvent(new CustomEvent("guideloop-modal-close"));
    }
  }, [addLog, steps]);

  const handleComplete = useCallback(() => {
    addLog("Tour tamamlandı!");
    setShowWalkthrough(false);
  }, [addLog]);

  const handleSkip = useCallback(() => {
    addLog("Tour atlandı");
    setShowWalkthrough(false);
  }, [addLog]);

  const themeConfig = useMemo(() => {
    const variants = themeVariants[settings.theme];
    const variant = variants?.find((v) => v.name === settings.themeVariant);
    return variant?.config;
  }, [settings.theme, settings.themeVariant]);

  const onboardingItems = useMemo<OnboardingItem[]>(() => [
    {
      id: "dashboard",
      title: "Open the dashboard",
      description: "Your workspace is ready.",
    },
    {
      id: "product-tour",
      title: "Complete the product tour",
      description: "Learn the main controls in a guided flow.",
      action: {
        type: "tour",
        steps,
        guideProps: {
          theme: settings.theme,
          customTheme: themeConfig,
          overlay: settings.overlay,
          keyboard: settings.keyboard,
          scrollSmooth: settings.scrollSmooth,
          spotlightPadding: settings.spotlightPadding,
          animations: settings.animations,
          defaultButtonLabels: settings.buttonLabels,
        },
      },
    },
    {
      id: "first-project",
      title: "Create your first project",
      description: "Start with a small, focused workspace.",
      action: {
        type: "modal",
        title: "Create your first project",
        content: (
          <div className="space-y-3">
            <p className="m-0 text-gray-600">
              This modal can contain your own form or setup flow. The checklist
              item is completed only after the primary action succeeds.
            </p>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Project name
              </span>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                defaultValue="My first project"
              />
            </label>
          </div>
        ),
        primaryLabel: "Create project",
        secondaryLabel: "Not now",
      },
    },
    {
      id: "integration-guide",
      title: "Read the integration guide",
      description: "See the API and copy a working example.",
      action: {
        type: "link",
        href: "https://github.com/oznksc/guideloop#readme",
        target: "_blank",
      },
    },
    {
      id: "settings",
      title: "Explore tour settings",
      description: "Open the playground controls.",
      action: {
        type: "custom",
        completeOnResolve: true,
        onAction: () => {
          document.getElementById("settings-fab")?.click();
        },
      },
    },
  ], [
    settings.animations,
    settings.buttonLabels,
    settings.keyboard,
    settings.overlay,
    settings.scrollSmooth,
    settings.spotlightPadding,
    settings.theme,
    steps,
    themeConfig,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width Dashboard */}
      <Dashboard onStartTour={handleStartTour} />

      {/* Persistent onboarding checklist */}
      <div className="fixed bottom-24 left-3 sm:bottom-6 sm:left-6 z-[9000] w-[380px] max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-3rem)]">
        <OnboardingChecklist
          items={onboardingItems}
          defaultCompletedIds={["dashboard"]}
          persist={{ key: "demo-getting-started-v1" }}
          theme={settings.theme}
          customTheme={themeConfig}
          zIndex={12000}
          onItemAction={(item) => addLog(`Onboarding görevi açıldı: ${item.id}`)}
          onComplete={() => addLog("Onboarding tamamlandı!")}
        />
      </div>

      {/* GuideLoop Tour */}
      <GuideLoop
        steps={steps}
        isOpen={showWalkthrough}
        onClose={handleClose}
        theme={settings.theme}
        customTheme={themeConfig}
        initialStep={settings.initialStep}
        overlay={settings.overlay}
        keyboard={settings.keyboard}
        scrollSmooth={settings.scrollSmooth}
        spotlightPadding={settings.spotlightPadding}
        animations={settings.animations}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
        onSkip={handleSkip}
        zIndex={settings.zIndex}
        defaultButtonLabels={settings.buttonLabels}
      />

      {/* Settings FAB + Panel */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        onStartTour={handleStartTour}
        isTourRunning={showWalkthrough}
      />
    </div>
  );
}
