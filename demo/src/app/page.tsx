"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GuideLoop,
  OnboardingChecklist,
  type OnboardingItem,
  type Step,
  type ThemeConfig,
  clearOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
} from "guideloop";
import {
  ArrowRight,
  Check,
  CodeIcon,
  Copy,
  GuideLoopLogo,
  Layers,
  Shield,
  Sparkles,
} from "../components/DemoIcons";
import { InteractivePlayground } from "../components/InteractivePlayground";
import "./landing.css";

const GITHUB_URL = "https://github.com/oznksc/guideloop";
const NPM_URL = "https://www.npmjs.com/package/guideloop";
const INSTALL_COMMAND = "npm install guideloop";
const CHECKLIST_KEY = "guideloop-demo-getting-started-v4";

type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";

interface DemoThemePreset {
  id: DemoThemeId;
  name: string;
  badge: string;
  description: string;
  icon: string;
  config: ThemeConfig;
}

const DEMO_THEMES: Record<DemoThemeId, DemoThemePreset> = {
  slate: {
    id: "slate",
    name: "Developer Slate",
    badge: "Dark Indigo",
    description: "High-density dark slate with electric indigo & cyan indicators",
    icon: "⚡",
    config: {
      tooltip: {
        background: "#111726",
        textColor: "#f1f5f9",
        borderRadius: "0.5rem",
        padding: "1.25rem",
        boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.6)",
      },
      overlay: {
        background: "#060911",
        opacity: 0.7,
      },
      spotlight: {
        borderColor: "#6366f1",
        borderWidth: "2px",
        borderRadius: "0.4rem",
        animation: "guideloop-focus 1.8s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
      buttons: {
        primary: {
          background: "#6366f1",
          textColor: "#ffffff",
          hoverBackground: "#4f46e5",
          padding: "0.4rem 0.9rem",
        },
        secondary: {
          background: "transparent",
          textColor: "#94a3b8",
          hoverBackground: "#182238",
          padding: "0.4rem 0.9rem",
        },
      },
    },
  },
  editorial: {
    id: "editorial",
    name: "Editorial Craft",
    badge: "Warm Paper",
    description: "Warm parchment paper with Newsreader serif headings & terracotta accent",
    icon: "📜",
    config: {
      tooltip: {
        background: "#ffffff",
        textColor: "#1c1917",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        boxShadow: "0 1rem 2.5rem rgba(28, 25, 23, 0.16)",
      },
      overlay: {
        background: "#292524",
        opacity: 0.52,
      },
      spotlight: {
        borderColor: "#9a3412",
        borderWidth: "2px",
        borderRadius: "0.4rem",
        animation: "guideloop-focus 1.8s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
      buttons: {
        primary: {
          background: "#9a3412",
          textColor: "#fff7ed",
          hoverBackground: "#7c2d12",
          padding: "0.4rem 0.9rem",
        },
        secondary: {
          background: "transparent",
          textColor: "#57534e",
          hoverBackground: "#f4efe6",
          padding: "0.4rem 0.9rem",
        },
      },
    },
  },
  terminal: {
    id: "terminal",
    name: "Terminal CLI",
    badge: "Phosphor Emerald",
    description: "Obsidian matrix midnight with glowing phosphor green prompts",
    icon: "📟",
    config: {
      tooltip: {
        background: "#0b140e",
        textColor: "#ecfdf5",
        borderRadius: "0.35rem",
        padding: "1.15rem",
        boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.85)",
      },
      overlay: {
        background: "#03140a",
        opacity: 0.78,
      },
      spotlight: {
        borderColor: "#10b981",
        borderWidth: "2px",
        borderRadius: "0.3rem",
        animation: "guideloop-focus 1.8s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
      buttons: {
        primary: {
          background: "#10b981",
          textColor: "#022c22",
          hoverBackground: "#059669",
          padding: "0.4rem 0.9rem",
        },
        secondary: {
          background: "transparent",
          textColor: "#6ee7b7",
          hoverBackground: "#122117",
          padding: "0.4rem 0.9rem",
        },
      },
    },
  },
  nordic: {
    id: "nordic",
    name: "Nordic Frost",
    badge: "Arctic Azure",
    description: "Frost blue canvas with azure spotlights & crisp white cards",
    icon: "💎",
    config: {
      tooltip: {
        background: "#ffffff",
        textColor: "#0f172a",
        borderRadius: "0.65rem",
        padding: "1.2rem",
        boxShadow: "0 1rem 2.5rem rgba(15, 23, 42, 0.14)",
      },
      overlay: {
        background: "#1e293b",
        opacity: 0.5,
      },
      spotlight: {
        borderColor: "#0284c7",
        borderWidth: "2px",
        borderRadius: "0.5rem",
        animation: "guideloop-focus 1.8s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
      buttons: {
        primary: {
          background: "#0284c7",
          textColor: "#f0f9ff",
          hoverBackground: "#0369a1",
          padding: "0.4rem 0.9rem",
        },
        secondary: {
          background: "transparent",
          textColor: "#334155",
          hoverBackground: "#e2e8f0",
          padding: "0.4rem 0.9rem",
        },
      },
    },
  },
};

const tourSteps: Step[] = [
  {
    target: "#test-search",
    title: "DOM Element Anchoring",
    content:
      "Binds directly to any CSS selector (#test-search). Calculates target bounds dynamically on window resize or scroll.",
    placement: "bottom",
  },
  {
    target: "#test-filter-tabs",
    title: "Filter & Tab Placement",
    content:
      "Configurable tooltip placement ('bottom', 'right', 'top', 'left') with automatic boundary detection.",
    placement: "bottom",
  },
  {
    target: "#test-metrics",
    title: "Real-Time Metric Spotlights",
    content:
      "Spotlights metrics, latency indicators, and readiness status at the exact moment clarification is needed.",
    placement: "bottom",
  },
  {
    target: "#test-notifications",
    title: "Overlay Mask & Focus Trap",
    content:
      "Renders SVG overlay over non-active UI elements while enforcing keyboard tab focus loops.",
    placement: "bottom",
  },
  {
    target: "#test-action-form",
    title: "Action & Form Integration",
    content:
      "Embeds into onboarding tasks to trigger multi-step guides and form completion workflows.",
    placement: "top",
  },
];

const integrationCode = `import { useState } from "react";
import {
  GuideLoop,
  OnboardingChecklist,
  type OnboardingItem,
  type Step
} from "guideloop";

const steps: Step[] = [{
  target: "#search-bar",
  title: "DOM Element Anchoring",
  content: "Binds to target element via CSS selector."
}];

const items: OnboardingItem[] = [{
  id: "tour",
  title: "Run product walkthrough",
  action: { type: "tour", steps }
}];

export function ProductOnboarding() {
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setTourOpen(true)}>
        Start tour
      </button>
      <GuideLoop
        steps={steps}
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />
      <OnboardingChecklist
        items={items}
        persist={{ key: "getting-started" }}
      />
    </section>
  );
}`;

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => target.focus({ preventScroll: true }), 420);
}

