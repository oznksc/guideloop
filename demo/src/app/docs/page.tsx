"use client";

import React, { useState, useEffect, useCallback, useRef, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import {
  GuideLoopLogo,
  CaretDown,
  CaretUp,
  Github,
  ThemeSlateIcon,
  ThemeEditorialIcon,
  ThemeTerminalIcon,
  ThemeNordicIcon,
  CodeIcon,
  Command,
  Layers,
  Sparkles,
  Timeline,
  Shield,
  Board,
  ReactIcon,
  VueIcon,
  AngularIcon,
  SvelteIcon,
  VanillaIcon,
  WebComponentIcon,
} from "../../components/DemoIcons";
import "../landing.css";
import "../ui/ui-show.css";
import "./docs.css";

type DemoThemeId = "slate" | "editorial" | "terminal" | "nordic";
type DocsTopicId =
  | "quickstart"
  | "react-pkg"
  | "vue-pkg"
  | "angular-pkg"
  | "svelte-pkg"
  | "vanilla-pkg"
  | "web-component-pkg"
  | "step-model"
  | "theme-system"
  | "branching"
  | "triggers"
  | "persistence"
  | "keyboard"
  | "api-ref";

interface DocsTopic {
  id: DocsTopicId;
  label: string;
  shortLabel: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const DOCS_TOPICS: DocsTopic[] = [
  { id: "quickstart", label: "Quick Start", shortLabel: "Start", Icon: Sparkles },
  { id: "react-pkg", label: "React Adapter (@guideloop/react)", shortLabel: "React", Icon: ReactIcon },
  { id: "vue-pkg", label: "Vue Adapter (@guideloop/vue)", shortLabel: "Vue", Icon: VueIcon },
  { id: "angular-pkg", label: "Angular Adapter (@guideloop/angular)", shortLabel: "Angular", Icon: AngularIcon },
  { id: "svelte-pkg", label: "Svelte Adapter (@guideloop/svelte)", shortLabel: "Svelte", Icon: SvelteIcon },
  { id: "vanilla-pkg", label: "Vanilla JS Core (@guideloop/core)", shortLabel: "JS", Icon: VanillaIcon },
  { id: "web-component-pkg", label: "Web Components (<guide-loop>)", shortLabel: "WebComp", Icon: WebComponentIcon },
  { id: "step-model", label: "Step Model & Schema", shortLabel: "Steps", Icon: CodeIcon },
  { id: "theme-system", label: "Theme & Customization", shortLabel: "Theme", Icon: Layers },
  { id: "branching", label: "Branching & Actions", shortLabel: "Flow", Icon: Timeline },
  { id: "triggers", label: "Auto Triggers & Clicks", shortLabel: "Events", Icon: Command },
  { id: "persistence", label: "State Persistence", shortLabel: "State", Icon: Board },
  { id: "keyboard", label: "Focus Trap & Accessibility", shortLabel: "a11y", Icon: Shield },
  { id: "api-ref", label: "Imperative API & Props", shortLabel: "API", Icon: CodeIcon },
];

const DEMO_THEMES = {
  slate: { id: "slate", name: "Guide Blue", Icon: ThemeSlateIcon },
  editorial: { id: "editorial", name: "Editorial Craft", Icon: ThemeEditorialIcon },
  terminal: { id: "terminal", name: "Terminal CLI", Icon: ThemeTerminalIcon },
  nordic: { id: "nordic", name: "Nordic Frost", Icon: ThemeNordicIcon },
} as const;

export default function CoreDocsPage() {
  const [currentTheme, setCurrentTheme] = useState<DemoThemeId>("slate");
  const [activeTopic, setActiveTopic] = useState<DocsTopicId>("quickstart");
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
        {/* Header */}
        <header className="site-header">
          <div className="header-inner">
            <Link className="site-brand" href="../" aria-label="GuideLoop home">
              <GuideLoopLogo className="brand-logo" />
              <span className="brand-badge">@guideloop/core docs</span>
            </Link>

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
            {/* Left Rail Navigation */}
            <div className="stack-tabs" role="tablist" aria-label="Core Documentation Navigation">
              <Link
                href="../"
                className="stack-tab stack-tab--back-link"
                title="Back to Landing Page"
                aria-label="Back to Landing Page"
              >
                <span className="stack-tab-back-arrow" aria-hidden="true">&larr;</span>
                <span className="stack-tab-label">Landing</span>
              </Link>
              <Link
                href="../ui/"
                className="stack-tab stack-tab--ui-link"
                title="View UI Kit Components Showcase"
                aria-label="UI Kit Showcase"
              >
                <Layers className="stack-tab-icon" aria-hidden="true" />
                <span className="stack-tab-label">UI Kit</span>
              </Link>

              {DOCS_TOPICS.map((topic) => {
                const selected = topic.id === activeTopic;
                const TopicIcon = topic.Icon;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    role="tab"
                    id={`docs-tab-${topic.id}`}
                    className={`stack-tab${selected ? " is-active" : ""}`}
                    aria-selected={selected}
                    aria-label={topic.label}
                    title={topic.label}
                    onClick={() => setActiveTopic(topic.id)}
                  >
                    <TopicIcon className="stack-tab-icon" aria-hidden="true" />
                    <span className="stack-tab-label">{topic.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Documentation Panel */}
            <div className="stack-panel">
              <header className="ui-showcase__header">
                <div className="ui-showcase__badge">CORE PACKAGE DOCUMENTATION</div>
                <h1 className="ui-showcase__title">
                  {DOCS_TOPICS.find((t) => t.id === activeTopic)?.label}
                </h1>
                <p className="ui-showcase__subtitle">
                  Technical specifications, lifecycle hooks, and architecture for <code>@guideloop/core</code>.
                </p>
              </header>

              {/* 1. Quick Start */}
              {activeTopic === "quickstart" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Installation &amp; Core Concepts</h3>
                    <p className="docs-block__desc">
                      <code>@guideloop/core</code> provides zero-dependency DOM management, spotlight tracking, focus trapping, and Popper.js positioning for all framework wrappers.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">Terminal</span>
                      </div>
                      <pre className="code-block">
                        <code>npm install guideloop @popperjs/core</code>
                      </pre>
                    </div>
                  </div>

                  <div className="docs-block">
                    <h3 className="docs-block__title">Minimal Vanilla Usage</h3>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">index.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`import { GuideLoop } from "guideloop";

const tour = new GuideLoop({
  steps: [
    {
      target: "#welcome-header",
      title: "Welcome!",
      content: "Let's explore the core features.",
      placement: "bottom"
    }
  ],
  theme: "tailwind"
});

await tour.start();`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* React Adapter */}
              {activeTopic === "react-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">React Component &amp; Hook Adapter</h3>
                    <p className="docs-block__desc">
                      First-class React integration with declarative <code>&lt;GuideLoop /&gt;</code> components, SSR safety for Next.js App Router, and custom hooks.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">App.tsx</span>
                      </div>
                      <pre className="code-block">
                        <code>{`import React, { useState } from "react";
import { GuideLoop, useGuideLoop } from "guideloop";

export function App() {
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    {
      target: "#hero-title",
      title: "React Guided Tour",
      content: "Declarative React tour state management.",
      placement: "bottom"
    }
  ];

  return (
    <div>
      <h1 id="hero-title">My Application</h1>
      <GuideLoop
        steps={steps}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme="tailwind"
      />
    </div>
  );
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Vue Adapter */}
              {activeTopic === "vue-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Vue 3 Composition API &amp; Plugin</h3>
                    <p className="docs-block__desc">
                      Native Vue 3 reactivity wrapper with <code>v-guide-loop</code> directives and <code>useGuideLoop()</code> composable.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">App.vue</span>
                      </div>
                      <pre className="code-block">
                        <code>{`<script setup>
import { ref } from 'vue';
import { GuideLoop } from '@guideloop/vue';

const isOpen = ref(true);
const steps = [
  {
    target: '#vue-header',
    title: 'Vue 3 Tour',
    content: 'Seamless reactivity with Composition API.',
    placement: 'bottom'
  }
];
</script>

<template>
  <h1 id="vue-header">Vue App</h1>
  <GuideLoop :steps="steps" :is-open="isOpen" @close="isOpen = false" />
</template>`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Angular Adapter */}
              {activeTopic === "angular-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Angular Module &amp; Service</h3>
                    <p className="docs-block__desc">
                      Dependency injection-friendly Angular service (<code>GuideLoopService</code>) and directive for standalone or NgModule applications.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">app.component.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`import { Component, OnInit } from '@angular/core';
import { GuideLoopService } from '@guideloop/angular';

@Component({
  selector: 'app-root',
  template: \`<h1 id="ng-title">Angular App</h1>\`
})
export class AppComponent implements OnInit {
  constructor(private tour: GuideLoopService) {}

  ngOnInit() {
    this.tour.start({
      steps: [
        {
          target: '#ng-title',
          title: 'Angular Tour',
          content: 'Dependency Injected onboarding service.'
        }
      ]
    });
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Svelte Adapter */}
              {activeTopic === "svelte-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Svelte Stores &amp; Actions</h3>
                    <p className="docs-block__desc">
                      Ultra-lightweight Svelte store wrapper and <code>use:guideloop</code> action bindings.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">App.svelte</span>
                      </div>
                      <pre className="code-block">
                        <code>{`<script>
  import { GuideLoop } from '@guideloop/svelte';

  let isOpen = true;
  const steps = [
    {
      target: '#svelte-title',
      title: 'Svelte Tour',
      content: 'Reactive stores & DOM action bindings.'
    }
  ];
</script>

<h1 id="svelte-title">Svelte App</h1>
<GuideLoop {steps} bind:isOpen theme="material" />`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Vanilla JS Core */}
              {activeTopic === "vanilla-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Vanilla JavaScript Core Engine</h3>
                    <p className="docs-block__desc">
                      Framework-agnostic ES2019 engine usable with direct script tags or ESM bundlers.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">index.html</span>
                      </div>
                      <pre className="code-block">
                        <code>{`<script type="module">
  import { GuideLoop } from 'https://cdn.jsdelivr.net/npm/@guideloop/core/+esm';

  const tour = new GuideLoop({
    steps: [
      { target: '#vanilla-heading', title: 'Vanilla JS', content: 'No framework needed.' }
    ]
  });
  tour.start();
</script>`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Web Components */}
              {activeTopic === "web-component-pkg" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Custom Element (&lt;guide-loop&gt;)</h3>
                    <p className="docs-block__desc">
                      Web Component standard packaging for Shadow DOM isolation, micro-frontends, or legacy CMS integration.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">index.html</span>
                      </div>
                      <pre className="code-block">
                        <code>{`<script src="https://cdn.jsdelivr.net/npm/@guideloop/elements"></script>

<guide-loop theme="antd" is-open="true">
  <script type="application/json">
    [
      { "target": "#wc-btn", "title": "Web Component", "content": "Encapsulated Shadow DOM tour." }
    ]
  </script>
</guide-loop>`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Step Model */}
              {activeTopic === "step-model" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Step Interface Schema</h3>
                    <p className="docs-block__desc">
                      Every step in GuideLoop is defined by the rigid <code>Step</code> contract.
                    </p>
                    <table className="docs-param-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>target</code></td>
                          <td><code>string | HTMLElement</code></td>
                          <td><span className="docs-badge-required">Required</span></td>
                          <td>CSS selector or direct DOM element to spotlight.</td>
                        </tr>
                        <tr>
                          <td><code>title</code></td>
                          <td><code>string</code></td>
                          <td><span className="docs-badge-optional">Optional</span></td>
                          <td>Title text rendered at the top of the popover.</td>
                        </tr>
                        <tr>
                          <td><code>content</code></td>
                          <td><code>string | ReactNode</code></td>
                          <td><span className="docs-badge-required">Required</span></td>
                          <td>Body content of the tooltip step.</td>
                        </tr>
                        <tr>
                          <td><code>placement</code></td>
                          <td><code>PopperPlacement</code></td>
                          <td><span className="docs-badge-optional">Optional</span></td>
                          <td><code>'top' | 'bottom' | 'left' | 'right' | 'auto'</code></td>
                        </tr>
                        <tr>
                          <td><code>spotlightShape</code></td>
                          <td><code>'rect' | 'circle' | 'ellipse'</code></td>
                          <td><span className="docs-badge-optional">Optional</span></td>
                          <td>Shape cutout for the target spotlight. Defaults to <code>'rect'</code>.</td>
                        </tr>
                        <tr>
                          <td><code>spotlightPadding</code></td>
                          <td><code>number</code></td>
                          <td><span className="docs-badge-optional">Optional</span></td>
                          <td>Pixel offset padding around target rect. Default: <code>8</code>.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Theme System */}
              {activeTopic === "theme-system" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Theme Resolution &amp; Custom Themes</h3>
                    <p className="docs-block__desc">
                      GuideLoop themes require no external CSS files. Built-in themes include <code>tailwind</code>, <code>material</code>, and <code>antd</code>.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">customTheme.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`const customTheme: ThemeConfig = {
  tooltip: {
    backgroundColor: "#0f172a",
    textColor: "#f8fafc",
    borderRadius: "12px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
  },
  spotlight: {
    borderColor: "#38bdf8",
    borderWidth: 2,
    borderStyle: "dashed"
  }
};`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Branching & Actions */}
              {activeTopic === "branching" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Conditional Branching &amp; Step Lifecycle</h3>
                    <p className="docs-block__desc">
                      Control step flows dynamically using <code>beforeStep</code>, <code>afterStep</code>, and custom action hooks.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">branching.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`const steps: Step[] = [
  {
    target: "#user-role-select",
    title: "Select Role",
    content: "Pick Admin or User.",
    beforeStep: async () => {
      await fetchUserPermissions();
    },
    afterStep: (direction, currentStep, nextStep) => {
      if (userRole === "admin") {
        return "admin-step-id"; // Jump to specific step
      }
    }
  }
];`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Auto Triggers & Clicks */}
              {activeTopic === "triggers" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Automatic DOM Triggers</h3>
                    <p className="docs-block__desc">
                      Automatically advance steps on DOM events like <code>click</code>, <code>input</code>, <code>change</code>, or <code>hover</code> without writing manual handlers.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">triggers.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`const step: Step = {
  target: "#submit-btn",
  title: "Submit Form",
  content: "Clicking submit will auto-advance to step 3.",
  advanceOn: {
    event: "click",
    selector: "#submit-btn"
  }
};`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Persistence */}
              {activeTopic === "persistence" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Multi-Page Tour State Persistence</h3>
                    <p className="docs-block__desc">
                      Persist active step indices across full page reloads or Next.js / React Router page navigations.
                    </p>
                    <div className="code-window">
                      <div className="code-header">
                        <span className="code-filename">persistence.ts</span>
                      </div>
                      <pre className="code-block">
                        <code>{`import { saveTourState, loadTourState } from "@guideloop/core";

// Automatically saved under localStorage key 'guideloop_tour_state'
saveTourState("dashboard-tour", { currentStep: 2, isOpen: true });

const saved = loadTourState("dashboard-tour");`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Focus Trap & Accessibility */}
              {activeTopic === "keyboard" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Accessibility &amp; Keyboard Controls</h3>
                    <p className="docs-block__desc">
                      <code>@guideloop/core</code> enforces strict WCAG accessibility rules with aria attributes, Focus Trapping in popovers, and Escape key restoration.
                    </p>
                    <table className="docs-param-table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>RightArrow</code> / <code>DownArrow</code></td>
                          <td>Advances to the next step.</td>
                        </tr>
                        <tr>
                          <td><code>LeftArrow</code> / <code>UpArrow</code></td>
                          <td>Returns to the previous step.</td>
                        </tr>
                        <tr>
                          <td><code>Escape</code></td>
                          <td>Closes the active tour popover and restores opener focus.</td>
                        </tr>
                        <tr>
                          <td><code>Tab</code> / <code>Shift+Tab</code></td>
                          <td>Traps focus inside the active popover dialog.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 8. API Reference */}
              {activeTopic === "api-ref" && (
                <div className="docs-section">
                  <div className="docs-block">
                    <h3 className="docs-block__title">Imperative API Methods</h3>
                    <p className="docs-block__desc">
                      Complete list of methods exposed by the core <code>GuideLoop</code> class.
                    </p>
                    <table className="docs-param-table">
                      <thead>
                        <tr>
                          <th>Method</th>
                          <th>Return Type</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>start()</code></td>
                          <td><code>Promise&lt;void&gt;</code></td>
                          <td>Starts the tour at step 0 or current saved state.</td>
                        </tr>
                        <tr>
                          <td><code>next()</code></td>
                          <td><code>Promise&lt;void&gt;</code></td>
                          <td>Advances to the next step in sequence.</td>
                        </tr>
                        <tr>
                          <td><code>prev()</code></td>
                          <td><code>Promise&lt;void&gt;</code></td>
                          <td>Returns to the previous step.</td>
                        </tr>
                        <tr>
                          <td><code>goTo(index)</code></td>
                          <td><code>Promise&lt;void&gt;</code></td>
                          <td>Jumps to a specific step index.</td>
                        </tr>
                        <tr>
                          <td><code>close()</code></td>
                          <td><code>void</code></td>
                          <td>Closes and unmounts the active tour.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
