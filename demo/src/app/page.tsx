"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Check,
  Copy,
  GuideLoopLogo,
} from "../components/DemoIcons";
import { AsciiLogoShader } from "../components/AsciiLogoShader";
import "./landing.css";

const GITHUB_URL = "https://github.com/oznksc/guideloop";
const NPM_URL = "https://www.npmjs.com/package/guideloop";
const INSTALL_COMMAND = "npm install guideloop";

type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";

interface DemoThemePreset {
  id: DemoThemeId;
  name: string;
  icon: string;
}

const DEMO_THEMES: Record<DemoThemeId, DemoThemePreset> = {
  slate: { id: "slate", name: "Guide Blue", icon: "\u25CF" },
  editorial: { id: "editorial", name: "Editorial Craft", icon: "\uD83D\uDCDC" },
  terminal: { id: "terminal", name: "Terminal CLI", icon: "\uD83D\uDCDF" },
  nordic: { id: "nordic", name: "Nordic Frost", icon: "\uD83D\uDC8E" },
};

const integrationCode = `import { useState } from "react";
import { GuideLoop, type Step } from "guideloop";

const steps: Step[] = [{
  target: "#search-bar",
  title: "Search",
  content: "Bind any CSS selector."
}];

export function App() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Start</button>
      <GuideLoop steps={steps} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}`;

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState<DemoThemeId>("slate");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [integrationCopied, setIntegrationCopied] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const themeListId = useId();

  const applyThemeToDocument = useCallback((themeId: DemoThemeId) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", themeId);
    const scheme =
      themeId === "editorial" || themeId === "nordic" ? "light" : "dark";
    root.style.colorScheme = scheme;
  }, []);

  const changeTheme = useCallback(
    (themeId: DemoThemeId) => {
      setCurrentTheme(themeId);
      applyThemeToDocument(themeId);
      setThemeMenuOpen(false);
    },
    [applyThemeToDocument],
  );

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme, applyThemeToDocument]);

  useEffect(() => {
    if (!themeMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const root = themeMenuRef.current;
      if (root && !root.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [themeMenuOpen]);

  const copyInstallCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  const copyIntegrationCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(integrationCode);
      setIntegrationCopied(true);
      window.setTimeout(() => setIntegrationCopied(false), 1800);
    } catch {
      setIntegrationCopied(false);
    }
  }, []);

  const activeTheme = DEMO_THEMES[currentTheme];

  return (
    <main className="landing-wrapper">
      <a className="skip-link" href="#content">
        Skip to main content
      </a>

      <div className="content-column">
        <header className="site-header">
          <div className="header-inner">
            <a className="site-brand" href="#top" aria-label="GuideLoop home">
              <GuideLoopLogo className="brand-logo" />
              <span className="brand-badge">v1.4.0</span>
            </a>

            <div className="header-actions">
              <div className="theme-dropdown" ref={themeMenuRef}>
                <button
                  type="button"
                  className="btn btn--ghost theme-dropdown-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={themeMenuOpen}
                  aria-controls={themeListId}
                  onClick={() => setThemeMenuOpen((open) => !open)}
                >
                  <span className="theme-dropdown-icon" aria-hidden="true">
                    {activeTheme.icon}
                  </span>
                  <span className="theme-dropdown-label">
                    {activeTheme.name.split(" ")[0]}
                  </span>
                  <span className="theme-dropdown-caret" aria-hidden="true">
                    {themeMenuOpen ? "\u25B2" : "\u25BC"}
                  </span>
                </button>

                {themeMenuOpen ? (
                  <ul
                    id={themeListId}
                    className="theme-dropdown-menu"
                    role="listbox"
                    aria-label="Page theme"
                  >
                    {(Object.keys(DEMO_THEMES) as DemoThemeId[]).map((id) => {
                      const theme = DEMO_THEMES[id];
                      const selected = currentTheme === id;
                      return (
                        <li key={id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`theme-dropdown-item${selected ? " is-active" : ""}`}
                            onClick={() => changeTheme(id)}
                          >
                            <span aria-hidden="true">{theme.icon}</span>
                            <span>{theme.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        <div id="content" tabIndex={-1}>
          <section id="top" className="hero-section">
            <div className="hero-container">
              <h1 className="hero-title">
                <span className="hero-title-line">Contextual Product Tours &amp;</span>
                <span className="hero-title-line hero-gradient-text">
                  Onboarding for React
                </span>
              </h1>

              <p className="hero-subtitle">
                Lightweight React components for element spotlight tours and
                persisted onboarding checklists. Popper.js positioning, keyboard
                focus traps, CSS custom property themes.
              </p>

              <div className="hero-cta-group">
                <div className="install-command-pill">
                  <code>$ npm i guideloop</code>
                  <button
                    type="button"
                    onClick={() => void copyInstallCommand()}
                    title="Copy install command"
                    aria-label="Copy install command"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
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
            </div>
          </section>

          <section id="quickstart" className="quickstart-section" tabIndex={-1}>
            <div className="quickstart-container">
              <div className="section-header">
                <span className="section-kicker">GETTING STARTED</span>
                <h2>Type-Safe React API</h2>
                <p>
                  Import <code>GuideLoop</code> — tours in a few lines.
                </p>
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
                    {integrationCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>{integrationCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre tabIndex={0} aria-label="GuideLoop integration example">
                  <code>{integrationCode}</code>
                </pre>
              </div>
            </div>
          </section>
        </div>

        <footer className="site-footer">
          <div className="footer-shader-stage" aria-hidden="true">
            <AsciiLogoShader className="footer-ascii-shader" />
          </div>

          <div className="footer-bar">
            <p className="footer-tagline">
              Type-safe React tours, spotlights &amp; onboarding.
            </p>
            <nav className="footer-nav" aria-label="Footer">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={NPM_URL} target="_blank" rel="noreferrer">
                npm
              </a>
              <span>MIT</span>
              <span className="footer-copy">&copy; 2026</span>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