interface CliLogEntry {
  id: string;
  time: string;
  level: "SYS" | "TOUR" | "THEME" | "ACTION";
  msg: string;
}

const initialLogs: CliLogEntry[] = [
  { id: "1", time: "00:00:00", level: "SYS", msg: "GuideLoop guidance engine initialized." },
  { id: "2", time: "00:00:00", level: "THEME", msg: "Active theme preset: DEVELOPER SLATE" },
];

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState<DemoThemeId>("slate");
  const [initialStepIndex, setInitialStepIndex] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [integrationCopied, setIntegrationCopied] = useState(false);
  const [checklistInstance, setChecklistInstance] = useState(0);
  const [dockFloating, setDockFloating] = useState(true);
  const [cliLogs, setCliLogs] = useState<CliLogEntry[]>(initialLogs);
  const [showConsole, setShowConsole] = useState(false);
  const [experienceStatus, setExperienceStatus] = useState(
    "Interactive GuideLoop sandbox active.",
  );

  const activeThemePreset = DEMO_THEMES[currentTheme];
  const activeThemeConfig = activeThemePreset.config;

  const pushCliLog = useCallback((level: CliLogEntry["level"], msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const id = Math.random().toString(36).substring(2, 9);
    setCliLogs((prev) => [...prev.slice(-12), { id, time, level, msg }]);
  }, []);

  const changeTheme = useCallback((themeId: DemoThemeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    const themeName = DEMO_THEMES[themeId].name;
    setExperienceStatus(`Style set to ${themeName}.`);
    pushCliLog("THEME", `Switched theme preset to ${themeName.toUpperCase()}`);
  }, [pushCliLog]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const copyInstallCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      pushCliLog("ACTION", `Copied install command: "${INSTALL_COMMAND}"`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [pushCliLog]);

  const copyIntegrationCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(integrationCode);
      setIntegrationCopied(true);
      pushCliLog("ACTION", "Copied React integration snippet.");
      window.setTimeout(() => setIntegrationCopied(false), 1800);
    } catch {
      setIntegrationCopied(false);
    }
  }, [pushCliLog]);

  const completePersistedItem = useCallback((itemId: string) => {
    const current =
      loadOnboardingState(CHECKLIST_KEY)?.completedIds ?? ["workspace"];
    saveOnboardingState(
      CHECKLIST_KEY,
      Array.from(new Set([...current, itemId])),
    );
    setChecklistInstance((instance) => instance + 1);
    pushCliLog("ACTION", `Checklist task completed: "${itemId}"`);
  }, [pushCliLog]);

  const startTour = useCallback(() => {
    setInitialStepIndex(0);
    setExperienceStatus("Tour active — Step 1 Spotlight focused.");
    setTourOpen(true);
    pushCliLog("TOUR", "Contextual tour started. Step 1/5 focused.");
  }, [pushCliLog]);

  const triggerTarget = useCallback((selector: string) => {
    const idx = tourSteps.findIndex((s) => s.target === selector);
    setInitialStepIndex(idx >= 0 ? idx : 0);
    setExperienceStatus(`Target spotlight active: ${selector}`);
    setTourOpen(true);
    pushCliLog("TOUR", `Triggered target spotlight: ${selector}`);
  }, [pushCliLog]);

  const resetExperience = useCallback(() => {
    clearOnboardingState(CHECKLIST_KEY);
    setTourOpen(false);
    setChecklistInstance((instance) => instance + 1);
    setExperienceStatus("Demo state reset.");
    pushCliLog("SYS", "Onboarding state cleared.");
  }, [pushCliLog]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "1") {
        changeTheme("slate");
      } else if (event.key === "2") {
        changeTheme("editorial");
      } else if (event.key === "3") {
        changeTheme("terminal");
      } else if (event.key === "4") {
        changeTheme("nordic");
      } else if (event.key.toLowerCase() === "t" && !event.metaKey && !event.ctrlKey) {
        startTour();
      } else if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey) {
        resetExperience();
      } else if (event.key.toLowerCase() === "d" && !event.metaKey && !event.ctrlKey) {
        setDockFloating((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [changeTheme, resetExperience, startTour]);

  const onboardingItems = useMemo<OnboardingItem[]>(
    () => [
      {
        id: "workspace",
        title: "Inspect DOM workspace",
        description: "Embedded sample React application.",
      },
      {
        id: "tour",
        title: "Execute step spotlight tour",
        description: "Triggers 5 contextual step spotlights.",
        action: {
          type: "tour",
          steps: tourSteps,
          guideProps: {
            theme: "custom",
            customTheme: activeThemeConfig,
            keyboard: true,
            scrollSmooth: true,
            spotlightPadding: 10,
            zIndex: 5000,
            defaultButtonLabels: {
              next: "Next Step",
              prev: "Previous",
              skip: "Skip Tour",
              finish: "Finish",
            },
          },
          onComplete: () => {
            setExperienceStatus("Tour completed successfully.");
            pushCliLog("TOUR", "Tour finished successfully.");
          },
        },
      },
      {
        id: "milestone",
        title: "Trigger modal action",
        description: "Executes custom React modal workflow.",
        action: {
          type: "modal",
          title: "Create a milestone",
          content: (
            <div className="onboarding-form">
              <p>
                Add a milestone to this sample launch. Saved in browser storage.
              </p>
              <label htmlFor="onboarding-milestone">Milestone name</label>
              <input
                id="onboarding-milestone"
                name="milestone"
                placeholder="Release candidate"
                autoComplete="off"
              />
              <label htmlFor="onboarding-date">Target date</label>
              <input id="onboarding-date" name="date" type="date" />
            </div>
          ),
          primaryLabel: "Add milestone",
          secondaryLabel: "Not now",
          onPrimary: () => {
            const input = document.getElementById(
              "onboarding-milestone",
            ) as HTMLInputElement | null;
            if (!input?.value.trim()) {
              throw new Error("A milestone name is required.");
            }
            const val = input.value.trim();
            setExperienceStatus(`Milestone “${val}” created.`);
            pushCliLog("ACTION", `Milestone committed: "${val}"`);
          },
        },
      },
      {
        id: "integration",
        title: "Review component code",
        description: "Examine React integration snippet.",
        action: {
          type: "link",
          href: "#integration",
          onNavigate: () =>
            window.setTimeout(() => scrollToSection("integration"), 0),
        },
      },
    ],
    [activeThemeConfig, pushCliLog],
  );

  return (
    <main className="landing-wrapper">
      <a className="skip-link" href="#content">
        Skip to main content
      </a>

      {/* TOP HEADER NAV */}
      <header className="site-header">
        <div className="header-inner">
          <a className="site-brand" href="#top" aria-label="GuideLoop home">
            <GuideLoopLogo className="brand-logo" />
            <span className="brand-badge">v1.4.0</span>
          </a>

          <div className="theme-compact-selector" aria-label="Theme selector">
            {(Object.keys(DEMO_THEMES) as DemoThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`theme-pill-btn ${currentTheme === id ? "is-active" : ""}`}
                onClick={() => changeTheme(id)}
                title={`Switch style to ${DEMO_THEMES[id].name}`}
              >
                <span>{DEMO_THEMES[id].icon}</span>
                <span className="theme-pill-name">{DEMO_THEMES[id].name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div className="header-actions">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </header>

      <div id="content" tabIndex={-1}>
        {/* HERO SECTION */}
        <section id="top" className="hero-section">
          <div className="hero-container">
            <div className="hero-badge">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>React Step Spotlight & Onboarding Checklist Library</span>
            </div>

            <h1 className="hero-title">
              Contextual Product Tours &amp; <br />
              <span className="hero-gradient-text">Onboarding Checklists for React</span>
            </h1>

            <p className="hero-subtitle">
              Lightweight React components for element spotlight tours and persisted onboarding checklists. Powered by Popper.js positioning, keyboard focus traps, and CSS custom property themes.
            </p>

            <div className="hero-cta-group">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={startTour}
              >
                <ArrowRight className="w-5 h-5" />
                <span>Run Tour Sandbox [T]</span>
              </button>

              <div className="install-command-pill">
                <code>$ npm i guideloop</code>
                <button
                  type="button"
                  onClick={() => void copyInstallCommand()}
                  title="Copy install command"
                  aria-label="Copy install command"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* WORKBENCH SECTION */}
        <section id="live" className="workbench-section" tabIndex={-1}>
          <div className="workbench-container">
            <div className="workbench-frame">
              {/* INTERACTIVE PLAYGROUND SANDBOX */}
              <InteractivePlayground
                onStartTour={startTour}
                onResetState={resetExperience}
                onTriggerTarget={triggerTarget}
                statusMessage={experienceStatus}
              />

              {/* CONSOLE LOG DRAWER */}
              <div className="console-drawer">
                <button
                  type="button"
                  className="console-toggle"
                  onClick={() => setShowConsole((prev) => !prev)}
                >
                  <span>❯ Event Stream Logs ({cliLogs.length})</span>
                  <span>{showConsole ? "▼ Hide" : "▲ View Logs"}</span>
                </button>
                {showConsole && (
                  <div className="console-body">
                    {cliLogs.map((log) => (
                      <div key={log.id} className="console-line">
                        <span className="log-time">[{log.time}]</span>
                        <span className={`log-tag log-tag--${log.level.toLowerCase()}`}>
                          [{log.level}]
                        </span>
                        <span className="log-msg">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ONBOARDING CHECKLIST DOCK */}
              <div
                className={`onboarding-dock ${
                  dockFloating ? "onboarding-dock--floating" : "onboarding-dock--inline"
                }`}
              >
                <OnboardingChecklist
                  key={checklistInstance}
                  items={onboardingItems}
                  title="Getting Started Checklist"
                  description="Try every onboarding task in real time."
                  defaultCompletedIds={["workspace"]}
                  persist={{ key: CHECKLIST_KEY }}
                  theme="custom"
                  customTheme={activeThemeConfig}
                  className="product-checklist"
                  ariaLabel="GuideLoop demo getting started checklist"
                  zIndex={5000}
                  labels={{
                    progress: (completed, total) =>
                      `${completed} of ${total} steps completed`,
                    error: "Enter a milestone name to continue.",
                  }}
                  onProgressChange={(progress) => {
                    setExperienceStatus(
                      `${progress.completed}/${progress.total} onboarding tasks completed.`,
                    );
                  }}
                  onComplete={() => {
                    setExperienceStatus("All onboarding tasks finished!");
                    pushCliLog("SYS", "All checklist tasks complete!");
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="features-section">
          <div className="features-container">
            <div className="section-header">
              <span className="section-kicker">TECHNICAL SPECIFICATION</span>
              <h2>Core Architecture &amp; Features</h2>
              <p>Type-safe components for contextual guides, DOM element spotlights, and stateful checklists.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-box">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3>Element Spotlight Anchoring</h3>
                <p>Target DOM elements via CSS selectors with dynamic positioning, automatic scroll alignment, and overlay masks powered by Popper.js.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <Layers className="w-6 h-6 text-accent" />
                </div>
                <h3>CSS Variable Theme Engine</h3>
                <p>Customize tooltip card backgrounds, spotlight borders, and overlays using CSS custom properties or structured JSON ThemeConfig objects.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3>Persisted Onboarding State</h3>
                <p>Render step progress bars with automatic localStorage persistence, completion callbacks, and custom modal action triggers.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-box">
                  <CodeIcon className="w-6 h-6 text-accent" />
                </div>
                <h3>Accessible &amp; Keyboard-First</h3>
                <p>Built-in focus traps, Esc key handling, keyboard shortcuts (Arrow keys, Enter), and fully compliant ARIA accessibility attributes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICKSTART SECTION */}
        <section id="quickstart" className="quickstart-section" tabIndex={-1}>
          <div className="quickstart-container">
            <div className="quickstart-grid">
              <div className="quickstart-copy">
                <span className="section-kicker">DEVELOPER INTEGRATION</span>
                <h2>Type-Safe React API</h2>
                <p>
                  Import <code>GuideLoop</code> and <code>OnboardingChecklist</code> directly into your React application with TypeScript types.
                </p>
                <div className="spec-cards">
                  <div className="spec-card">
                    <span className="spec-label">Package</span>
                    <strong>npm install guideloop</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-label">Bundle Size</span>
                    <strong>&lt; 8 kB gzipped</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-label">License</span>
                    <strong>MIT Open Source</strong>
                  </div>
                </div>
              </div>

              <div className="code-window">
                <div className="code-header">
                  <div className="code-dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                  </div>
                  <span className="code-filename">App.tsx</span>
                  <button
                    type="button"
                    className="code-copy-btn"
                    onClick={() => void copyIntegrationCode()}
                    aria-label="Copy GuideLoop integration example"
                  >
                    {integrationCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{integrationCopied ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>
                <pre tabIndex={0} aria-label="GuideLoop integration example">
                  <code>{integrationCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <GuideLoopLogo className="footer-logo" />
            <p>Type-safe React components for contextual element guides, spotlights, and onboarding checklists.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <strong>Resources</strong>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub Repository</a>
              <a href={NPM_URL} target="_blank" rel="noreferrer">NPM Package</a>
            </div>
            <div className="footer-col">
              <strong>License</strong>
              <span>MIT License</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <span>© 2026 GuideLoop. All rights reserved.</span>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>

      {/* GUIDELOOP COMPONENT INSTANCE */}
      <GuideLoop
        steps={tourSteps}
        isOpen={tourOpen}
        initialStep={initialStepIndex}
        onClose={() => {
          setTourOpen(false);
          setExperienceStatus("Tour closed.");
          pushCliLog("TOUR", "Tour modal closed by user.");
        }}
        onStepChange={(stepIndex) => {
          const step = tourSteps[stepIndex];
          if (step) {
            pushCliLog(
              "TOUR",
              `Focused step ${stepIndex + 1}/5: ${step.target} ("${step.title}")`,
            );
          }
        }}
        onSkip={() => {
          setExperienceStatus("Tour skipped.");
          pushCliLog("TOUR", "Tour skipped by user.");
        }}
        onComplete={() => {
          setTourOpen(false);
          completePersistedItem("tour");
          setExperienceStatus("Tour finished.");
          pushCliLog("TOUR", "Tour completed successfully!");
        }}
        theme="custom"
        customTheme={activeThemeConfig}
        keyboard
        scrollSmooth
        spotlightPadding={10}
        zIndex={5000}
        defaultButtonLabels={{
          next: "Next",
          prev: "Previous",
          skip: "Skip",
          finish: "Finish",
        }}
      />
    </main>
  );
}
