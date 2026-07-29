# GuideLoop — AI Assistant Guide

GuideLoop is a React guided tour / onboarding library. This file helps AI coding
assistants understand the project and produce correct, idiomatic code.

## Project Overview

- **What**: A zero-config guided tour library for React (>=16.8)
- **Package**: `guideloop` on npm
- **License**: MIT
- **Build**: Rollup (CJS + ESM + dts)
- **Tests**: Jest (unit/component) + Playwright (e2e)
- **Lint**: ESLint + TypeScript strict mode
- **CI**: GitHub Actions (lint, tsc, test, build, e2e, audit) + Dependabot

## Architecture

```
src/
├── index.ts                  # Public API — everything exported
├── components/
│   ├── GuideLoop/            # Main tour orchestrator
│   ├── Tooltip/              # Step tooltip popover
│   ├── Spotlight/            # Target highlight ring (also exported standalone)
│   ├── MaskedOverlay/        # Full-page dim overlay with SVG cutout
│   ├── Progress/             # Step progress indicator (also exported standalone)
│   └── OnboardingChecklist/  # Non-linear task list
├── hooks/
│   ├── useSteps.ts           # Single-source step index + branching + lifecycle
│   ├── useSpotlight.ts       # Target element position tracking
│   ├── usePopper.ts          # Popper.js positioning
│   ├── useKeyboard.ts        # Arrow / Escape key handling
│   ├── useFocusTrap.ts       # Focus trap + restore opener
│   ├── useElementTrigger.ts  # Auto-advance on DOM events
│   ├── useElementClick.ts    # Programmatic click + delay + resume
│   ├── useWaitForTarget.ts   # MutationObserver DOM wait
│   ├── useTheme.ts           # Theme resolution (structuredClone merge)
│   └── useViewportSize.ts    # Viewport resize tracking
├── utils/
│   ├── tourState.ts          # Multi-page tour persistence
│   ├── onboardingState.ts    # Onboarding checklist persistence
│   ├── animation.ts          # Keyframe injection + getAnimationStyle
│   ├── dom.ts                # DOM query helpers
│   ├── events.ts             # Custom event constants
│   ├── scroll.ts             # Scroll-into-view with fallback
│   └── waitForElement.ts     # Polling DOM waiter
└── themes/
    ├── types.ts              # ThemeConfig interface
    ├── tailwind.ts           # Tailwind-inspired theme
    ├── material.ts           # Material Design theme
    ├── antd.ts               # Ant Design theme
    └── index.ts              # Theme lookup (custom resolved at runtime)
```

## Key Conventions

### TypeScript
- **strict**: true in tsconfig
- **no unused locals/params**: errors
- **no `any`**: warn (avoid when possible)
- React components use `React.FC<Props>` pattern or plain function with typed props

### Imports
- React imports at top, then components, then hooks, then utils, then types
- Use relative imports within src/ (no path aliases)
- Named exports for everything (no default exports except in demo)

### Component Patterns
- Props defined as local `interface` in a `types.ts` file co-located with component
- `Portal` component wraps tooltip/overlay into `#guideloop-portal` div
- Hooks are pure logic — no JSX, no DOM queries at module level
- Animation configs are plain objects via `getAnimationStyle()`
- **No external CSS** — all styles are inline JS objects; no Tailwind dependency
- Semantic class names (`guideloop-tooltip`, `guideloop-spotlight`) for identification only

### Step Data Flow
1. `GuideLoop` receives `steps: Step[]` and `isOpen: boolean`
2. `useSteps` is the **single source of truth** for the step index (`currentStep`)
3. Normal next/prev: `nextStep`/`prevStep` → `leaveStep` (afterStep) + `advanceTo` (beforeStep)
4. Element-click paths: `leaveStep` → `useElementClick` (hide/click/delay) → restart event → `enterStep` (beforeStep)
5. `useSpotlight` tracks the target element's DOM rect
6. `usePopper` positions the Tooltip relative to the target
7. `useFocusTrap` traps Tab focus in the tour dialog and restores the opener
8. DOM event triggers (click/change/blur/hover/drag) fire via `useElementTrigger`
9. `waitForTarget` polls/watches for the step's target to appear in the DOM
10. Tour state persistence happens via `saveTourState` / `loadTourState`

### Theme System
- `Theme` = `'tailwind' | 'material' | 'antd' | 'custom'`
- `ThemeConfig` has `tooltip`, `overlay`, `spotlight`, `buttons` sections
- `customTheme: Partial<ThemeConfig>` merges over the base theme via `structuredClone`
- When `theme='custom'`, `tailwind` is used as the base (no separate `custom` entry in lookup)
- All visual components consume theme: `Tooltip`, `Spotlight` (border), `MaskedOverlay` (dim), `Progress` (dots), `OnboardingChecklist` (CSS vars)

### OnboardingChecklist
- Manages a set of independent tasks, each with an action type
- Action types: `tour`, `modal`, `link`, `custom`
- Persists completion state via `onboardingState.ts`
- Completion rules: tour=finishes, modal=primary resolves, link=onClick(default), custom=manual

## Commands

```bash
npm run build        # Rollup -> dist/
npm run dev          # Watch mode
npm test             # Jest unit/component tests
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run test:e2e     # Playwright e2e (requires demo running)
```

## Testing

- **Unit/Component**: Jest + ts-jest + jsdom + @testing-library/react
- **E2E**: Playwright against the Next.js demo app
- **Setup file**: `src/test-setup.ts` (global mocks for Popper/ResizeObserver/scroll)
- Test files co-located in `src/__tests__/` matching `*.test.ts(x)`
- Coverage desired: >90%

## Common Gotchas

1. **Popper.js** is mocked globally in `test-setup.ts` — no need to mock per-test
2. **ResizeObserver** is mocked globally in `test-setup.ts`
3. **scrollIntoView** is mocked globally in `test-setup.ts`
4. **Portal** renders into `#guideloop-portal` — test queries must look there
5. **Focus trapping** uses `data-guideloop-action` attributes on controls
6. **Target selectors** are CSS selectors, not just IDs — use `querySelector`
7. **Rollup** builds both CJS and ESM — make sure imports are compatible
8. **No external CSS** — styles are injected via JS objects; no Tailwind dependency
9. **sideEffects: false** in package.json — tree-shake friendly code expected
10. **Spotlight padding** is a geometric offset (position - pad, size + pad*2) since the Tailwind removal
