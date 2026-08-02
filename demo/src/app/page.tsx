"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Check,
  Copy,
  GuideLoopLogo,
} from "../components/DemoIcons";
import { AsciiLogoShader } from "../components/AsciiLogoShader";
import { HeroSpotlightDemo } from "../components/HeroSpotlightDemo";
import "./landing.css";

const GITHUB_URL = "https://github.com/oznksc/guideloop";
const NPM_REACT = "https://www.npmjs.com/package/@guideloop/react";
const NPM_SVELTE = "https://www.npmjs.com/package/@guideloop/svelte";
const NPM_VANILLA = "https://www.npmjs.com/package/@guideloop/vanilla";
type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";
type StackId = "react" | "svelte" | "vanilla" | "webcomponent";

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

const STACK_CARDS: {
  id: StackId;
  label: string;
  packageName: string;
  file: string;
  install: string;
  code: string;
  npmUrl: string;
}[] = [
  {
    id: "react",
    label: "React",
    packageName: "@guideloop/react",
    file: "App.tsx",
    install: "npm i @guideloop/react",
    npmUrl: NPM_REACT,
    code: `import { useState } from "react";
import { GuideLoop, type Step } from "@guideloop/react";

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
      <GuideLoop
        steps={steps}
        isOpen={open}
        onClose={() => setOpen(false)}
        theme="tailwind"
      />
    </>
  );
}`,
  },
  {
    id: "svelte",
    label: "Svelte",
    packageName: "@guideloop/svelte",
    file: "App.svelte",
    install: "npm i @guideloop/svelte",
    npmUrl: NPM_SVELTE,
    code: `<script lang="ts">
  import { GuideLoop } from "@guideloop/svelte";
  import type { Step } from "@guideloop/svelte";

  let open = false;
  const steps: Step[] = [{
    target: "#search-bar",
    title: "Search",
    content: "Bind any CSS selector."
  }];
</script>

<button on:click={() => (open = true)}>Start</button>
<GuideLoop
  steps={steps}
  bind:isOpen={open}
  theme="tailwind"
  on:complete={() => console.log("done")}
/>`,
  },
  {
    id: "vanilla",
    label: "Vanilla JS",
    packageName: "@guideloop/vanilla",
    file: "tour.js",
    install: "npm i @guideloop/vanilla",
    npmUrl: NPM_VANILLA,
    code: `import { GuideLoop } from "@guideloop/vanilla";

const tour = new GuideLoop({
  steps: [{
    target: "#search-bar",
    title: "Search",
    content: "Bind any CSS selector.",
    placement: "bottom",
  }],
  theme: "tailwind",
  keyboard: true,
  onComplete: () => console.log("done"),
});

await tour.start();
// tour.next() · tour.prev() · tour.skip() · tour.close()`,
  },
  {
    id: "webcomponent",
    label: "Web Component",
    packageName: "@guideloop/vanilla",
    file: "index.html",
    install: "npm i @guideloop/vanilla",
    npmUrl: NPM_VANILLA,
    code: `<script type="module">
  import "@guideloop/vanilla/web-component";
</script>

<guide-loop
  id="tour"
  theme="tailwind"
  steps='[
    {"target":"#search-bar","title":"Search","content":"Any stack."}
  ]'
></guide-loop>

<script>
  document.getElementById("tour").open();
</script>`,
  },
];

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState<DemoThemeId>("slate");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<StackId | null>(null);
  const [copiedHeroInstall, setCopiedHeroInstall] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
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
      if (event.key === "Escape") setThemeMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [themeMenuOpen]);

  const copyText = useCallback(async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
    } catch {
      /* ignore */
    }
  }, []);

  const scrollCarousel = useCallback((dir: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".stack-card");
    const delta = (card?.offsetWidth ?? 320) + 12;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
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
              <span className="brand-badge">v2.0</span>
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
            <HeroSpotlightDemo />
            <div className="hero-container">
              <div className="hero-intro" data-hero-spot="intro">
                <h1 className="hero-title">
                  <span className="hero-title-line">
                    Contextual Product Tours &amp;
                  </span>
                  <span className="hero-title-line hero-gradient-text">
                    Onboarding for any stack
                  </span>
                </h1>

                <p className="hero-subtitle">
                  Spotlight tours and onboarding checklists for{" "}
                  <strong>React</strong> or plain <strong>Vanilla JS</strong> —
                  same core, themes, keyboard traps, and multi-page persist. Use
                  components, an imperative API, or{" "}
                  <code className="hero-inline-code">&lt;guide-loop&gt;</code>.
                </p>
              </div>

              <div className="hero-cta-group">
                <div className="install-command-pill" data-hero-spot="install">
                  <code>$ npm i @guideloop/react</code>
                  <button
                    type="button"
                    onClick={() =>
                      void copyText("npm i @guideloop/react", () => {
                        setCopiedHeroInstall(true);
                        window.setTimeout(() => setCopiedHeroInstall(false), 1600);
                      })
                    }
                    title="Copy install command"
                    aria-label="Copy React install command"
                  >
                    {copiedHeroInstall ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="hero-stats" data-hero-spot="stats">
                  <span className="hero-stat">
                    <span className="hero-stat-symbol">&lt;</span>gzip friendly
                  </span>
                  <span className="hero-stat-divider" />
                  <span className="hero-stat">
                    <span className="hero-stat-symbol">~</span> MIT
                  </span>
                  <span className="hero-stat-divider" />
                  <span className="hero-stat">
                    <span className="hero-stat-symbol">^</span> React 16+ · JS
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
              <div className="section-header section-header--row">
                <div>
                  <span className="section-kicker">GETTING STARTED</span>
                  <h2>Same tour model · every stack</h2>
                  <p>Pick your stack — scroll the carousel on smaller screens.</p>
                </div>
                <div className="carousel-nav" aria-label="Carousel controls">
                  <button
                    type="button"
                    className="carousel-nav-btn"
                    onClick={() => scrollCarousel(-1)}
                    aria-label="Previous stack card"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="carousel-nav-btn"
                    onClick={() => scrollCarousel(1)}
                    aria-label="Next stack card"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div
                className="stack-carousel"
                ref={carouselRef}
                tabIndex={0}
                aria-label="Stack quick starts"
              >
                {STACK_CARDS.map((card) => (
                  <article key={card.id} className="stack-card">
                    <a
                      className="npm-badge stack-card-badge"
                      href={card.npmUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={`${card.packageName} on npm`}
                    >
                      <span className="npm-badge-label">npm</span>
                      <span className="npm-badge-value">{card.packageName}</span>
                    </a>

                    <div className="code-window stack-card-code">
                      <div className="code-header">
                        <div className="code-dots">
                          <span className="dot dot--red" />
                          <span className="dot dot--yellow" />
                          <span className="dot dot--green" />
                        </div>
                        <span className="code-filename">{card.file}</span>
                        <button
                          type="button"
                          className="code-copy-btn"
                          onClick={() =>
                            void copyText(card.code, () => {
                              setCopiedCode(card.id);
                              window.setTimeout(() => setCopiedCode(null), 1600);
                            })
                          }
                          aria-label={`Copy ${card.label} example`}
                        >
                          {copiedCode === card.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span>
                            {copiedCode === card.id ? "Copied" : "Copy"}
                          </span>
                        </button>
                      </div>
                      <pre tabIndex={0} aria-label={`${card.label} example`}>
                        <code>{card.code}</code>
                      </pre>
                    </div>
                  </article>
                ))}
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
              Tours for React, Vanilla JS &amp; Web Components.
            </p>
            <nav className="footer-nav" aria-label="Footer">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={NPM_REACT} target="_blank" rel="noreferrer">
                react
              </a>
              <a href={NPM_SVELTE} target="_blank" rel="noreferrer">
                svelte
              </a>
              <a href={NPM_VANILLA} target="_blank" rel="noreferrer">
                vanilla
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
