"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuideLoop } from "../../../src/components/GuideLoop";
import type { Step } from "../../../src/components/GuideLoop/types";
import {
  OnboardingChecklist,
  type OnboardingItem,
} from "../../../src/components/OnboardingChecklist";
import type { ThemeConfig } from "../../../src/themes/types";
import {
  clearOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
} from "../../../src/utils/onboardingState";
import {
  CommandPalette,
  type PaletteCommand,
} from "../components/CommandPalette";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Command,
  Copy,
  Github,
  LoopMark,
  Reset,
} from "../components/DemoIcons";
import { ProductWorkspace } from "../components/ProductWorkspace";
import "./landing.css";

const GITHUB_URL = "https://github.com/oznksc/guideloop";
const NPM_URL = "https://www.npmjs.com/package/guideloop";
const INSTALL_COMMAND = "npm install guideloop";
const CHECKLIST_KEY = "guideloop-demo-getting-started-v3";

const tourSteps: Step[] = [
  {
    target: "#search-bar",
    title: "Find anything fast",
    content:
      "Connect a GuideLoop step to any real element. This command bar also opens with Command K.",
    placement: "bottom",
  },
  {
    target: "#tab-section",
    title: "Keep the launch visible",
    content:
      "Guide people through navigation in context, without sending them to a separate help page.",
    placement: "right",
  },
  {
    target: "#stats-section",
    title: "Explain the signal",
    content:
      "Spotlight the information that matters at exactly the moment someone needs it.",
    placement: "bottom",
  },
  {
    target: "#notifications",
    title: "Reveal secondary actions",
    content:
      "Tours can point to compact controls too. Keyboard navigation and focus behavior stay intact.",
    placement: "bottom",
  },
  {
    target: "#form-section",
    title: "End with a real action",
    content:
      "The final step lands beside something useful, so guidance becomes momentum.",
    placement: "left",
  },
];

const guideTheme: ThemeConfig = {
  tooltip: {
    background: "var(--color-surface)",
    textColor: "var(--color-ink)",
    borderRadius: "var(--radius-medium)",
    padding: "var(--space-6)",
    boxShadow: "var(--shadow-strong)",
  },
  overlay: {
    background: "var(--color-graphite)",
    opacity: 0.58,
  },
  spotlight: {
    borderColor: "var(--color-accent)",
    borderWidth: "2px",
    borderRadius: "var(--radius-small)",
    animation: "guideloop-focus 1.8s var(--ease-standard) infinite",
  },
  buttons: {
    primary: {
      background: "var(--color-accent)",
      textColor: "var(--color-accent-ink)",
      hoverBackground: "var(--color-accent-hover)",
      padding: "var(--space-2) var(--space-4)",
    },
    secondary: {
      background: "var(--color-transparent)",
      textColor: "var(--color-ink-muted)",
      hoverBackground: "var(--color-surface-subtle)",
      padding: "var(--space-2) var(--space-4)",
    },
  },
};

