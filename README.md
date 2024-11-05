# GuideLoop

![GuideLoop Banner](https://via.placeholder.com/1200x300)

A modern, flexible, and powerful guided tour library for React applications. GuideLoop helps you create engaging product tours, feature introductions, and onboarding experiences with minimal effort.

[![npm version](https://badge.fury.io/js/guideloop.svg)](https://badge.fury.io/js/guideloop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎨 Multiple pre-built themes (Tailwind, Material-UI, Ant Design)
- 🎯 Smart positioning with automatic repositioning
- 🔄 Smooth transitions between steps
- ⌨️ Full keyboard navigation support
- 📱 Responsive and mobile-friendly
- 🎛️ Highly customizable
- 🌗 Dark mode support
- 🎭 Custom rendering options
- 🔍 Scroll handling & element visibility detection
- 🎬 Custom animations
- ♿ ARIA-compliant accessibility

## 📦 Installation

```bash
npm install guideloop
# or
yarn add guideloop
# or
pnpm add guideloop
```

## 🚀 Quick Start

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
      placement: 'bottom'
    },
    {
      target: '#feature-section',
      title: 'Key Features',
      content: 'Discover what you can do.',
      placement: 'right'
    }
  ];

  return (
    <>
      <button onClick={() => setIsGuideOpen(true)}>
        Start Tour
      </button>

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

## 🎨 Themes

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
      color: 'rgba(0, 0, 0, 0.75)'
    }
  }}
/>
```

## 🛠️ API Reference

### GuideLoop Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Step[]` | Required | Array of step configurations |
| `isOpen` | `boolean` | Required | Controls guide visibility |
| `onClose` | `() => void` | Required | Handler for closing the guide |
| `theme` | `'tailwind' \| 'material' \| 'antd' \| 'custom'` | `'tailwind'` | Visual theme |
| `customTheme` | `CustomTheme` | `undefined` | Custom theme configuration |
| `initialStep` | `number` | `0` | Starting step index |
| `overlay` | `boolean` | `true` | Show/hide overlay |
| `keyboard` | `boolean` | `true` | Enable keyboard navigation |
| `scrollSmooth` | `boolean` | `true` | Enable smooth scrolling |
| `spotlightPadding` | `number` | `8` | Padding around highlighted elements |

### Step Configuration

```typescript
interface Step {
  target: string;                // CSS selector for target element
  title: string;                 // Step title
  content: string | ReactNode;   // Step content
  placement?: Placement;         // Tooltip placement
  spotlightPadding?: number;    // Custom padding for this step
  beforeStep?: () => Promise<void> | void;  // Hook before showing step
  afterStep?: () => Promise<void> | void;   // Hook after showing step
  buttons?: {                   // Custom button configuration
    next?: ReactNode;
    prev?: ReactNode;
    close?: ReactNode;
  };
}
```

## 🎮 Advanced Usage

### Custom Animations

```tsx
<GuideLoop
  animations={{
    tooltip: {
      enter: 'fadeIn',
      exit: 'fadeOut'
    },
    spotlight: {
      enter: 'zoomIn',
      exit: 'zoomOut'
    }
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
    condition: () => userRole === 'admin'
  },
  {
    target: '#step2',
    title: 'Step 2',
    condition: () => featureFlags.newFeature
  }
];
```

## 📚 Examples

Check out our [Storybook](https://guideloop.dev) for live examples and code snippets.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Ozan Kesici]