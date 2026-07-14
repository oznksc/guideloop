"use client";
import React, { useState, useCallback, useMemo } from "react";
import { GuideLoop } from "../../../src/components/GuideLoop";
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
  buttonLabels: { next: "Ileri", prev: "Geri", skip: "Atla", finish: "Bitir" },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width Dashboard */}
      <Dashboard onStartTour={handleStartTour} />

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
