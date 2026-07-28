# GuideLoop Project Skill

Deep project knowledge for GuideLoop — a React guided tour / onboarding library.

## When to Load This Skill

Load this skill when working on any aspect of the GuideLoop codebase:
- Writing or modifying tour components (`GuideLoop`, `Tooltip`, `Spotlight`, etc.)
- Working with hooks (`useSteps`, `useSpotlight`, `usePopper`, etc.)
- Adding themes or modifying theme config
- Writing tests (Jest unit/component or Playwright e2e)
- Building or publishing the package
- Debugging tour positioning, focus trapping, or state management

## Project Identity

- **npm**: `guideloop`
- **React**: >=16.8 (hooks-based)
- **Build**: Rollup -> CJS (`dist/cjs/`) + ESM (`dist/esm/`) + bundled types (`dist/index.d.ts`)
- **Test**: Jest (jsdom, ts-jest) + Playwright
- **Lint**: ESLint + TypeScript strict mode
- **No external CSS** — styles injected via JS; `sideEffects: false`

## Architecture Deep-Dive

### Component Tree (when tour is open)

```
<Portal>  (renders into #guideloop-portal)
  <div role="dialog" aria-modal="true">
    <MaskedOverlay />   (full-page dim + cutout)
    <Spotlight />       (animated ring around target)
    <Tooltip />         (popper-positioned popover)
    <Progress />        (step dots at bottom)
  </div>
</Portal>
```

### Component Responsibilities

| Component | File | Role |
|---|---|---|
| `GuideLoop` | `src/components/GuideLoop/index.tsx` | Orchestrator — wires all sub-components and hooks |
| `Portal` | `src/components/GuideLoop/Portal.tsx` | `createPortal` into `#guideloop-portal` (auto-creates if missing) |
| `Tooltip` | `src/components/Tooltip/` | Step content display — title, body, buttons, image/icon |
| `Spotlight` | `src/components/Spotlight/` | Animated border ring around target element |
| `MaskedOverlay` | `src/components/MaskedOverlay/` | SVG clip-path mask over full page dim |
| `Overlay` | `src/components/Overlay/` | Simple full-page dim (no mask) |
| `Progress` | `src/components/Progress/` | Step indicator dots |
| `OnboardingChecklist` | `src/components/OnboardingChecklist/` | Non-linear task list with action types |

### Hook Contract

| Hook | Input | Output | Side Effects |
|---|---|---|---|
| `useSteps` | steps, initialStep, callbacks | nextStep, prevStep, isFirst/Last, totalSteps, currentStepData, setCurrentStep | Calls beforeStep/afterStep, branching, condition skipping |
| `useSpotlight` | targetSelector, padding | DOMRect-like position | Subscribes to scroll, resize; queries DOM |
| `usePopper` | referenceEl, tooltipEl, placement, modifiers | `{ update }` | Creates Popper instance on mount, destroys on unmount |
| `useKeyboard` | enabled, callbacks | — | `keydown` listener on `window` |
| `useElementTrigger` | enabled, targetSelector, trigger, onTrigger | — | DOM event listener on target element (click/change/blur/hover/drag) |
| `useElementClick` | scrollSmooth | `{ handleElementClick, processingRef }` | Dispatches click events, scrolls into view, advances tour |
| `useWaitForTarget` | targetSelector, enabled, config | `{ isReady, isWaiting }` | MutationObserver or polling for async DOM elements |

### Step Object (extended)

```
Step {
  target: string                    // CSS selector (required)
  title: string                     // Step title (required)
  content: string | ReactNode       // Step body (required)
  placement?: Placement             // Popper placement (default: 'bottom')

  // Lifecycle
  beforeStep?: () => void | Promise<void>
  afterStep?: () => void | Promise<void>
  condition?: () => boolean         // false = auto-skip this step
  branch?: () => number | Promise<number>  // jump to arbitrary step index

  // Auto-click
  nextButtonClickElementId?: string  // element to click when "Next" pressed
  prevButtonClickElementId?: string
  skipButtonClickElementId?: string
  nextButtonOnClick?: () => void
  prevButtonOnClick?: () => void
  skipButtonOnClick?: () => void
  nextDelay?: number                 // ms to wait after click before advancing
  prevDelay?: number
  skipDelay?: number

  // UI
  buttonLabels?: { next, prev, skip, finish }
  buttons?: { next, prev, close }    // ReactNode overrides
  image?: ImageContent
  icon?: ReactNode
  showButtons?: { next, previous, close }
  spotlightPadding?: number          // per-step override

  // Triggers
  trigger?: 'click' | 'change' | 'blur' | 'hover' | 'drag'
  waitForTarget?: boolean | { timeout, root }
}
```