const integrationCode = `import { useState } from "react";
import {
  GuideLoop,
  OnboardingChecklist,
  type OnboardingItem,
  type Step
} from "guideloop";

const steps: Step[] = [{
  target: "#launch-board",
  title: "Your launch board",
  content: "This guidance lives beside the real work."
}];

const items: OnboardingItem[] = [{
  id: "tour",
  title: "Tour the launch board",
  action: { type: "tour", steps }
}];

export function ProductOnboarding() {
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setTourOpen(true)}>
        Start product tour
      </button>
      <div id="launch-board">Your product interface</div>
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

export default function Home() {
  const [tourOpen, setTourOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [integrationCopied, setIntegrationCopied] = useState(false);
  const [checklistInstance, setChecklistInstance] = useState(0);
  const [experienceStatus, setExperienceStatus] = useState(
    "The sample is ready.",
  );
  const commandTriggerRef = useRef<HTMLElement | null>(null);

  const openCommandPalette = useCallback(() => {
    commandTriggerRef.current = document.activeElement as HTMLElement | null;
    setCommandOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandOpen(false);
    window.setTimeout(() => commandTriggerRef.current?.focus(), 0);
  }, []);

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

  const completePersistedItem = useCallback((itemId: string) => {
    const current =
      loadOnboardingState(CHECKLIST_KEY)?.completedIds ?? ["workspace"];
    saveOnboardingState(
      CHECKLIST_KEY,
      Array.from(new Set([...current, itemId])),
    );
    setChecklistInstance((instance) => instance + 1);
  }, []);

  const startTour = useCallback(() => {
    setExperienceStatus("Tour started.");
    setTourOpen(true);
  }, []);

  const resetExperience = useCallback(() => {
    clearOnboardingState(CHECKLIST_KEY);
    setTourOpen(false);
    setCommandOpen(false);
    setChecklistInstance((instance) => instance + 1);
    setExperienceStatus("Progress reset to 1 of 5.");
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (commandOpen) closeCommandPalette();
        else openCommandPalette();
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [closeCommandPalette, commandOpen, openCommandPalette]);

  const commands = useMemo<PaletteCommand[]>(
    () => [
      {
        id: "tour",
        label: "Start the live tour",
        description: "Run the five-step GuideLoop experience.",
        keywords: "demo guide onboarding",
        shortcut: "↵",
        onSelect: startTour,
      },
      {
        id: "experience",
        label: "Jump to the embedded demo",
        description: "See GuideLoop inside a functional product sample.",
        keywords: "guideloop live demo workspace",
        onSelect: () => scrollToSection("live"),
      },
      {
        id: "integration",
        label: "Review the React integration",
        description: "Open the complete, copy-ready component example.",
        keywords: "api code docs react",
        onSelect: () => scrollToSection("integration"),
      },
      {
        id: "install",
        label: "Copy the install command",
        description: INSTALL_COMMAND,
        keywords: "npm package",
        onSelect: () => void copyInstallCommand(),
      },
      {
        id: "github",
        label: "View the source on GitHub",
        description: "Read the API and explore the repository.",
        keywords: "source repository",
        onSelect: () => window.open(GITHUB_URL, "_blank", "noopener,noreferrer"),
      },
    ],
    [copyInstallCommand, startTour],
  );

  const onboardingItems = useMemo<OnboardingItem[]>(
    () => [
      {
        id: "workspace",
        title: "Open the demo interface",
        description: "The embedded example is ready.",
      },
      {
        id: "tour",
        title: "Tour the launch board",
        description: "Follow five contextual steps.",
        action: {
          type: "tour",
          steps: tourSteps,
          guideProps: {
            theme: "custom",
            customTheme: guideTheme,
            keyboard: true,
            scrollSmooth: true,
            spotlightPadding: 10,
            zIndex: 5000,
            defaultButtonLabels: {
              next: "Next",
              prev: "Previous",
              skip: "Skip",
              finish: "Finish",
            },
          },
          onComplete: () => setExperienceStatus("Tour completed."),
        },
      },
      {
        id: "milestone",
        title: "Create a milestone",
        description: "Complete a focused modal task.",
        action: {
          type: "modal",
          title: "Create a milestone",
          content: (
            <div className="onboarding-form">
              <p>
                Add one milestone to this sample launch. Your entry stays in the
                browser only.
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
            setExperienceStatus(`Milestone “${input.value.trim()}” added.`);
          },
        },
      },
      {
        id: "integration",
        title: "Review the React integration",
        description: "See the two-component setup.",
        action: {
          type: "link",
          href: "#integration",
          onNavigate: () =>
            window.setTimeout(() => scrollToSection("integration"), 0),
        },
      },
      {
        id: "command",
        title: "Open the command palette",
        description: "Run application code from a task.",
        action: {
          type: "custom",
          completeOnResolve: true,
          onAction: () => {
            openCommandPalette();
            setExperienceStatus("Custom checklist action completed.");
          },
        },
      },
    ],
    [openCommandPalette],
  );

  return (
    <main>
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <header className="site-nav">
        <a className="site-brand" href="#top" aria-label="GuideLoop home">
          <LoopMark />
          <span>GuideLoop</span>
        </a>

        <nav className="site-links" aria-label="Primary">
          <a href="#live">Live experience</a>
          <a href="#integration">API</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>

        <button
          type="button"
          className="nav-command"
          onClick={openCommandPalette}
          aria-label="Open command palette"
        >
          <Command />
          <span>Quick open</span>
          <kbd>⌘ K</kbd>
        </button>
      </header>

      <div id="content" tabIndex={-1}>
        <section id="top" className="hero" tabIndex={-1}>
          <div className="hero-copy">
            <p className="eyebrow">Open-source React onboarding</p>
            <h1>Onboarding, built into your product.</h1>
            <p className="hero-lede">
              GuideLoop is the React library for guided tours and persistent
              onboarding checklists that connect to real product actions.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => scrollToSection("live")}
              >
                See GuideLoop in action
                <ArrowRight />
              </button>
              <a className="text-link" href={GITHUB_URL}>
                Read the docs
                <ArrowUpRight />
              </a>
            </div>

            <ul className="proof-list" aria-label="Project facts">
              <li>React 16.8+</li>
              <li>TypeScript</li>
              <li>MIT</li>
              <li>4 action types</li>
            </ul>
          </div>

          <div className="hero-code" aria-label="GuideLoop install example">
            <div className="code-heading">
              <div>
                <span>Install</span>
                <strong>Add it to your interface.</strong>
              </div>
              <button
                type="button"
                className="copy-button"
                onClick={() => void copyInstallCommand()}
                aria-label="Copy npm install command"
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre tabIndex={0} aria-label="GuideLoop install example">
              <code>
                <span className="code-muted">$</span> npm install guideloop
                {"\n\n"}
                <span className="code-keyword">import</span> {"{"} GuideLoop,{" "}
                {"\n  "}OnboardingChecklist {"}"}{" "}
                <span className="code-keyword">from</span>{" "}
                <span className="code-string">&quot;guideloop&quot;</span>;
              </code>
            </pre>
            <p>
              Bind steps to selectors. Let the library handle positioning,
              progress, focus, and persistence.
            </p>
          </div>
        </section>

        <section id="live" className="live-section" tabIndex={-1}>
          <div className="section-intro section-intro--hanging">
            <p className="section-index">01 / Live experience</p>
            <div>
              <h2>See GuideLoop working, right here.</h2>
              <p>
                The fictional launch screen below is a compact proof of
                GuideLoop in a real interface. Its tour, checklist, modal,
                custom action, and saved progress are all live.
              </p>
            </div>
          </div>

          <div className="experience-frame">
            <div className="experience-status" aria-live="polite">
              <span>
                <i aria-hidden="true" />
                Live GuideLoop demo
              </span>
              <span>{experienceStatus}</span>
              <button type="button" onClick={resetExperience}>
                <Reset />
                Reset demo
              </button>
            </div>

            <ProductWorkspace
              onStartTour={startTour}
              onOpenCommand={openCommandPalette}
            />

            <div className="onboarding-dock">
              <OnboardingChecklist
                key={checklistInstance}
                items={onboardingItems}
                title="Getting started"
                description="Try every onboarding action."
                defaultCompletedIds={["workspace"]}
                persist={{ key: CHECKLIST_KEY }}
                theme="custom"
                customTheme={guideTheme}
                className="product-checklist"
                ariaLabel="GuideLoop demo getting started checklist"
                zIndex={5000}
                labels={{
                  progress: (completed, total) =>
                    `${completed} of ${total} steps completed`,
                  error: "Enter a milestone name to continue.",
                }}
                onProgressChange={(progress) =>
                  setExperienceStatus(
                    `${progress.completed} of ${progress.total} onboarding steps complete.`,
                  )
                }
                onComplete={() =>
                  setExperienceStatus("The sample onboarding is complete.")
                }
              />
            </div>
          </div>
        </section>

        <section className="capabilities">
          <div className="section-intro section-intro--hanging">
            <div>
              <h2>A tour is only the beginning.</h2>
              <p>
                Keep the next useful action visible before, during, and after a
                tour.
              </p>
            </div>
          </div>

          <div className="capability-list">
            <article>
              <span>01</span>
              <div>
                <h3>Guide the moment.</h3>
                <p>
                  Attach steps to real interface elements. GuideLoop handles
                  positioning, visibility, scrolling, and keyboard navigation.
                </p>
              </div>
              <code>target: &quot;#search-bar&quot;</code>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Keep progress visible.</h3>
                <p>
                  A checklist can start a tour, open a modal, follow a link, or
                  run your application code.
                </p>
              </div>
              <code>action: &quot;modal&quot;</code>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Connect real actions.</h3>
                <p>
                  Controlled progress and callbacks fit client state,
                  localStorage, or a server-backed onboarding model.
                </p>
              </div>
              <code>onCompletedIdsChange</code>
            </article>
            <article>
              <span>04</span>
              <div>
                <h3>Make it yours.</h3>
                <p>
                  Start from Tailwind, Material, or Ant Design—or customize
                  tooltip, overlay, spotlight, and button styles.
                </p>
              </div>
              <code>customTheme</code>
            </article>
          </div>
        </section>

        <section id="integration" className="integration" tabIndex={-1}>
          <div className="integration-inner">
            <div className="integration-copy">
              <h2>Tours and checklists, working together.</h2>
              <p>
                Use GuideLoop for contextual guidance. Use
                OnboardingChecklist when the next step should remain visible.
              </p>

              <dl className="spec-list">
                <div>
                  <dt>Actions</dt>
                  <dd>Tour · modal · link · custom</dd>
                </div>
                <div>
                  <dt>Progress</dt>
                  <dd>Controlled or locally persisted</dd>
                </div>
                <div>
                  <dt>Rendering</dt>
                  <dd>SSR-safe React components</dd>
                </div>
                <div>
                  <dt>Access</dt>
                  <dd>Keyboard, focus, reduced motion</dd>
                </div>
              </dl>
            </div>

            <div className="integration-code">
              <div className="integration-code__heading">
                <span>getting-started.tsx</span>
                <button
                  type="button"
                  onClick={() => void copyIntegrationCode()}
                  aria-label="Copy GuideLoop integration example"
                >
                  {integrationCopied ? <Check /> : <Copy />}
                  {integrationCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre tabIndex={0} aria-label="GuideLoop integration example">
                <code>{integrationCode}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <h2>Give the first session a clear next step.</h2>
          <div>
            <a
              className="button button--primary"
              href={NPM_URL}
              target="_blank"
              rel="noreferrer"
            >
              Install GuideLoop
              <ArrowUpRight />
            </a>
            <a
              className="button button--secondary"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Github />
              View on GitHub
            </a>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <p>Guidance that belongs in the product.</p>
        <div>
          <span>GuideLoop · MIT License</span>
          <a href={GITHUB_URL}>Source</a>
          <a href={NPM_URL}>npm</a>
        </div>
      </footer>

      <GuideLoop
        steps={tourSteps}
        isOpen={tourOpen}
        onClose={() => {
          setTourOpen(false);
          setExperienceStatus("Tour closed.");
        }}
        onSkip={() => setExperienceStatus("Tour skipped.")}
        onComplete={() => {
          setTourOpen(false);
          completePersistedItem("tour");
          setExperienceStatus("Tour completed.");
        }}
        theme="custom"
        customTheme={guideTheme}
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

      <CommandPalette
        open={commandOpen}
        commands={commands}
        onClose={closeCommandPalette}
      />
    </main>
  );
}
