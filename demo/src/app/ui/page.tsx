"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GuideLoopLogo,
  CaretDown,
  CaretUp,
  Github,
  ThemeSlateIcon,
  ThemeEditorialIcon,
  ThemeTerminalIcon,
  ThemeNordicIcon,
} from "../../components/DemoIcons";
import "../landing.css";
import "./ui-show.css";

type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";

const DEMO_THEMES = {
  slate: { id: "slate", name: "Guide Blue", Icon: ThemeSlateIcon },
  editorial: { id: "editorial", name: "Editorial Craft", Icon: ThemeEditorialIcon },
  terminal: { id: "terminal", name: "Terminal CLI", Icon: ThemeTerminalIcon },
  nordic: { id: "nordic", name: "Nordic Frost", Icon: ThemeNordicIcon },
} as const;

export default function UIShowcase() {
  const [currentTheme, setCurrentTheme] = useState<DemoThemeId>("slate");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const activeTheme = DEMO_THEMES[currentTheme];
  const ActiveThemeIcon = activeTheme.Icon;

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
    [applyThemeToDocument]
  );

  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme, applyThemeToDocument]);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [themeMenuOpen]);

  return (
    <main className="landing-wrapper">
      <div className="content-column">
        {/* Landing Shell Header */}
        <header className="site-header">
          <div className="header-inner">
            <a className="site-brand" href="/" aria-label="GuideLoop home">
              <GuideLoopLogo className="brand-logo" />
              <span className="brand-badge">UI Kit</span>
            </a>

            <div className="header-actions">
              <div className="theme-dropdown" ref={themeMenuRef}>
                <button
                  type="button"
                  className="btn btn--ghost theme-dropdown-trigger"
                  aria-label={`Theme: ${activeTheme.name}`}
                  onClick={() => setThemeMenuOpen((open) => !open)}
                >
                  <ActiveThemeIcon className="theme-dropdown-icon" />
                  <span className="theme-dropdown-caret">
                    {themeMenuOpen ? <CaretUp className="theme-dropdown-caret-svg" /> : <CaretDown className="theme-dropdown-caret-svg" />}
                  </span>
                </button>

                {themeMenuOpen ? (
                  <ul className="theme-dropdown-menu" role="listbox">
                    {(Object.keys(DEMO_THEMES) as DemoThemeId[]).map((id) => {
                      const theme = DEMO_THEMES[id];
                      const selected = currentTheme === id;
                      const ThemeIcon = theme.Icon;
                      return (
                        <li key={id} role="presentation">
                          <button
                            type="button"
                            className={`theme-dropdown-item${selected ? " is-active" : ""}`}
                            onClick={() => changeTheme(id)}
                          >
                            <ThemeIcon className="theme-dropdown-item-icon" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <a
                href="https://github.com/oznksc/guideloop"
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--icon"
                aria-label="GitHub repository"
                title="GitHub"
              >
                <Github className="header-github-icon" />
              </a>
            </div>
          </div>
        </header>

        <div className="ui-showcase-content">
          <div className="stack-explorer">
            <div className="stack-tabs" role="tablist" aria-label="UI Showcase Navigation">
              <a
                href="/"
                className="stack-tab stack-tab--back-link"
                title="Back to Landing Page"
                aria-label="Back to Landing Page"
              >
                <span className="stack-tab-back-arrow" aria-hidden="true">&larr;</span>
                <span className="stack-tab-label">Landing</span>
              </a>
              <div className="stack-tab is-active" title="UI Kit Showcase">
                <span className="stack-tab-ui-dot" aria-hidden="true" />
                <span className="stack-tab-label">UI Kit</span>
              </div>
            </div>

            <div className="stack-panel">
              <header className="ui-showcase__header">
                <h1 className="ui-showcase__title">UI Components</h1>
                <p className="ui-showcase__subtitle">
                  Static showcase of GuideLoop's visual elements — buttons, cards, progress, and more.
                </p>
              </header>

      {/* Buttons Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Buttons</h2>
        <p className="ui-section__description">
          Primary and secondary button styles across themes.
        </p>

        <div className="ui-card-grid">
          <div className="ui-card">
            <h3 className="ui-card__title">Tailwind Theme</h3>
            <div className="ui-button-row">
              <button className="gl-btn gl-btn--primary gl-btn--tailwind">Next</button>
              <button className="gl-btn gl-btn--secondary gl-btn--tailwind">Previous</button>
              <button className="gl-btn gl-btn--ghost gl-btn--tailwind">Skip</button>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Material Theme</h3>
            <div className="ui-button-row">
              <button className="gl-btn gl-btn--primary gl-btn--material">Next</button>
              <button className="gl-btn gl-btn--secondary gl-btn--material">Previous</button>
              <button className="gl-btn gl-btn--ghost gl-btn--material">Skip</button>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Ant Design Theme</h3>
            <div className="ui-button-row">
              <button className="gl-btn gl-btn--primary gl-btn--antd">Next</button>
              <button className="gl-btn gl-btn--secondary gl-btn--antd">Default</button>
              <button className="gl-btn gl-btn--ghost gl-btn--antd">Cancel</button>
            </div>
          </div>
        </div>
      </section>

      {/* Tooltip Cards Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Tooltip Cards</h2>
        <p className="ui-section__description">
          Static tooltip popovers with step content and navigation.
        </p>

        <div className="ui-card-grid">
          {/* Tailwind Tooltip */}
          <div className="gl-tooltip gl-tooltip--tailwind">
            <div className="gl-tooltip__step">Step 1 of 3</div>
            <div className="gl-tooltip__body">
              <h3 className="gl-tooltip__title">Welcome to GuideLoop</h3>
              <p className="gl-tooltip__content">
                A zero-config guided tour library for React. Spotlight any element
                and walk users through your app.
              </p>
            </div>
            <div className="gl-toolbar gl-toolbar--tailwind">
              <button className="gl-btn gl-btn--ghost gl-btn--tailwind">Skip</button>
              <button className="gl-btn gl-btn--primary gl-btn--tailwind">Next</button>
            </div>
          </div>

          {/* Material Tooltip */}
          <div className="gl-tooltip gl-tooltip--material">
            <div className="gl-tooltip__step">Step 2 of 4</div>
            <div className="gl-tooltip__body">
              <h3 className="gl-tooltip__title">Keyboard Navigation</h3>
              <p className="gl-tooltip__content">
                Arrow keys move between steps. Press Escape to close the tour at any time.
              </p>
            </div>
            <div className="gl-toolbar gl-toolbar--material">
              <div className="gl-toolbar__left">
                <button className="gl-btn gl-btn--secondary gl-btn--material">Previous</button>
              </div>
              <div className="gl-toolbar__right">
                <button className="gl-btn gl-btn--ghost gl-btn--material">Skip</button>
                <button className="gl-btn gl-btn--primary gl-btn--material">Next</button>
              </div>
            </div>
          </div>

          {/* Ant Design Tooltip */}
          <div className="gl-tooltip gl-tooltip--antd">
            <div className="gl-tooltip__step">Step 3 of 5</div>
            <div className="gl-tooltip__body">
              <h3 className="gl-tooltip__title">Custom Theme</h3>
              <p className="gl-tooltip__content">
                Override any visual aspect with a custom theme configuration.
              </p>
            </div>
            <div className="gl-toolbar gl-toolbar--antd">
              <div className="gl-toolbar__left">
                <button className="gl-btn gl-btn--secondary gl-btn--antd">Previous</button>
              </div>
              <div className="gl-toolbar__right">
                <button className="gl-btn gl-btn--ghost gl-btn--antd">Skip</button>
                <button className="gl-btn gl-btn--primary gl-btn--antd">Finish</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Progress Indicators</h2>
        <p className="ui-section__description">
          Step progress dots shown at the bottom of the tour.
        </p>

        <div className="ui-card-grid">
          <div className="ui-card">
            <h3 className="ui-card__title">Step 1 of 4</h3>
            <div className="gl-progress">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <h3 className="ui-card__title">Step 2 of 4</h3>
            <div className="gl-progress">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <h3 className="ui-card__title">Step 3 of 4</h3>
            <div className="gl-progress">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <h3 className="ui-card__title">Step 4 of 4</h3>
            <div className="gl-progress">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
            </div>
          </div>
        </div>

        <h3 className="ui-card__title ui-card__title--spaced">Material Theme</h3>
        <div className="ui-card-grid">
          <div className="ui-card">
            <div className="gl-progress gl-progress--material">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <div className="gl-progress gl-progress--material">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <div className="gl-progress gl-progress--material">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
            </div>
          </div>
        </div>

        <h3 className="ui-card__title ui-card__title--spaced">Ant Design Theme</h3>
        <div className="ui-card-grid">
          <div className="ui-card">
            <div className="gl-progress gl-progress--antd">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <div className="gl-progress gl-progress--antd">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot" />
              <div className="gl-progress__dot" />
            </div>
          </div>
          <div className="ui-card">
            <div className="gl-progress gl-progress--antd">
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
              <div className="gl-progress__dot gl-progress__dot--active" />
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Spotlight</h2>
        <p className="ui-section__description">
          Target highlight rings in different shapes and themes.
        </p>

        <div className="ui-card-grid">
          <div className="ui-card">
            <h3 className="ui-card__title">Rectangle — Tailwind</h3>
            <div className="gl-spotlight-demo">
              <div className="gl-spotlight-ring gl-spotlight-ring--rect gl-spotlight-ring--tailwind" />
              <div className="gl-spotlight-target">Target Element</div>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Circle — Material</h3>
            <div className="gl-spotlight-demo">
              <div className="gl-spotlight-ring gl-spotlight-ring--circle gl-spotlight-ring--material" />
              <div className="gl-spotlight-target gl-spotlight-target--circle">Icon</div>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Ellipse — Ant Design</h3>
            <div className="gl-spotlight-demo">
              <div className="gl-spotlight-ring gl-spotlight-ring--ellipse gl-spotlight-ring--antd" />
              <div className="gl-spotlight-target gl-spotlight-target--pill">Pill Button</div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Checklist Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Onboarding Checklist</h2>
        <p className="ui-section__description">
          Collapsible task list with progress tracking.
        </p>

        <div className="ui-card-grid ui-card-grid--wide">
          <div className="ui-card">
            <h3 className="ui-card__title">Tailwind Theme</h3>
            <div className="gl-onboarding">
              <div className="gl-onboarding__header">
                <div>
                  <h4 className="gl-onboarding__title">Getting Started</h4>
                  <p className="gl-onboarding__subtitle">Complete these steps to set up GuideLoop</p>
                  <span className="gl-onboarding__progress-text">2/5 steps completed</span>
                </div>
              </div>
              <div className="gl-onboarding__track">
                <div className="gl-onboarding__fill" style={{ width: "40%" }} />
              </div>
              <ul className="gl-onboarding__list">
                <li className="gl-onboarding__item gl-onboarding__item--done">
                  <span className="gl-onboarding__check">&#10003;</span>
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Install the package</span>
                    <span className="gl-onboarding__item-desc">npm i @guideloop/react</span>
                  </div>
                </li>
                <li className="gl-onboarding__item gl-onboarding__item--done">
                  <span className="gl-onboarding__check">&#10003;</span>
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Import GuideLoop</span>
                    <span className="gl-onboarding__item-desc">Add the component to your app</span>
                  </div>
                </li>
                <li className="gl-onboarding__item gl-onboarding__item--active">
                  <span className="gl-onboarding__check gl-onboarding__check--empty" />
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Define your steps</span>
                    <span className="gl-onboarding__item-desc">Target any CSS selector</span>
                  </div>
                </li>
                <li className="gl-onboarding__item">
                  <span className="gl-onboarding__check gl-onboarding__check--empty" />
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Pick a theme</span>
                    <span className="gl-onboarding__item-desc">tailwind · material · antd</span>
                  </div>
                </li>
                <li className="gl-onboarding__item">
                  <span className="gl-onboarding__check gl-onboarding__check--empty" />
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Launch the tour</span>
                    <span className="gl-onboarding__item-desc">Set isOpen to true</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Material Theme</h3>
            <div className="gl-onboarding gl-onboarding--material">
              <div className="gl-onboarding__header">
                <div>
                  <h4 className="gl-onboarding__title">Quick Setup</h4>
                  <p className="gl-onboarding__subtitle">Essential steps</p>
                  <span className="gl-onboarding__progress-text">1/3 steps completed</span>
                </div>
              </div>
              <div className="gl-onboarding__track">
                <div className="gl-onboarding__fill gl-onboarding__fill--material" style={{ width: "33%" }} />
              </div>
              <ul className="gl-onboarding__list">
                <li className="gl-onboarding__item gl-onboarding__item--done">
                  <span className="gl-onboarding__check gl-onboarding__check--material">&#10003;</span>
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Install package</span>
                    <span className="gl-onboarding__item-desc">npm i @guideloop/react</span>
                  </div>
                </li>
                <li className="gl-onboarding__item gl-onboarding__item--active">
                  <span className="gl-onboarding__check gl-onboarding__check--material gl-onboarding__check--empty" />
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Define steps</span>
                    <span className="gl-onboarding__item-desc">Create your Step[]</span>
                  </div>
                </li>
                <li className="gl-onboarding__item">
                  <span className="gl-onboarding__check gl-onboarding__check--material gl-onboarding__check--empty" />
                  <div className="gl-onboarding__item-text">
                    <span className="gl-onboarding__item-title">Start tour</span>
                    <span className="gl-onboarding__item-desc">Render &lt;GuideLoop /&gt;</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Colors Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Theme Colors</h2>
        <p className="ui-section__description">
          Primary accent colors across the built-in themes.
        </p>

        <div className="ui-card-grid">
          <div className="ui-card">
            <h3 className="ui-card__title">Tailwind</h3>
            <div className="color-swatch-row">
              <div className="color-swatch" style={{ background: "#2563eb" }}>
                <span>Primary</span>
              </div>
              <div className="color-swatch" style={{ background: "#1D4ED8" }}>
                <span>Hover</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "#F3F4F6" }}>
                <span>Bg</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "#1F2937" }}>
                <span>Text</span>
              </div>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Material</h3>
            <div className="color-swatch-row">
              <div className="color-swatch" style={{ background: "#1976D2" }}>
                <span>Primary</span>
              </div>
              <div className="color-swatch" style={{ background: "#1565C0" }}>
                <span>Hover</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "rgba(0,0,0,0.04)" }}>
                <span>Bg</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "rgba(0,0,0,0.87)" }}>
                <span>Text</span>
              </div>
            </div>
          </div>

          <div className="ui-card">
            <h3 className="ui-card__title">Ant Design</h3>
            <div className="color-swatch-row">
              <div className="color-swatch" style={{ background: "#1890ff" }}>
                <span>Primary</span>
              </div>
              <div className="color-swatch" style={{ background: "#40a9ff" }}>
                <span>Hover</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "#fafafa" }}>
                <span>Bg</span>
              </div>
              <div className="color-swatch color-swatch--light" style={{ background: "rgba(0,0,0,0.85)" }}>
                <span>Text</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Steps Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Tour Configuration</h2>
        <p className="ui-section__description">
          Example step definitions for a typical product tour.
        </p>

        <div className="ui-card">
          <div className="code-window">
            <div className="code-header">
              <div className="code-dots">
                <span className="dot dot--red" />
                <span className="dot dot--yellow" />
                <span className="dot dot--green" />
              </div>
              <span className="code-filename">steps.ts</span>
            </div>
            <pre className="code-block">
              <code>{`const steps: Step[] = [
  {
    target: "#search-bar",
    title: "Search",
    content: "Find anything instantly.",
    placement: "bottom",
  },
  {
    target: "#user-menu",
    title: "Your Profile",
    content: "Manage settings and preferences.",
    placement: "right",
  },
  {
    target: "#notifications",
    title: "Notifications",
    content: "Stay up to date with activity.",
    placement: "left",
  },
];`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Overlay Section */}
      <section className="ui-section">
        <h2 className="ui-section__title">Overlay</h2>
        <p className="ui-section__description">
          Full-page dim overlay with cutout for the spotlight target.
        </p>

        <div className="ui-card">
          <div className="gl-overlay-demo">
            <div className="gl-overlay-bg" />
            <div className="gl-overlay-cutout" />
            <div className="gl-overlay-label">Target (visible through cutout)</div>
          </div>
        </div>
      </section>

        {/* Footer */}
        <footer className="ui-showcase__footer">
          <a href="/" className="back-link">
            &larr; Back to landing
          </a>
        </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