## Common Modification Patterns

### Adding a new built-in theme
1. Create `src/themes/mytheme.ts` exporting a `ThemeConfig` object
2. Add `'mytheme'` to the `Theme` union in `src/themes/types.ts`
3. Import and add it to the lookup in `src/themes/index.ts`

### Adding a new prop to GuideLoop
1. Add the prop to `GuideLoopProps` interface in `src/components/GuideLoop/types.ts`
2. Destructure it in `src/components/GuideLoop/index.tsx`
3. Pass it down to child components as needed
4. Export the type from `src/index.ts` if it's part of the public API
5. Update the README API reference table
6. Add tests for the new prop behavior

### Adding a new hook
1. Create the file under `src/hooks/`
2. Use `useCallback`/`useRef`/`useEffect` patterns from existing hooks
3. Import and wire it in `src/components/GuideLoop/index.tsx`
4. Write tests in `src/__tests__/hooks/`

### Adding a new OnboardingChecklist action type
1. Add the type to the action union in `src/components/OnboardingChecklist/types.ts`
2. Handle it in `src/components/OnboardingChecklist/index.tsx` item click handler
3. Persist status via `onboardingState.ts`
4. Add demo in the playground section

## Testing Patterns

### Jest mocks required (in `src/test-setup.ts`)
```typescript
// Popper.js mock
jest.mock('@popperjs/core', () => ({
  createPopper: () => ({ state: {}, destroy: jest.fn(), forceUpdate: jest.fn(), update: jest.fn(() => Promise.resolve()), setOptions: jest.fn() }),
}));
// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn(); unobserve = jest.fn(); disconnect = jest.fn();
};
// scrollIntoView mock
window.HTMLElement.prototype.scrollIntoView = jest.fn();
```

### Test file locations
- Components: `src/__tests__/components/`
- Hooks: `src/__tests__/hooks/`
- Utils: `src/__tests__/utils/`

### E2E tests
- Location: `e2e/`
- Requires demo app running (`cd demo && npm run dev`)
- Run: `npm run test:e2e`

## Build Pipeline

```
src/index.ts
  -> rollup-plugin-peer-deps-external (excludes react/react-dom)
  -> @rollup/plugin-node-resolve
  -> @rollup/plugin-commonjs
  -> @rollup/plugin-typescript
  -> rollup-plugin-postcss (modules + minify)
  -> rollup-plugin-terser
  -> CJS: dist/cjs/index.js
  -> ESM: dist/esm/index.js
  -> dts: dist/index.d.ts (from dist/esm/index.d.ts via rollup-plugin-dts)
```

## Understanding the Spotlight System

The spotlight is NOT a CSS glow — it is a **SVG clip-path mask** on the overlay:

1. `useSpotlight` hook watches the target element and returns its `DOMRect`
2. `MaskedOverlay` renders a full-screen `<svg>` with a `<mask>` that has:
   - A full-screen white rect (everything visible)
   - A transparent circle/rect at the target position (cutout hole)
3. `Spotlight` renders a decorative border ring at the same position (CSS animation)

To modify spotlight behavior, edit the SVG math in `MaskedOverlay`.

## Persistence Layer

- **Tour persistence**: `src/utils/tourState.ts` — saves `{ currentStepIndex, isActive, lastUpdated }` to localStorage/sessionStorage
- **Onboarding persistence**: `src/utils/onboardingState.ts` — saves `{ version, completedIds, lastUpdated }` to localStorage/sessionStorage
- Both use a `guideloop_` / `guideloop_onboarding_` prefix
- Access via getter functions with try/catch for SSR/privacy-mode safety

## Debugging Tips

- **Tour not showing?** Check `isOpen` prop, `canShow` logic at line 287 of `GuideLoop/index.tsx`
- **Spotlight in wrong position?** Check `useSpotlight` hook — it queries DOM on scroll/resize via RAF
- **Tooltip in wrong position?** Check Popper placement and `usePopper` offset config
- **Auto-click not firing?** Check `useElementClick` — it requires `nextButtonClickElementId` AND the element to be in DOM
- **Target not found?** Check `useWaitForTarget` — it polls with MutationObserver; `waitForTarget: true` enables it
- **Focus trap broken?** Check `[data-guideloop-action]` attributes on interactive controls
- **Keyboard not working?** Check `keyboard` prop and `useKeyboard` hook (keydown listener on window)
