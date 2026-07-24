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
      color: 'rgba(0, 0, 0, 0.75)',
    },
  }}
/>
```

## API Reference

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
