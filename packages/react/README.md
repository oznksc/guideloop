# @guideloop/react

React guided tours & onboarding. Powered by [`@guideloop/core`](https://www.npmjs.com/package/@guideloop/core).

```bash
npm i @guideloop/react
```

**Peers:** `react` and `react-dom` `>=16.8.0` (same major, one copy). `@guideloop/core` is installed automatically.

Do not suppress duplicate-React peer warnings — two copies of React cause invalid-hook-call errors.

## Usage

```tsx
import { GuideLoop } from '@guideloop/react';

<GuideLoop
  steps={[{ target: '#cta', title: 'Welcome', content: 'Start here.' }]}
  isOpen={open}
  onClose={(reason) => {
    // reason: 'close' | 'skip' | 'complete'
    setOpen(false);
  }}
  onSkip={() => markSeen()}
  onComplete={() => markSeen()}
  theme="tailwind"
/>
```

## Entries

| Import | Purpose |
|--------|---------|
| `@guideloop/react` | Components & hooks |
| `@guideloop/react/builder` | Dev-only Tour Builder |
| `@guideloop/react/types` | RSC-safe types + storage |

```tsx
const { TourBuilder } = await import('@guideloop/react/builder'); // gate in production
```

```ts
import type { Step, GuideLoopProps, TourEndReason } from '@guideloop/react/types';
```

## `Step`

| Field | Notes |
|-------|--------|
| `target` | CSS selector. Must exist while the step is shown, or the tooltip falls back to the viewport center. |
| `title` / `content` | `content` may be a React node. |
| `placement` | Popper placement (`top`, `bottom`, `left`, `right`, …). |
| `additionalTargets` | Optional extra selectors (or `{ selector, shape?, padding? }`). Missing extras are skipped — they never throw. |
| `spotlightShape` / `spotlightPadding` | Cutout shape for this step. |
| `waitForTarget` | `true` or `{ timeout?, root? }` — wait for `target` before showing the step. On timeout: warn, `onTargetMissing`, centered fallback. |
| `trigger` | Auto-advance on `click` / `change` / `blur` / `hover` / `drag`. |
| `beforeStep` / `afterStep` / `branch` / `condition` | Lifecycle. |

Every `target` and every `additionalTargets` selector should exist while the tour is open. Prefer stable semantic IDs (`#tour-canvas-tour-anchor`) over generated class names.

## Callbacks

These are distinct events. `onClose` still fires for every end so existing integrations keep working; use `reason` (or `onSkip` / `onComplete`) instead of inferring.

| Callback | When |
|----------|------|
| `onComplete()` | Finish / Next on the last step |
| `onSkip()` | Skip button (any step, including last). Not overlay or Escape. |
| `onClose(reason)` | Always. `reason`: `'complete'` \| `'skip'` \| `'close'` |
| `onTargetMissing(info)` | Primary or additional selector was not in the DOM |
| `onStepChange(index)` | Step index changed |
| `onError(error, info)` | Render failure inside the tour (error boundary) |

- Overlay click and Escape → `onClose('close')` only
- Skip → `onSkip()` + `onClose('skip')`
- Last-step Finish → `onComplete()` + `onClose('complete')`

Missing targets **do not throw**. The overlay stays up, the tooltip is centered, and `onTargetMissing` fires.

## Portal & stacking

Overlay + tooltip render through a document-level portal (`#guideloop-portal` on `document.body`) so transformed ancestors (`transform`, `filter`, `contain`) cannot clip the spotlight.

```tsx
<GuideLoop
  portalContainer={document.getElementById('webview-overlay')}
  // or portalContainer="#webview-overlay"
  zIndex={4000}
  ...
/>
```

Raise `zIndex` above editor chrome; do not patch z-index onto individual canvas children.

## Refreshing target geometry

Spotlight holes update on scroll, resize, DOM mutation, and `ResizeObserver`. CSS transforms (canvas zoom) do **not** fire those — call refresh after layout changes:

```tsx
import { GuideLoop, refreshTargets } from '@guideloop/react';

refreshTargets();
// or ref.current?.refreshTargets()
// or <GuideLoop refreshKey={zoom} ... />
```

## Theme

`theme`: `'tailwind' | 'material' | 'antd' | 'custom'`.  
`customTheme: Partial<ThemeConfig>` deep-merges over the base (`tailwind` when `theme='custom'`). Sections: `tooltip`, `overlay`, `spotlight`, `buttons`.

## Browser / SSR

`GuideLoop` is a client component (`'use client'`). It does not read `window`, `document`, or `localStorage` during module evaluation. Storage helpers catch private-mode / disabled-storage throws. For RSC, import types from `@guideloop/react/types` and mount `GuideLoop` only from a client module.

Also: `OnboardingChecklist`, `Spotlight`, `Progress`, `debug` prop.

Docs & demo: [github.com/oznksc/guideloop](https://github.com/oznksc/guideloop) · [live](https://oznksc.github.io/guideloop/)

MIT
