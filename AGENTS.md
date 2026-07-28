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

## Architecture

```
src/
├── index.ts                  # Public API — everything exported
├── components/
│   ├── GuideLoop/            # Main tour orchestrator
│   ├── Tooltip/              # Step tooltip popover
│   ├── Spotlight/            # Target highlight ring
│   ├── MaskedOverlay/        # Full-page dim overlay
│   ├── Overlay/              # Simple overlay
│   ├── Progress/             # Step progress indicator
│   └── OnboardingChecklist/  # Non-linear task list
├── hooks/
│   ├── useSteps.ts           # Step navigation + branching + lifecycle
│   ├── useSpotlight.ts       # Target element position tracking
│   ├── usePopper.ts          # Popper.js positioning
│   ├── useKeyboard.ts        # Arrow / Escape key handling
│   ├── useElementTrigger.ts  # Auto-advance on DOM events
│   ├── useElementClick.ts    # Programmatic click + delay
│   ├── useWaitForTarget.ts   # MutationObserver DOM wait
│   ├── useScroll.ts          # Window scroll position (RAF)
│   ├── useTheme.ts           # Theme resolution
│   └── useViewportSize.ts    # Viewport resize tracking
├── utils/
│   ├── tourState.ts          # Multi-page tour persistence
│   ├── onboardingState.ts    # Onboarding checklist persistence
│   ├── animation.ts          # Keyframe injection + config types
│   ├── dom.ts                # DOM query helpers
│   ├── events.ts             # Custom event constants
│   ├── position.ts           # Coordinate math
│   ├── scroll.ts             # Scroll-into-view with fallback
│   └── waitForElement.ts     # Polling DOM waiter
└── themes/
    ├── types.ts              # ThemeConfig interface
    ├── tailwind.ts           # Tailwind-inspired theme
    ├── material.ts           # Material Design theme
    ├── antd.ts               # Ant Design theme
    └── index.ts              # Theme lookup
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
- Animation configs are plain objects, not styled-components

### Step Data Flow
1. `GuideLoop` receives `steps: Step[]` and `isOpen: boolean`
2. `useSteps` manages the current step index and calls `beforeStep`/`afterStep` hooks
3. `useSpotlight` tracks the target element's DOM rect
4. `usePopper` positions the Tooltip relative to the target
5. Elements that auto-click (e.g. `nextButtonClickElementId`) fire via `useElementClick`
6. DOM event triggers (click/change/blur/hover/drag) fire via `useElementTrigger`
7. `waitForTarget` polls/watches for the step's target to appear in the DOM
8. Tour state persistence happens via `saveTourState` / `loadTourState`

### Theme System
- `Theme` = `'tailwind' | 'material' | 'antd' | 'custom'`
- `ThemeConfig` has `tooltip`, `overlay`, `spotlight`, `buttons` sections
- `customTheme: Partial<ThemeConfig>` merges over the built-in theme
- Theme files export a complete `ThemeConfig` object

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

1. **Popper.js** must be mocked in Jest tests (use the mock in TESTING.md)
2. **ResizeObserver** is not available in JSDOM — must be mocked globally
3. **Portal** renders into `#guideloop-portal` — test queries must look there
4. **Focus trapping** uses `data-guideloop-action` attributes on controls
5. **Target selectors** are CSS selectors, not just IDs — use `querySelector`
6. **Rollup** builds both CJS and ESM — make sure imports are compatible
7. **No external CSS files** — styles are injected via JS objects
8. **sideEffects: false** in package.json — tree-shake friendly code expected
