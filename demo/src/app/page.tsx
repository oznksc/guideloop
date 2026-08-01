"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GuideLoop,
  type Step,
  type ThemeConfig,
} from "guideloop";
import {
  ArrowRight,
  Check,
  Copy,
  GuideLoopLogo,
  Search,
  Sparkles,
  Timeline,
  Bell,
} from "../components/DemoIcons";
import "./landing.css";

const GITHUB_URL = "https://github.com/oznksc/guideloop";
const NPM_URL = "https://www.npmjs.com/package/guideloop";
const INSTALL_COMMAND = "npm install guideloop";

type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";

interface DemoThemePreset {
  id: DemoThemeId;
  name: string;
  icon: string;
  config: ThemeConfig;
}

const DEMO_THEMES: Record<DemoThemeId, DemoThemePreset> = {
  slate: {
    id: "slate",
    name: "Developer Slate",
    icon: "\u26A1",
    config: {
      tooltip: {
        background: "#111726",
        textColor: "#f1f5f9",
        borderRadius: "0.5rem",
        padding: "1.25rem",
        boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.6)",
      },
      overlay: { background: "#060911", opacity: 0.7 },
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
    icon: "\uD83D\uDCDC",
    config: {
      tooltip: {
        background: "#ffffff",
        textColor: "#1c1917",
        borderRadius: "0.75rem",
        padding: "1.25rem",
        boxShadow: "0 1rem 2.5rem rgba(28, 25, 23, 0.16)",
      },
      overlay: { background: "#292524", opacity: 0.52 },
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
    icon: "\uD83D\uDCDF",
    config: {
      tooltip: {
        background: "#0b140e",
        textColor: "#ecfdf5",
        borderRadius: "0.35rem",
        padding: "1.15rem",
        boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.85)",
      },
      overlay: { background: "#03140a", opacity: 0.78 },
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
    icon: "\uD83D\uDC8E",
    config: {
      tooltip: {
        background: "#ffffff",
        textColor: "#0f172a",
        borderRadius: "0.65rem",
        padding: "1.2rem",
        boxShadow: "0 1rem 2.5rem rgba(15, 23, 42, 0.14)",
      },
      overlay: { background: "#1e293b", opacity: 0.5 },
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
    target: "#demo-search",
    title: "DOM Element Anchoring",
    content:
      "Binds directly to any CSS selector. Calculates target bounds dynamically on window resize or scroll.",
    placement: "bottom",
  },
  {
    target: "#demo-metrics",
    title: "Real-Time Metric Spotlights",
    content:
      "Spotlights metrics, latency indicators, and readiness status at the exact moment clarification is needed.",
    placement: "bottom",
  },
  {
    target: "#demo-notifications",
    title: "Overlay Mask & Focus Trap",
    content:
      "Renders SVG overlay over non-active UI elements while enforcing keyboard tab focus loops.",
    placement: "bottom",
  },
];

const integrationCode = `import { useState } from "react";
import {
  GuideLoop,
  OnboardingChecklist,
  type Step
} from "guideloop";

const steps: Step[] = [{
  target: "#search-bar",
  title: "DOM Element Anchoring",
  content: "Binds to target element via CSS selector."
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
    </section>
  );
}`;

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
  const [cliLogs, setCliLogs] = useState<CliLogEntry[]>(initialLogs);
  const [showConsole, setShowConsole] = useState(false);
  const [demoStatus, setDemoStatus] = useState("Spotlight sandbox active.");
  const [demoQuery, setDemoQuery] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const activeThemePreset = DEMO_THEMES[currentTheme];
  const activeThemeConfig = activeThemePreset.config;

  const pushCliLog = useCallback((level: CliLogEntry["level"], msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const id = Math.random().toString(36).substring(2, 9);
    setCliLogs((prev) => [...prev.slice(-12), { id, time, level, msg }]);
  }, []);

  const applyThemeToDocument = useCallback((themeId: DemoThemeId) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", themeId);
    const scheme =
      themeId === "editorial" || themeId === "nordic" ? "light" : "dark";
    root.style.colorScheme = scheme;
  }, []);

  const changeTheme = useCallback((themeId: DemoThemeId) => {
    setCurrentTheme(themeId);
    applyThemeToDocument(themeId);
    setDemoStatus(`Style set to ${DEMO_THEMES[themeId].name}.`);
    pushCliLog("THEME", `Switched theme preset to ${DEMO_THEMES[themeId].name.toUpperCase()}`);
  }, [applyThemeToDocument, pushCliLog]);

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme, applyThemeToDocument]);

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

  const startTour = useCallback(() => {
    setInitialStepIndex(0);
    setDemoStatus("Tour active \u2014 Step 1 Spotlight focused.");
    setTourOpen(true);
    pushCliLog("TOUR", "Contextual tour started. Step 1/3 focused.");
  }, [pushCliLog]);

  const triggerTarget = useCallback((selector: string) => {
    const idx = tourSteps.findIndex((s) => s.target === selector);
    setInitialStepIndex(idx >= 0 ? idx : 0);
    setDemoStatus(`Target spotlight active: ${selector}`);
    setTourOpen(true);
    pushCliLog("TOUR", `Triggered target spotlight: ${selector}`);
  }, [pushCliLog]);

  const resetExperience = useCallback(() => {
    setTourOpen(false);
    setDemoStatus("Demo state reset.");
    pushCliLog("SYS", "Demo state cleared.");
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
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [changeTheme, resetExperience, startTour]);

  return (
    <main className="landing-wrapper">
      <a className="skip-link" href="#content">
        Skip to main content
      </a>

      <div className="content-column">
        {/* HEADER */}
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
          {/* HERO */}
          <section id="top" className="hero-section">
            <div className="hero-container">
              <h1 className="hero-title">
                Contextual Product Tours &amp;{" "}
                <span className="hero-gradient-text">Onboarding for React</span>
              </h1>

              <p className="hero-subtitle">
                Lightweight React components for element spotlight tours and persisted onboarding checklists.
                Powered by Popper.js, keyboard focus traps, and CSS custom property themes.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn btn--primary"
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
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="hero-stats">
                <span className="hero-stat">
                  <span className="hero-stat-symbol">&lt;</span>8kB gzipped
                </span>
                <span className="hero-stat-divider" />
                <span className="hero-stat">
                  <span className="hero-stat-symbol">~</span> MIT License
                </span>
                <span className="hero-stat-divider" />
                <span className="hero-stat">
                  <span className="hero-stat-symbol">^</span> React 16+
                </span>
                <span className="hero-stat-divider" />
                <span className="hero-stat">
                  <span className="hero-stat-symbol">@</span> Popper.js v2
                </span>
              </div>
            </div>
          </section>

          {/* QUICKSTART + API */}
          <section id="quickstart" className="quickstart-section" tabIndex={-1}>
            <div className="quickstart-container">
              <div className="section-header">
                <span className="section-kicker">GETTING STARTED</span>
                <h2>Type-Safe React API</h2>
                <p>
                  Import <code>GuideLoop</code> and start building contextual tours in minutes.
                </p>
              </div>

              <div className="quickstart-grid">
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
                      {integrationCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{integrationCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre tabIndex={0} aria-label="GuideLoop integration example">
                    <code>{integrationCode}</code>
                  </pre>
                </div>

                <div className="api-reference">
                  <div className="api-group">
                    <span className="api-group-label">Components</span>
                    <div className="api-item">
                      <span className="api-item-symbol">&gt;</span>
                      <div className="api-item-content">
                        <span className="api-item-name">GuideLoop</span>
                        <span className="api-item-desc">Main tour orchestrator. Accepts steps[], isOpen, theme, keyboard.</span>
                      </div>
                    </div>
                    <div className="api-item">
                      <span className="api-item-symbol">&gt;</span>
                      <div className="api-item-content">
                        <span className="api-item-name">OnboardingChecklist</span>
                        <span className="api-item-desc">Persisted task list with tour, modal, link, and custom actions.</span>
                      </div>
                    </div>
                  </div>

                  <div className="api-group">
                    <span className="api-group-label">Types</span>
                    <div className="api-item">
                      <span className="api-item-symbol">:</span>
                      <div className="api-item-content">
                        <span className="api-item-name">Step</span>
                        <span className="api-item-desc">target, title, content, placement, onBeforeStep, onAfterStep</span>
                      </div>
                    </div>
                    <div className="api-item">
                      <span className="api-item-symbol">:</span>
                      <div className="api-item-content">
                        <span className="api-item-name">ThemeConfig</span>
                        <span className="api-item-desc">tooltip, overlay, spotlight, buttons \u2014 full visual control.</span>
                      </div>
                    </div>
                  </div>

                  <div className="api-group">
                    <span className="api-group-label">Features</span>
                    <div className="api-item">
                      <span className="api-item-symbol">*</span>
                      <div className="api-item-content">
                        <span className="api-item-name">Spotlight &amp; Overlay</span>
                        <span className="api-item-desc">Popper.js positioning, SVG mask, focus trap, scroll alignment.</span>
                      </div>
                    </div>
                    <div className="api-item">
                      <span className="api-item-symbol">*</span>
                      <div className="api-item-content">
                        <span className="api-item-name">Persistence</span>
                        <span className="api-item-desc">localStorage-backed completion state with custom keys.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INLINE DEMO */}
          <section id="demo" className="demo-section" tabIndex={-1}>
            <div className="demo-container">
              <div className="demo-window">
                <div className="demo-topbar">
                  <div className="demo-topbar-left">
                    <GuideLoopLogo className="h-5 w-auto" />
                    <span className="demo-topbar-title">Spotlight Sandbox</span>
                    <span className="demo-topbar-badge">Live</span>
                  </div>
                  <div className="demo-topbar-right">
                    <span className="demo-status-dot" />
                    <span className="demo-status-text">{demoStatus}</span>
                  </div>
                </div>

                <div className="demo-body">
                  <div className="demo-row demo-row--full">
                    <div className="demo-card demo-card--wide">
                      <div className="demo-card-head">
                        <span className="demo-card-label">
                          <Search className="w-3.5 h-3.5" />
                          Search &amp; Filters
                        </span>
                        <span className="demo-card-tag">target 1 &amp; 2</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div id="demo-search" className="demo-search" style={{ flex: 1, minWidth: 200 }}>
                          <Search className="w-3.5 h-3.5" style={{ opacity: 0.5, flexShrink: 0 }} />
                          <input
                            type="text"
                            value={demoQuery}
                            onChange={(e) => setDemoQuery(e.target.value)}
                            placeholder="Search components..."
                          />
                          <kbd>\u2318K</kbd>
                        </div>
                        <div className="demo-filters">
                          <button type="button" className="demo-filter is-active">All</button>
                          <button type="button" className="demo-filter">Guides</button>
                          <button type="button" className="demo-filter">Checklists</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="demo-row">
                    <div className="demo-card">
                      <div className="demo-card-head">
                        <span className="demo-card-label">
                          <Timeline className="w-3.5 h-3.5" />
                          Metrics
                        </span>
                        <span className="demo-card-tag">target 3</span>
                      </div>
                      <div id="demo-metrics" className="demo-metrics">
                        <div className="demo-metric">
                          <span className="demo-metric-label">Readiness</span>
                          <span className="demo-metric-value">88%</span>
                          <div className="demo-metric-bar"><span style={{ width: "88%" }} /></div>
                        </div>
                        <div className="demo-metric">
                          <span className="demo-metric-label">Latency</span>
                          <span className="demo-metric-value">12ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="demo-card">
                      <div className="demo-card-head">
                        <span className="demo-card-label">
                          <Bell className="w-3.5 h-3.5" />
                          Activity
                        </span>
                        <span className="demo-card-tag">target 4</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <button
                          id="demo-notifications"
                          type="button"
                          className="demo-trigger"
                          onClick={() => setShowActivity((p) => !p)}
                          style={{ position: "relative" }}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: "50%", background: "#f43f5e" }} />
                        </button>
                        <div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-ink, #fff)" }}>Notifications</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-ink-muted, #94a3b8)" }}>Click bell to toggle</div>
                        </div>
                      </div>
                      {showActivity && (
                        <div style={{ marginTop: "0.65rem", padding: "0.65rem", background: "var(--color-canvas, #090d16)", border: "1px solid var(--color-line-strong, rgba(255,255,255,0.15))", borderRadius: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--color-ink, #fff)" }}>
                            <span>Recent Events</span><span style={{ color: "#10b981" }}>Live</span>
                          </div>
                          <div style={{ color: "var(--color-ink-muted, #94a3b8)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                            Spotlight bounds calculated.
                          </div>
                          <div style={{ color: "var(--color-ink-muted, #94a3b8)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#64748b", flexShrink: 0 }} />
                            Focus trapped within dialog.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="demo-controls">
                    <button type="button" className="demo-trigger demo-trigger--primary" onClick={startTour}>
                      <Sparkles className="w-3.5 h-3.5" />
                      Run Tour [T]
                    </button>
                    <button type="button" className="demo-trigger" onClick={() => triggerTarget("#demo-search")}>
                      <Search className="w-3.5 h-3.5" />
                      Target Search
                    </button>
                    <button type="button" className="demo-trigger" onClick={() => triggerTarget("#demo-metrics")}>
                      <Timeline className="w-3.5 h-3.5" />
                      Target Metrics
                    </button>
                    <button type="button" className="demo-trigger" onClick={() => triggerTarget("#demo-notifications")}>
                      <Bell className="w-3.5 h-3.5" />
                      Target Bell
                    </button>
                    <button type="button" className="demo-trigger" onClick={resetExperience} title="Reset [R]">
                      Reset
                    </button>
                  </div>

                  <div className="console-drawer">
                    <button
                      type="button"
                      className="console-toggle"
                      onClick={() => setShowConsole((p) => !p)}
                    >
                      <span>&gt; Event Stream ({cliLogs.length})</span>
                      <span>{showConsole ? "\u25BC Hide" : "\u25B2 View"}</span>
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
              <span>&copy; 2026 GuideLoop</span>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </footer>
      </div>

      {/* GUIDELOOP INSTANCE */}
      <GuideLoop
        steps={tourSteps}
        isOpen={tourOpen}
        initialStep={initialStepIndex}
        onClose={() => {
          setTourOpen(false);
          setDemoStatus("Tour closed.");
          pushCliLog("TOUR", "Tour modal closed by user.");
        }}
        onStepChange={(stepIndex) => {
          const step = tourSteps[stepIndex];
          if (step) {
            pushCliLog(
              "TOUR",
              `Focused step ${stepIndex + 1}/3: ${step.target} ("${step.title}")`,
            );
          }
        }}
        onSkip={() => {
          setDemoStatus("Tour skipped.");
          pushCliLog("TOUR", "Tour skipped by user.");
        }}
        onComplete={() => {
          setTourOpen(false);
          setDemoStatus("Tour finished.");
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
