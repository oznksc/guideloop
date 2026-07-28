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
- **CI**: GitHub Actions (quality matrix + e2e + pages deploy + npm publish)
- **No external CSS** — styles injected via JS; `sideEffects: false`
- **No Tailwind dependency** — all styles are inline JS objects

## Architecture Deep-Dive

### Component Tree (when tour is open)

```
<Portal>  (renders into #guideloop-portal)
  <div role="dialog" aria-modal="true">
    <MaskedOverlay />   (full-page dim + SVG cutout)
    <Spotlight />       (themed border ring around target)
    <Tooltip />         (popper-positioned popover)
    <Progress />        (themed step dots at bottom)
  </div>
</Portal>
```

### Component Responsibilities

| Component | File | Role |
|---|---|---|
| `GuideLoop` | `src/components/GuideLoop/index.tsx` | Orchestrator — wires all sub-components and hooks |
| `Portal` | `src/components/GuideLoop/Portal.tsx` | `createPortal` into `#guideloop-portal` (auto-creates if missing) |
| `Tooltip` | `src/components/Tooltip/` | Step content display — title, body, buttons, image/icon |
| `Spotlight` | `src/components/Spotlight/` | Themed border ring around target element (also exported standalone) |
| `MaskedOverlay` | `src/components/MaskedOverlay/` | SVG clip-path mask over full page dim, theme-aware |
| `Progress` | `src/components/Progress/` | Themed step indicator dots (also exported standalone) |
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
| `useTheme` | theme, customTheme | ThemeConfig | `structuredClone`-based deep merge |

### Theme Flow

```
GuideLoop receives theme="tailwind" + customTheme={{ tooltip: {...} }}
  -> useTheme(theme, customTheme)
     -> themes[theme] || themes.tailwind (base lookup)
     -> structuredClone(base)
     -> Object.assign(merged[key], customTheme[key])
  -> ThemeConfig passed to:
     -> Tooltip (tooltip/buttons styles)
     -> Spotlight (borderColor, borderWidth, borderRadius)
     -> MaskedOverlay (overlay.background + opacity via hexToRgba)
     -> Progress (buttons.primary.background for active dots)
     -> OnboardingChecklist (CSS vars via --gl-onboarding-*)
```

## Common Modification Patterns

### Adding a new built-in theme
1. Create `src/themes/mytheme.ts` exporting a `ThemeConfig` object
2. Add `'mytheme'` to the `Theme` union in `src/themes/types.ts`
3. Import and add to the lookup in `src/themes/index.ts`

### Adding a new prop to GuideLoop
1. Add the prop to `GuideLoopProps` interface in `src/components/GuideLoop/types.ts`
2. Destructure it in `src/components/GuideLoop/index.tsx`
3. Pass it down to child components as needed
4. If the prop affects a child component's theme, also update that component's props interface
5. Export the type from `src/index.ts` if it's part of the public API
6. Update the README API reference table
7. Add tests for the new prop behavior

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

### Jest mocks (in `src/test-setup.ts`)
These are already set up globally — no need to mock per-test:
- Popper.js (`@popperjs/core`)
- `ResizeObserver`
- `scrollIntoView` on `HTMLElement.prototype`

### Test file locations
- Components: `src/__tests__/components/`
- Hooks: `src/__tests__/hooks/`
- Utils: `src/__tests__/utils/`

### E2E tests
- Location: `e2e/`
- Playwright config at `playwright.config.ts` auto-starts demo via `webServer`
- Run: `npm run test:e2e`

## Understanding the Spotlight System

The spotlight is a **SVG clip-path mask** on the overlay combined with a decorative border `div`:

1. `useSpotlight` hook watches the target element and returns its `DOMRect`
2. `MaskedOverlay` renders a full-screen `<svg>` with a `<mask>`:
   - Full-screen white rect (everything visible)
   - Black rect at target position (cutout hole)
   - Overlay color comes from theme `overlay.background` + `overlay.opacity`
3. `Spotlight` renders a decorative border ring at the same position using theme `spotlight.borderColor`/`borderWidth`/`borderRadius`
4. Spotlight `padding` is applied as geometric offset: `top - padding`, `left - padding`, `width + padding*2`, `height + padding*2`

## Public API

```typescript
// Components (4)
GuideLoop, OnboardingChecklist, Spotlight, Progress

// Types (20+)
Step, GuideLoopProps, ButtonLabels, StepStatus, StepTrigger,
ShowButtons, ImageContent, WaitForTargetConfig,
TooltipProps, SpotlightProps, ProgressProps,
MaskedOverlayProps, TargetRect,
Theme, ThemeConfig,
AnimationConfig, AnimationSettings,
PersistConfig, TourState, OnboardingState,
OnboardingChecklistProps, OnboardingItem, OnboardingItemAction,
OnboardingActionContext, OnboardingProgress, OnboardingPersistConfig,
OnboardingLabels, OnboardingTourAction, OnboardingModalAction,
OnboardingLinkAction, OnboardingCustomAction

// Utilities (6)
saveTourState, loadTourState, clearTourState,
saveOnboardingState, loadOnboardingState, clearOnboardingState
```

## Persistence Layer

- **Tour persistence**: `src/utils/tourState.ts` — saves `{ currentStepIndex, isActive, lastUpdated }` to localStorage/sessionStorage
- **Onboarding persistence**: `src/utils/onboardingState.ts` — saves `{ version, completedIds, lastUpdated }` to localStorage/sessionStorage
- Both use a `guideloop_` / `guideloop_onboarding_` prefix
- Access via getter functions with try/catch for SSR/privacy-mode safety

## Debugging Tips

- **Tour not showing?** Check `isOpen` prop, `canShow` logic at line ~287 of `GuideLoop/index.tsx`
- **Spotlight in wrong position?** Check `useSpotlight` hook — it queries DOM on scroll/resize via RAF
- **Tooltip in wrong position?** Check Popper placement and `usePopper` offset config
- **Auto-click not firing?** Check `useElementClick` — it requires `nextButtonClickElementId` AND the element to be in DOM
- **Target not found?** Check `useWaitForTarget` — it polls with MutationObserver; `waitForTarget: true` enables it
- **Focus trap broken?** Check `[data-guideloop-action]` attributes on interactive controls
- **Keyboard not working?** Check `keyboard` prop and `useKeyboard` hook (keydown listener on window)
- **Overlay color wrong?** Check theme `overlay.background` (hex) + `overlay.opacity` — `hexToRgba` in `MaskedOverlay` combines them
- **Spotlight border wrong?** Check theme `spotlight.borderColor`, `borderWidth`, `borderRadius`
