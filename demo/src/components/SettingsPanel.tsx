"use client";
import React, { useState, useRef, useEffect } from "react";
import { AnimationConfig } from "../../../src/utils/animation";
import { tourSets, themeVariants, animationPresets, buttonLabelPresets, featurePresets } from "./tourSets";

type Theme = "tailwind" | "material" | "antd" | "custom";

export interface Settings {
  selectedTour: string;
  theme: Theme;
  themeVariant: string;
  animationPreset: string;
  buttonLabelPreset: string;
  featurePreset: string;
  placement: string;
  spotlightPadding: number;
  overlay: boolean;
  keyboard: boolean;
  scrollSmooth: boolean;
  animations: AnimationConfig;
  initialStep: number;
  buttonLabels: { next: string; prev: string; skip: string; finish: string };
  zIndex: number;
  eventLog: string[];
}

interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onStartTour: () => void;
  isTourRunning: boolean;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-gray-600"}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </div>
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-xs text-blue-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-300 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm text-gray-300 block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-700/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-700/30 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onStartTour, isTourRunning }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const update = (partial: Partial<Settings>) => onSettingsChange({ ...settings, ...partial });
  const selectedTourData = tourSets.find((t) => t.id === settings.selectedTour);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <>
      {/* FAB Button */}
      <button
        id="settings-fab"
        ref={fabRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[10000] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? "bg-gray-800 text-white rotate-45"
            : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-110 hover:shadow-blue-500/30"
        }`}
        title={isOpen ? "Kapat" : "Ayarlar"}
      >
        <svg
          className="w-6 h-6 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </>
          )}
        </svg>
      </button>

      {/* Tooltip/Popup Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-[10000] w-[380px] max-h-[calc(100vh-120px)] bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col animate-in"
          style={{
            animation: "fab-pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold">GuideLoop Settings</h2>
                  <p className="text-[10px] text-gray-500">Tour konfigürasyonu</p>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                {selectedTourData?.steps.length || 0} steps
              </span>
            </div>
            <button
              onClick={() => {
                onStartTour();
                setIsOpen(false);
              }}
              disabled={isTourRunning}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isTourRunning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 active:scale-[0.98]"
              }`}
            >
              {isTourRunning ? "Tour Running..." : "Start Tour"}
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <CollapsibleSection title="Tour Seçimi" defaultOpen={true}>
              <div className="space-y-1.5">
                {tourSets.map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => update({ selectedTour: tour.id })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      settings.selectedTour === tour.id
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-gray-300 hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div className="font-medium">{tour.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tour.description}</div>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Theme">
              <Select
                label="Tema"
                value={settings.theme}
                onChange={(v) => {
                  const newTheme = v as Theme;
                  const firstVariant = themeVariants[newTheme]?.[0]?.name || "default";
                  update({ theme: newTheme, themeVariant: firstVariant });
                }}
                options={[
                  { value: "tailwind", label: "Tailwind" },
                  { value: "material", label: "Material" },
                  { value: "antd", label: "Ant Design" },
                  { value: "custom", label: "Custom" },
                ]}
              />
              {themeVariants[settings.theme]?.length > 1 && (
                <Select
                  label="Tema Varyanti"
                  value={settings.themeVariant}
                  onChange={(v) => update({ themeVariant: v })}
                  options={themeVariants[settings.theme].map((v) => ({
                    value: v.name,
                    label: v.label,
                  }))}
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection title="Positioning">
              <Select
                label="Default Placement"
                value={settings.placement}
                onChange={(v) => update({ placement: v })}
                options={[
                  { value: "bottom", label: "Bottom" },
                  { value: "top", label: "Top" },
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                  { value: "auto", label: "Auto" },
                  { value: "auto-start", label: "Auto Start" },
                  { value: "auto-end", label: "Auto End" },
                ]}
              />
              <Slider
                label="Spotlight Padding"
                value={settings.spotlightPadding}
                onChange={(v) => update({ spotlightPadding: v })}
                min={0}
                max={32}
              />
            </CollapsibleSection>

            <CollapsibleSection title="Features">
              <Select
                label="Feature Preset"
                value={settings.featurePreset}
                onChange={(v) => {
                  const preset = featurePresets.find((p) => p.name === v);
                  if (preset) {
                    update({
                      featurePreset: v,
                      overlay: preset.config.overlay,
                      keyboard: preset.config.keyboard,
                      scrollSmooth: preset.config.scrollSmooth,
                    });
                  }
                }}
                options={featurePresets.map((p) => ({ value: p.name, label: p.label }))}
              />
              <div className="pt-2 space-y-2">
                <Toggle label="Overlay" checked={settings.overlay} onChange={(v) => update({ overlay: v, featurePreset: "custom" })} />
                <Toggle label="Keyboard Navigation" checked={settings.keyboard} onChange={(v) => update({ keyboard: v, featurePreset: "custom" })} />
                <Toggle label="Scroll Smooth" checked={settings.scrollSmooth} onChange={(v) => update({ scrollSmooth: v, featurePreset: "custom" })} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Animations">
              <Select
                label="Animation Preset"
                value={settings.animationPreset}
                onChange={(v) => {
                  const preset = animationPresets.find((p) => p.name === v);
                  if (preset) {
                    update({
                      animationPreset: v,
                      animations: {
                        ...settings.animations,
                        tooltip: {
                          ...settings.animations.tooltip,
                          enter: preset.config.tooltip.enter,
                          exit: preset.config.tooltip.exit,
                          duration: preset.config.tooltip.duration,
                        },
                      },
                    });
                  }
                }}
                options={animationPresets.map((p) => ({ value: p.name, label: p.label }))}
              />
              <div className="pt-2">
                <Select
                  label="Tooltip Enter"
                  value={settings.animations.tooltip?.enter || ""}
                  onChange={(v) =>
                    update({
                      animationPreset: "custom",
                      animations: { ...settings.animations, tooltip: { ...settings.animations.tooltip, enter: v } },
                    })
                  }
                  options={[
                    { value: "fade-in 0.3s ease-out", label: "Fade In" },
                    { value: "scale-in 0.3s ease-out", label: "Scale In" },
                    { value: "fade-in 0.5s ease-out", label: "Fade In (Slow)" },
                    { value: "scale-in 0.5s ease-out", label: "Scale In (Slow)" },
                  ]}
                />
                <Select
                  label="Tooltip Exit"
                  value={settings.animations.tooltip?.exit || ""}
                  onChange={(v) =>
                    update({
                      animationPreset: "custom",
                      animations: { ...settings.animations, tooltip: { ...settings.animations.tooltip, exit: v } },
                    })
                  }
                  options={[
                    { value: "fade-out 0.2s ease-in", label: "Fade Out" },
                    { value: "scale-out 0.2s ease-in", label: "Scale Out" },
                    { value: "fade-out 0.5s ease-in", label: "Fade Out (Slow)" },
                    { value: "scale-out 0.5s ease-in", label: "Scale Out (Slow)" },
                  ]}
                />
                <Slider
                  label="Duration (ms)"
                  value={settings.animations.tooltip?.duration || 300}
                  onChange={(v) =>
                    update({
                      animationPreset: "custom",
                      animations: { ...settings.animations, tooltip: { ...settings.animations.tooltip, duration: v } },
                    })
                  }
                  min={100}
                  max={1000}
                  step={50}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Button Labels">
              <Select
                label="Language"
                value={settings.buttonLabelPreset}
                onChange={(v) => {
                  const preset = buttonLabelPresets.find((p) => p.name === v);
                  if (preset) {
                    update({
                      buttonLabelPreset: v,
                      buttonLabels: { ...preset.config },
                    });
                  }
                }}
                options={buttonLabelPresets.map((p) => ({ value: p.name, label: p.label }))}
              />
              <div className="pt-2 space-y-2">
                <TextInput label="Next" value={settings.buttonLabels.next} onChange={(v) => update({ buttonLabelPreset: "custom", buttonLabels: { ...settings.buttonLabels, next: v } })} />
                <TextInput label="Previous" value={settings.buttonLabels.prev} onChange={(v) => update({ buttonLabelPreset: "custom", buttonLabels: { ...settings.buttonLabels, prev: v } })} />
                <TextInput label="Skip" value={settings.buttonLabels.skip} onChange={(v) => update({ buttonLabelPreset: "custom", buttonLabels: { ...settings.buttonLabels, skip: v } })} />
                <TextInput label="Finish" value={settings.buttonLabels.finish} onChange={(v) => update({ buttonLabelPreset: "custom", buttonLabels: { ...settings.buttonLabels, finish: v } })} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Advanced">
              <Slider
                label="Initial Step"
                value={settings.initialStep}
                onChange={(v) => update({ initialStep: v })}
                min={0}
                max={Math.max(0, (selectedTourData?.steps.length || 1) - 1)}
              />
              <TextInput
                label="Z-Index"
                value={String(settings.zIndex)}
                onChange={(v) => update({ zIndex: parseInt(v) || 9999 })}
                placeholder="9999"
              />
            </CollapsibleSection>

            <CollapsibleSection title="Event Log">
              <div className="bg-gray-950 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-xs">
                {settings.eventLog.length === 0 ? (
                  <span className="text-gray-500">Henüz event yok...</span>
                ) : (
                  settings.eventLog.map((log, i) => (
                    <div key={i} className="text-gray-400 py-0.5">{log}</div>
                  ))
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      )}
    </>
  );
};
