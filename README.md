<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./guideloop-logo.svg">
  <img alt="GuideLoop" src="./guideloop-logo.svg" width="600">
</picture>

A modern, flexible, and powerful guided tour library for React applications. GuideLoop helps you create engaging product tours, feature introductions, and onboarding experiences with minimal effort.

[**Explore the live GuideLoop experience →**](https://oznksc.github.io/guideloop/)

[![npm version](https://img.shields.io/npm/v/guideloop.svg)](https://www.npmjs.com/package/guideloop)
[![npm downloads](https://img.shields.io/npm/dm/guideloop.svg)](https://www.npmjs.com/package/guideloop)
[![CI](https://github.com/oznksc/guideloop/actions/workflows/ci.yml/badge.svg)](https://github.com/oznksc/guideloop/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/oznksc/guideloop/blob/main/CONTRIBUTING.md)
[![AI Ready](https://img.shields.io/badge/AI-Ready-blueviolet)](AGENTS.md)
[![OpenCode](https://img.shields.io/badge/OpenCode-Skill-8A2BE2)](.opencode/skills/guideloop/SKILL.md)

## Features

- Multiple pre-built themes (Tailwind, Material-UI, Ant Design)
- Smart positioning with [Popper.js](https://popper.js.org/) — automatic repositioning
- Smooth transitions between steps
- Full keyboard navigation support
- Responsive and mobile-friendly
- Highly customizable
- Dark mode support
- Custom rendering options
- Scroll handling & element visibility detection
- Custom animations
- ARIA-compliant accessibility
- Persistent onboarding checklists with modal, tour, link, and custom actions

## Installation

```bash
npm install guideloop
# or
yarn add guideloop
# or
pnpm add guideloop
```

GuideLoop depends on `@popperjs/core` (installed automatically). The library keeps Popper **external** and loads it with a dynamic import so your bundler can code-split the positioning engine.

**React 16.8 → 19** is supported (`peerDependencies: react/react-dom >=16.8.0`).

### Next.js App Router / React Server Components

Interactive exports (`GuideLoop`, `OnboardingChecklist`, …) are marked with `"use client"` so you can import them from Client Components without extra wrappers.

For **Server Components** (or shared modules) that only need types / storage helpers:

```ts
// app/tour-steps.ts  — safe in RSC
import type { Step } from 'guideloop/types';

export const steps: Step[] = [
  { target: '#cta', title: 'Welcome', content: '…' },
];
```

```tsx
// app/tour-button.tsx
'use client';

import { GuideLoop } from 'guideloop';
import { steps } from './tour-steps';
// …
```

### Bundle size

After `npm run build`:

```bash
npm run size
```

Typical published ESM graph (library code only, Popper external): ~18 kB gzip for the full module set. Importing only `GuideLoop` lets modern bundlers drop unused modules such as `OnboardingChecklist` and `DebugHUD` (`sideEffects: false` + `preserveModules`).

## Examples

Copy-paste ready apps live in [`examples/`](./examples):

| Example | Stack | Focus |
| --- | --- | --- |
| [`nextjs-app-router`](./examples/nextjs-app-router) | Next.js 14 App Router | Multi-page `persist` + client island |
| [`vite-react`](./examples/vite-react) | Vite + React | Shapes, multi-spotlight, Debug HUD |
| [`remix`](./examples/remix) | Remix (Vite) | Multi-route tour resume |
| [`react-native-web`](./examples/react-native-web) | RN Web | DOM tour over RN primitives |
| [`tour-builder`](./examples/tour-builder) | Vite | Visual Tour Builder (pick → export) |

```bash
npm run build
cd examples/vite-react && npm install && npm run dev
# or: cd examples/tour-builder && npm install && npm run dev
```

## Quick Start

```tsx
import { GuideLoop } from 'guideloop';
import { useState } from 'react';

function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const steps = [
    {
      target: '#welcome-button',
      title: 'Welcome to Our App!',
      content: 'Start your journey here.',
      placement: 'bottom',
    },
    {
      target: '#feature-section',
      title: 'Key Features',
      content: 'Discover what you can do.',
      placement: 'right',
    },
  ];

  return (
    <>
      <button onClick={() => setIsGuideOpen(true)}>Start Tour</button>
      <GuideLoop
        steps={steps}
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        theme="tailwind"
      />
    </>
  );
}
```

## Onboarding Checklist

Use `OnboardingChecklist` when onboarding is a set of independent tasks rather
than one linear tour. Each task can start a GuideLoop tour, open an accessible
modal, navigate to a link, or run application code.

```tsx
import { OnboardingChecklist, OnboardingItem } from 'guideloop';

const onboardingItems: OnboardingItem[] = [
  {
    id: 'welcome',
    title: 'Open your workspace',
  },
  {
    id: 'tour',
    title: 'Complete the product tour',
    action: {
      type: 'tour',
      steps,
    },
  },
  {
    id: 'profile',
    title: 'Complete your profile',
    action: {
      type: 'modal',
      title: 'Profile details',
      content: <ProfileForm />,
      primaryLabel: 'Save profile',
      secondaryLabel: 'Not now',
    },
  },
  {
    id: 'docs',
    title: 'Read the getting started guide',
    action: {
      type: 'link',
      href: '/docs/getting-started',
    },
  },
  {
    id: 'invite',
    title: 'Invite a teammate',
    action: {
      type: 'custom',
      onAction: ({ complete }) => {
        openInvitePanel({ onInviteSent: complete });
      },
    },
  },
];

function GettingStarted() {
  return (
    <OnboardingChecklist
      items={onboardingItems}
      defaultCompletedIds={['welcome']}
      persist={{ key: 'workspace-getting-started' }}
      onComplete={(progress) => {
        console.log('Onboarding complete', progress);
      }}
    />
  );
}
```

Completion rules are intentional:

- A tour item completes when its tour finishes, not when it is skipped.
- A modal item completes when its primary action resolves. Returning `false`
  from `onPrimary` keeps the modal open and the item incomplete.
- A link item completes before navigation by default. Set
  `completeOnClick: false` for externally verified tasks.
- A custom action controls completion through its context, or can set
  `completeOnResolve: true`.

Use `completedIds` with `onCompletedIdsChange` for controlled server-backed
progress. Use `defaultCompletedIds` and `persist` for built-in local or session
storage persistence.

## Themes

GuideLoop comes with several built-in themes:

```tsx
// Tailwind Theme (Default)
<GuideLoop theme="tailwind" />

// Material Theme
<GuideLoop theme="material" />

// Ant Design Theme
<GuideLoop theme="antd" />

// Custom Theme
<GuideLoop
  theme="custom"
  customTheme={{
    tooltip: {
      background: '#2D3748',
      textColor: '#FFFFFF',
      borderRadius: '12px',
    },
    overlay: {
      background: '#000000',
      opacity: 0.75,
    },
  }}
/>
```

Themes are applied to the tooltip, spotlight border, overlay dim, and progress
indicator. See [ThemeConfig](src/themes/types.ts) for the full configuration
interface.

## Standalone Components

GuideLoop exports several components for standalone use outside of a tour:

### Spotlight

Highlight an element independently:

```tsx
import { Spotlight } from 'guideloop';

function Demo() {
  const rect = document.getElementById('my-element')?.getBoundingClientRect();
  if (!rect) return null;

  return (
    <Spotlight
      position={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      padding={8}
      theme="material"
    />
  );
}
```

### Progress

Render a step progress indicator outside of the tooltip:

```tsx
import { Progress } from 'guideloop';

<Progress current={2} total={5} theme="tailwind" />
```

## API Reference

### Full Export List

```typescript
// Components
GuideLoop           // Main tour orchestrator
OnboardingChecklist // Non-linear onboarding task list
Spotlight           // Target highlight ring (standalone)
Progress            // Step progress indicator (standalone)

// Types
Step                // Step configuration
GuideLoopProps      // GuideLoop component props
ButtonLabels        // Button label configuration
StepStatus          // 'idle' | 'pending' | 'success' | 'error'
StepTrigger         // 'click' | 'change' | 'blur' | 'hover' | 'drag'
ShowButtons         // Per-step button visibility
ImageContent        // Image/SVG content in steps
WaitForTargetConfig // DOM wait configuration
TooltipProps        // Tooltip component props
SpotlightProps      // Spotlight component props
ProgressProps       // Progress component props
MaskedOverlayProps  // Masked overlay component props
TargetRect          // Target element rectangle
Theme               // 'tailwind' | 'material' | 'antd' | 'custom'
ThemeConfig         // Full theme configuration interface
AnimationConfig     // Animation configuration
AnimationSettings   // Per-component animation settings
PersistConfig       // Multi-page tour persistence config
TourState           // Saved tour state shape
OnboardingState     // Saved onboarding state shape
OnboardingChecklistProps
OnboardingItem      // Checklist task definition
OnboardingItemAction
OnboardingActionContext
OnboardingProgress  // { completed, total, percentage, completedIds }
OnboardingPersistConfig
OnboardingLabels
OnboardingTourAction
OnboardingModalAction
OnboardingLinkAction
OnboardingCustomAction

// Utilities
saveTourState       // Persist tour state
loadTourState       // Restore tour state
clearTourState      // Clear persisted tour state
saveOnboardingState // Persist onboarding progress
loadOnboardingState // Restore onboarding progress
clearOnboardingState // Clear persisted onboarding progress
```

### GuideLoop Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | Required | Array of step configurations |
| `isOpen` | `boolean` | Required | Controls guide visibility |
| `onClose` | `() => void` | Required | Handler for closing the guide |
| `theme` | `'tailwind' \| 'material' \| 'antd' \| 'custom'` | `'tailwind'` | Visual theme |
| `customTheme` | `Partial<ThemeConfig>` | `undefined` | Custom theme configuration |
| `initialStep` | `number` | `0` | Starting step index |
| `overlay` | `boolean` | `true` | Show/hide overlay |
| `keyboard` | `boolean` | `true` | Enable keyboard navigation |
| `scrollSmooth` | `boolean` | `true` | Enable smooth scrolling |
| `spotlightPadding` | `number` | `8` | Padding around highlighted elements |
| `animations` | `AnimationConfig` | `undefined` | Custom animation config |
| `onStepChange` | `(step: number) => void` | `undefined` | Step change callback |
| `onComplete` | `() => void` | `undefined` | Tour completion callback |
| `onSkip` | `() => void` | `undefined` | Tour skip callback |
| `zIndex` | `number` | `2000` | Base z-index for the tour |
| `defaultButtonLabels` | `ButtonLabels` | `undefined` | Default button labels |
| `debug` | `boolean \| 'auto'` | `'auto'` | Debug HUD: `true` always, `false` never, `auto` only when `NODE_ENV === 'development'` |

### OnboardingChecklist Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `OnboardingItem[]` | Required | Checklist tasks and their actions |
| `title` | `ReactNode` | `'Getting Started'` | Checklist heading |
| `completedIds` | `string[]` | `undefined` | Controlled completed item IDs |
| `defaultCompletedIds` | `string[]` | `[]` | Initial uncontrolled completed IDs |
| `persist` | `OnboardingPersistConfig` | `undefined` | Local/session storage persistence |
| `onCompletedIdsChange` | `(ids: string[]) => void` | `undefined` | Completion state callback |
| `onProgressChange` | `(progress) => void` | `undefined` | Progress callback |
| `onComplete` | `(progress) => void` | `undefined` | Called once when every item completes |
| `collapsible` | `boolean` | `true` | Allow the task list to collapse |
| `showProgressBar` | `boolean` | `true` | Show the visual progress bar |
| `theme` | `Theme` | `'tailwind'` | Reuse a GuideLoop theme |
| `customTheme` | `Partial<ThemeConfig>` | `undefined` | Reuse custom GuideLoop theme values |

### Step Configuration

```typescript
interface Step {
  target: string;                           // CSS selector for target element
  title: string;                            // Step title
  content: string | ReactNode;              // Step content
  placement?: Placement;                    // Tooltip placement (Popper.js)
  spotlightPadding?: number;               // Custom padding for this step
  spotlightShape?: SpotlightShape;         // 'rect' | 'circle' | 'ellipse' | polygon
  additionalTargets?: Array<string | AdditionalSpotlightTarget>; // multi-spotlight
  beforeStep?: () => Promise<void> | void; // Hook before showing step
  afterStep?: () => Promise<void> | void;  // Hook after showing step
  condition?: () => boolean;               // Conditional step
  nextButtonOnClick?: () => void;          // Custom next handler
  prevButtonOnClick?: () => void;          // Custom prev handler
  skipButtonOnClick?: () => void;          // Custom skip handler
  nextButtonClickElementId?: string;       // Element to click on next
  prevButtonClickElementId?: string;       // Element to click on prev
  skipButtonClickElementId?: string;       // Element to click on skip
  buttons?: {
    next?: ReactNode;
    prev?: ReactNode;
    close?: ReactNode;
  };
  icon?: ReactNode;
  image?: ImageContent;
}
```

## Advanced Usage

### Debug HUD

```tsx
// Force on (any environment)
<GuideLoop steps={steps} isOpen={open} onClose={close} debug />

// Force off (even in development)
<GuideLoop steps={steps} isOpen={open} onClose={close} debug={false} />

// Default: only when process.env.NODE_ENV === 'development'
<GuideLoop steps={steps} isOpen={open} onClose={close} />
```

The floating panel shows step index/status, time-on-step, primary + additional target found/missing status, trigger/`waitForTarget` config, persist key, and a rolling event history (next/prev/skip/trigger/step-change/errors).

### Spotlight shapes & multi-target

```tsx
const steps = [
  {
    target: '#avatar',
    title: 'Your profile',
    content: 'Avatar is highlighted as a circle.',
    spotlightShape: 'circle',
  },
  {
    target: '#save-btn',
    title: 'Related actions',
    content: 'Primary target plus two helpers at once.',
    additionalTargets: [
      '#cancel-btn',
      { selector: '#help-icon', shape: 'circle', padding: 4 },
    ],
  },
  {
    target: '#badge',
    title: 'Custom cutout',
    content: 'Polygon points are normalized 0–1 to the padded box.',
    spotlightShape: {
      type: 'polygon',
      points: [
        [0.5, 0],
        [1, 0.5],
        [0.5, 1],
        [0, 0.5],
      ],
    },
  },
];
```

Tooltip placement, scroll-into-view, triggers, and `waitForTarget` always use the primary `target`. Extra selectors only affect the overlay cutouts and spotlight rings.

### Custom Animations

```tsx
<GuideLoop
  animations={{
    tooltip: { enter: 'fadeIn', exit: 'fadeOut' },
    spotlight: { enter: 'zoomIn', exit: 'zoomOut' },
  }}
/>
```

### Event Hooks

```tsx
<GuideLoop
  onStepChange={(step) => {
    analytics.track('tour_step_viewed', { stepIndex: step });
  }}
  onComplete={() => {
    analytics.track('tour_completed');
  }}
  onSkip={() => {
    analytics.track('tour_skipped');
  }}
/>
```

### Conditional Steps

```tsx
const steps = [
  {
    target: '#step1',
    title: 'Step 1',
    condition: () => userRole === 'admin',
  },
  {
    target: '#step2',
    title: 'Step 2',
    condition: () => featureFlags.newFeature,
  },
];
```

## Examples

Check out the [demo app](./demo) for live examples and code snippets.

## Browser Support

GuideLoop supports all modern browsers. IE11 is not supported.

| Chrome | Firefox | Safari | Edge |
|--------|---------|--------|------|
| 90+    | 90+     | 15+    | 90+  |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.md)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT © [Ozan Kesici](https://github.com/oznksc)
