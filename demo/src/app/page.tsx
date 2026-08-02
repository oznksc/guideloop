"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
const NPM_VUE = "https://www.npmjs.com/package/@guideloop/vue";
const NPM_SVELTE = "https://www.npmjs.com/package/@guideloop/svelte";
const NPM_ANGULAR = "https://www.npmjs.com/package/@guideloop/angular";
const NPM_VANILLA = "https://www.npmjs.com/package/@guideloop/vanilla";
type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";
type StackId = "react" | "vue" | "svelte" | "angular" | "vanilla" | "webcomponent";

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
  shortLabel: string;
  packageName: string;
  file: string;
  install: string;
  code: string;
  npmUrl: string;
  blurb: string;
  apiHint: string;
  peers: string;
  tags: string[];
}[] = [
  {
    id: "react",
    label: "React",
    shortLabel: "React",
    packageName: "@guideloop/react",
    file: "App.tsx",
    install: "npm i @guideloop/react",
    npmUrl: NPM_REACT,
    blurb:
      "Declarative components and hooks for React 16.8–19. Controlled isOpen, portals, and focus trap out of the box.",
    apiHint: "isOpen · onClose · theme · persist",
    peers: "react ≥16.8",
    tags: ["components", "hooks", "RSC types"],
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
    id: "vue",
    label: "Vue",
    shortLabel: "Vue",
    packageName: "@guideloop/vue",
    file: "App.vue",
    install: "npm i @guideloop/vue",
    npmUrl: NPM_VUE,
    blurb:
      "Vue 3 components with v-model:is-open. Same Step model as every other stack — powered by vanilla under the hood.",
    apiHint: "v-model:is-open · @complete · @step-change",
    peers: "vue ≥3.2",
    tags: ["v-model", "composition", "TS"],
    code: `<script setup lang="ts">
import { ref } from "vue";
import { GuideLoop, type Step } from "@guideloop/vue";

const open = ref(false);
const steps: Step[] = [{
  target: "#search-bar",
  title: "Search",
  content: "Vue 3 v-model:is-open API."
}];
</script>

<template>
  <button @click="open = true">Start</button>
  <GuideLoop
    :steps="steps"
    v-model:is-open="open"
    theme="tailwind"
    @complete="() => console.log('done')"
    @step-change="(step) => console.log(step)"
  />
</template>`,
  },
  {
    id: "svelte",
    label: "Svelte",
    shortLabel: "Svelte",
    packageName: "@guideloop/svelte",
    file: "App.svelte",
    install: "npm i @guideloop/svelte",
    npmUrl: NPM_SVELTE,
    blurb:
      "Idiomatic Svelte bindings with bind:isOpen and event dispatchers. Works with Svelte 3.59+, 4, and 5.",
    apiHint: "bind:isOpen · on:complete · on:stepchange",
    peers: "svelte ≥3.59",
    tags: ["bind:", "events", "stores-ready"],
    code: `<script lang="ts">
  import { GuideLoop } from "@guideloop/svelte";
  import type { Step } from "@guideloop/svelte";

  let open = false;
  const steps: Step[] = [{
    target: "#search-bar",
    title: "Search",
    content: "Svelte-friendly bind:isOpen API."
  }];
</script>

<button on:click={() => (open = true)}>Start</button>

<!-- Idiomatic Svelte: bind open state + events -->
<GuideLoop
  steps={steps}
  bind:isOpen={open}
  theme="tailwind"
  on:complete={() => console.log("done")}
  on:stepchange={({ detail }) => console.log(detail.step)}
/>`,
  },
  {
    id: "angular",
    label: "Angular",
    shortLabel: "Angular",
    packageName: "@guideloop/angular",
    file: "app.component.ts",
    install: "npm i @guideloop/angular",
    npmUrl: NPM_ANGULAR,
    blurb:
      "Standalone Angular components (≥15). Inputs/outputs map cleanly to isOpen, closed, complete, and stepChange.",
    apiHint: "[isOpen] · (closed) · (complete) · (stepChange)",
    peers: "@angular/core ≥15",
    tags: ["standalone", "Ivy", "inputs"],
    code: `import { Component } from "@angular/core";
import { GuideLoopComponent, type Step } from "@guideloop/angular";

@Component({
  standalone: true,
  imports: [GuideLoopComponent],
  template: \`
    <button (click)="open = true">Start</button>
    <guideloop-tour
      [steps]="steps"
      [isOpen]="open"
      theme="tailwind"
      (closed)="open = false"
      (complete)="onDone()"
    />
  \`,
})
export class AppComponent {
  open = false;
  steps: Step[] = [{
    target: "#search-bar",
    title: "Search",
    content: "Angular standalone component API."
  }];
  onDone() { console.log("done"); }
}`,
  },
  {
    id: "vanilla",
    label: "Vanilla JS",
    shortLabel: "Vanilla",
    packageName: "@guideloop/vanilla",
    file: "tour.js",
    install: "npm i @guideloop/vanilla",
    npmUrl: NPM_VANILLA,
    blurb:
      "Imperative API for any stack — no framework required. start / next / prev / skip / close with full theme parity.",
    apiHint: "new GuideLoop() · start() · next() · close()",
    peers: "none",
    tags: ["imperative", "zero-UI-fw", "tree-shake"],
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
    shortLabel: "WC",
    packageName: "@guideloop/vanilla",
    file: "index.html",
    install: "npm i @guideloop/vanilla",
    npmUrl: NPM_VANILLA,
    blurb:
      "Drop-in custom elements for HTML-first apps and CMS embeds. Same engine as the imperative API.",
    apiHint: "<guide-loop> · .open() · steps attribute",
    peers: "none (custom elements)",
    tags: ["custom-elements", "HTML", "embed"],
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
  const [activeStack, setActiveStack] = useState<StackId>("react");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedHeroInstall, setCopiedHeroInstall] = useState(false);
  const [installMenuOpen, setInstallMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const installMenuRef = useRef<HTMLDivElement>(null);
  const stackTablistRef = useRef<HTMLDivElement>(null);
  const themeListId = useId();
  const installListId = useId();
  const stackTablistId = useId();
  const stackPanelId = useId();

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
    if (!themeMenuOpen && !installMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const t = event.target as Node;
      if (themeMenuOpen) {
        const root = themeMenuRef.current;
        if (root && !root.contains(t)) setThemeMenuOpen(false);
      }
      if (installMenuOpen) {
        const root = installMenuRef.current;
        if (root && !root.contains(t)) setInstallMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setThemeMenuOpen(false);
        setInstallMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [themeMenuOpen, installMenuOpen]);

  const copyText = useCallback(async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
    } catch {
      /* ignore */
    }
  }, []);

  const activeTheme = DEMO_THEMES[currentTheme];
  const activeCard =
    STACK_CARDS.find((c) => c.id === activeStack) ?? STACK_CARDS[0];

  const onStackTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const order = STACK_CARDS.map((c) => c.id);
      const idx = order.indexOf(activeStack);
      if (idx < 0) return;

      let next = idx;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        next = (idx + 1) % order.length;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        next = (idx - 1 + order.length) % order.length;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = order.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextId = order[next];
      setActiveStack(nextId);
      setCopiedCode(false);
      setCopiedInstall(false);
      const btn = stackTablistRef.current?.querySelector<HTMLButtonElement>(
        `[data-stack-tab="${nextId}"]`
      );
      btn?.focus();
    },
    [activeStack]
  );

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
                  <strong>React</strong>, <strong>Vue</strong>,{" "}
                  <strong>Svelte</strong>, <strong>Angular</strong>, and plain{" "}
                  <strong>Vanilla JS</strong> — same core, themes, keyboard
                  traps, and multi-page persist. Components,{" "}
                  <code className="hero-inline-code">v-model:is-open</code>,{" "}
                  <code className="hero-inline-code">bind:isOpen</code>,{" "}
                  <code className="hero-inline-code">&lt;guideloop-tour&gt;</code>
                  , an imperative API, or{" "}
                  <code className="hero-inline-code">&lt;guide-loop&gt;</code>.
                </p>
              </div>

              <div className="hero-cta-group">
                <div
                  className={`install-command-pill${installMenuOpen ? " is-open" : ""}`}
                  data-hero-spot="install"
                  ref={installMenuRef}
                >
                  <button
                    type="button"
                    className="install-stack-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={installMenuOpen}
                    aria-controls={installListId}
                    onClick={() => {
                      setInstallMenuOpen((open) => !open);
                      setThemeMenuOpen(false);
                    }}
                  >
                    <span className="install-stack-label">
                      {activeCard.shortLabel}
                    </span>
                    <span className="install-stack-caret" aria-hidden="true">
                      {installMenuOpen ? "\u25B2" : "\u25BC"}
                    </span>
                  </button>

                  <span className="install-command-divider" aria-hidden="true" />

                  <code className="install-command-text">
                    $ {activeCard.install}
                  </code>

                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={() =>
                      void copyText(activeCard.install, () => {
                        setCopiedHeroInstall(true);
                        window.setTimeout(() => setCopiedHeroInstall(false), 1600);
                      })
                    }
                    title={`Copy ${activeCard.label} install command`}
                    aria-label={`Copy ${activeCard.label} install command`}
                  >
                    {copiedHeroInstall ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {installMenuOpen ? (
                    <ul
                      id={installListId}
                      className="install-stack-menu"
                      role="listbox"
                      aria-label="Install for stack"
                    >
                      {STACK_CARDS.map((card) => {
                        const selected = card.id === activeStack;
                        return (
                          <li key={card.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`install-stack-item${selected ? " is-active" : ""}`}
                              onClick={() => {
                                setActiveStack(card.id);
                                setCopiedCode(false);
                                setCopiedInstall(false);
                                setCopiedHeroInstall(false);
                                setInstallMenuOpen(false);
                              }}
                            >
                              <span className="install-stack-item-label">
                                {card.label}
                              </span>
                              <span className="install-stack-item-pkg">
                                {card.packageName}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
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
                    <span className="hero-stat-symbol">^</span> React · Vue · Svelte · Angular
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
                <h2>Same tour model · every stack</h2>
                <p>
                  One Step shape, every framework. Pick a stack on the rail —
                  install, API surface, and a minimal example stay in view.
                </p>
              </div>

              <div className="stack-explorer">
                <div
                  ref={stackTablistRef}
                  className="stack-tabs"
                  role="tablist"
                  id={stackTablistId}
                  aria-label="Framework stacks"
                  aria-orientation="vertical"
                  onKeyDown={onStackTabKeyDown}
                >
                  {STACK_CARDS.map((card) => {
                    const selected = card.id === activeStack;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        role="tab"
                        id={`stack-tab-${card.id}`}
                        data-stack-tab={card.id}
                        className={`stack-tab${selected ? " is-active" : ""}`}
                        aria-selected={selected}
                        aria-controls={stackPanelId}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => {
                          setActiveStack(card.id);
                          setCopiedCode(false);
                          setCopiedInstall(false);
                        }}
                      >
                        <span className="stack-tab-label">{card.shortLabel}</span>
                        <span className="stack-tab-pkg" aria-hidden="true">
                          {card.packageName.replace("@guideloop/", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="stack-panel"
                  role="tabpanel"
                  id={stackPanelId}
                  aria-labelledby={`stack-tab-${activeCard.id}`}
                >
                  <div className="stack-panel-meta">
                    <div className="stack-panel-head">
                      <div className="stack-panel-titles">
                        <h3 className="stack-panel-title">{activeCard.label}</h3>
                        <a
                          className="npm-badge stack-panel-badge"
                          href={activeCard.npmUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={`${activeCard.packageName} on npm`}
                        >
                          <span className="npm-badge-label">npm</span>
                          <span className="npm-badge-value">
                            {activeCard.packageName}
                          </span>
                        </a>
                      </div>
                      <p className="stack-panel-blurb">{activeCard.blurb}</p>
                    </div>

                    <dl className="stack-panel-facts">
                      <div>
                        <dt>API</dt>
                        <dd>
                          <code>{activeCard.apiHint}</code>
                        </dd>
                      </div>
                      <div>
                        <dt>Peers</dt>
                        <dd>{activeCard.peers}</dd>
                      </div>
                    </dl>

                    <ul className="stack-panel-tags" aria-label="Highlights">
                      {activeCard.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>

                    <div className="stack-panel-install">
                      <code>{activeCard.install}</code>
                      <button
                        type="button"
                        className="stack-install-copy"
                        onClick={() =>
                          void copyText(activeCard.install, () => {
                            setCopiedInstall(true);
                            window.setTimeout(() => setCopiedInstall(false), 1600);
                          })
                        }
                        aria-label={`Copy ${activeCard.label} install command`}
                      >
                        {copiedInstall ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedInstall ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="code-window stack-panel-code">
                    <div className="code-header">
                      <div className="code-dots">
                        <span className="dot dot--red" />
                        <span className="dot dot--yellow" />
                        <span className="dot dot--green" />
                      </div>
                      <span className="code-filename">{activeCard.file}</span>
                      <button
                        type="button"
                        className="code-copy-btn"
                        onClick={() =>
                          void copyText(activeCard.code, () => {
                            setCopiedCode(true);
                            window.setTimeout(() => setCopiedCode(false), 1600);
                          })
                        }
                        aria-label={`Copy ${activeCard.label} example`}
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre tabIndex={0} aria-label={`${activeCard.label} example`}>
                      <code>{activeCard.code}</code>
                    </pre>
                  </div>
                </div>
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
              Tours for React, Vue, Svelte, Angular, Vanilla JS &amp; Web Components.
            </p>
            <nav className="footer-nav" aria-label="Footer">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={NPM_REACT} target="_blank" rel="noreferrer">
                react
              </a>
              <a href={NPM_VUE} target="_blank" rel="noreferrer">
                vue
              </a>
              <a href={NPM_SVELTE} target="_blank" rel="noreferrer">
                svelte
              </a>
              <a href={NPM_ANGULAR} target="_blank" rel="noreferrer">
                angular
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
