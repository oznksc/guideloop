# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **In-app Tour Builder (dev):** `import { TourBuilder } from 'guideloop/builder'` — floating **GL** button over your running app; pick live DOM, edit steps, preview, export JSON/TS. Separate package entry (tree-shakeable). Auto-enabled in development only.
- **Visual Tour Builder lab:** `examples/tour-builder` — standalone practice UI with the same pick/edit/export flow.
- **React 19 / RSC support:** `"use client"` on interactive components (preserved in build); `guideloop/types` RSC-safe export for step/theme types + storage helpers.
- **`npm run size`** — reports raw/gzip sizes for the published ESM module graph.
- **Examples library:** `examples/` starters for Next.js App Router, Vite React, Remix, and React Native Web (local monorepo install via `file:../..`). See `examples/README.md`.
- **Interactive Debug HUD:** `debug` prop on `<GuideLoop>` (`true` | `false` | `'auto'`). Dev overlay shows step stats, missing selectors, multi-target status, trigger/wait state, time-on-step, and event history. Also exports `DebugHUD` + `DebugSnapshot` types.

### Changed
- **Portal** mounts only after client hydration (SSR/RSC-safe); focus trap waits for the portal container.
- **`useViewportSize`** no longer reads `window` during SSR init.
- **Bundle optimization:** `@popperjs/core` is no longer bundled into `dist` (external dependency). `usePopper` loads it via dynamic `import()` so apps can code-split positioning.
- **Build output:** ESM and CJS emit a `preserveModules` graph for better consumer tree-shaking (`sideEffects: false`).
- **Compile target** raised from ES5 → ES2019; unused Rollup PostCSS plugin removed.
- **Spotlight shapes:** Step `spotlightShape` supports `'rect' | 'circle' | 'ellipse'` or a custom polygon (`{ type: 'polygon'; points: [x,y][] }` with points normalized 0–1 to the padded bbox). MaskedOverlay cutouts and Spotlight rings follow the shape.
- **Multi-spotlight:** Step `additionalTargets` highlights extra elements in the same step (string selectors or `{ selector, shape?, padding? }`). Tooltip, scroll, triggers, and `waitForTarget` still use the primary `target`.
- **`useSpotlights` hook** and shared `spotlightShape` helpers (`resolveSpotlightShape`, `SpotlightHole` types).
- Public type exports: `SpotlightShape`, `SpotlightShapeName`, `SpotlightPolygonShape`, `AdditionalSpotlightTarget`, `SpotlightHole`.
- **Public API expansion:** `Spotlight` and `Progress` components exported for standalone use; types `TooltipProps`, `SpotlightProps`, `ProgressProps`, `MaskedOverlayProps`, `TargetRect`, `ButtonLabels`, `StepStatus`, `StepTrigger`, `ShowButtons`, `ImageContent`, `WaitForTargetConfig`, `AnimationSettings` now exported.
- `Spotlight` now accepts optional `theme` and `customTheme` props, consumes theme `spotlight.borderColor`/`borderWidth`/`borderRadius`.
- `MaskedOverlay` now accepts optional `theme` and `customTheme` props, consumes theme `overlay.background`/`opacity` via `hexToRgba`.
- `Progress` now consumes the `theme` prop via `useTheme` for active/inactive dot colors.
- **CI:** `tsc --noEmit` type check step, `npm audit` security scanning, coverage artifact upload, Playwright browser caching, Dependabot config for automated updates.
- **Test infrastructure:** Global Popper.js mock, `ResizeObserver` mock, `scrollIntoView` mock in `test-setup.ts` (matching TESTING.md docs).

### Changed
- **Tailwind CSS dependency removed** — all components (`Tooltip`, `TooltipButton`, `ImageContent`, `Progress`, `Spotlight`, `MaskedOverlay`) converted from utility classes to inline styles with semantic class names (`guideloop-tooltip`, `guideloop-spotlight`).
- **Animation system simplified** — removed duplicate `createAnimation` (CSS string API), all consumers now use `getAnimationStyle` (React.CSSProperties). `MaskedOverlay` fixed to use `getAnimationStyle` instead of spreading `AnimationSettings` directly.
- **Theme resolution** — replaced `JSON.parse(JSON.stringify(...))` with `structuredClone`; `custom` theme key removed from `themes` Record (handled at runtime in `useTheme`).
- **GuideLoop lifecycle** — open sequence reordered (`setTourVisible` fires after state setup), close cleanup now explicitly hides the tour.
- `Spotlight` now applies `padding` as a geometric offset (position - padding, size + padding*2).
- `GuideLoop` passes `theme`/`customTheme` to both `Spotlight` and `MaskedOverlay`.

### Fixed
- `dom.ts`: `console.error` → `console.warn` for invalid selectors (recoverable error).
- `TooltipButton`: hover state now managed via `useState` instead of CSS `:hover` (component has no external CSS).
- Test setup now matches documented mocks from TESTING.md.

### Removed
- Dead code: `Overlay` component (superseded by `MaskedOverlay`), `position.ts` (manual positioning — Popper handles this), `useScroll.ts` (unused), orphaned `spotlight.css`, `tokens.css`.

## [1.4.1] - 2026-07-24

### Added
- GuideLoop-first product landing with a real embedded tour, onboarding checklist, modal task, command palette, and persisted progress.
- Responsive GitHub Pages static export with project base-path support and an automated deployment workflow.
- Focused end-to-end coverage for the landing, tour, onboarding actions, keyboard flows, persistence, and mobile layout.

### Fixed
- Move focus into open tours, contain keyboard focus, and restore the original trigger when a tour closes.
- Clear modal action errors after a successful retry so completed onboarding items no longer retain an error state.

## [1.4.0] - 2026-07-24

### Added
- `OnboardingChecklist` for non-linear onboarding with persisted progress.
- Built-in tour, accessible modal, link, and custom async task actions.
- Controlled and uncontrolled completion state, progress callbacks, collapsible UI, and theme reuse.
- Onboarding state helpers with a separate `guideloop_onboarding_` storage namespace.
- **Multi-Page (Multi-Route) Support:** New `persist` prop syncs tour state across route transitions via localStorage/sessionStorage. Includes `autoRestore` for seamless multi-page tours.
- **Branching Tours:** New `branch` function on steps enables dynamic step jumps (e.g., `branch: () => isAdmin ? 4 : 1`).
- **Advanced Event Triggers:** New `trigger` prop listens for `click`, `change`, `blur`, `hover`, or `drag` events on target elements to auto-advance steps.
- **DOM Smart Wait:** New `waitForTarget` prop uses MutationObserver to wait for async-loaded target elements before showing a step.
- **Step Status Tracking:** `useSteps` now returns `stepStatus` (`'idle'` / `'pending'` / `'success'` / `'error'`).
- `afterStep` lifecycle hook is now properly called on step exit in `useSteps`.

### Fixed
- Tour targets now rebind correctly between steps, including dynamically mounted elements.
- Tour action transitions now preserve `onStepChange` callbacks and scroll each active target into view.
- Demo and E2E navigation labels consistently use the Turkish `İleri` spelling.

## [1.3.2] - 2026-07-09

### Fixed
- Fixed Playwright E2E tests failing to find navigation buttons due to Turkish locale mismatch in demo's defaultButtonLabels.
- Fixed flaky keyboard navigation E2E tests by adding page load and tooltip visibility guards before interaction.

## [1.3.1] - 2026-07-08

### Fixed
- Suppressed expected console.warn noise from GuideLoop and useSpotlight when target elements are missing during tests.
- Excluded e2e directory from Jest test discovery to prevent Playwright import errors during unit test runs.
- Installed demo dependencies in CI E2E job to fix "next: not found" error.

## [1.3.0] - 2026-07-08

### Added
- Comprehensive unit test suite: 139 tests across all hooks, components, and utilities.
- Hook tests for `useSteps`, `useSpotlight`, `useKeyboard`, `usePopper`, `useScroll`, and `useTheme` covering all public APIs, edge cases, and async behaviors.
- Component tests for `Tooltip`, `MaskedOverlay`, `Spotlight`, `Progress`, `Overlay`, and `GuideLoop` covering rendering, interactions, themes, custom labels, images, SVGs, conditional steps, keyboard events, and accessibility.
- Utility tests for `animation`, `dom`, `position`, and `scroll` modules.
- Playwright E2E test suite covering basic tour flow, keyboard navigation, and step transitions.
- CI/CD improvements: multi-node matrix (18, 20, 22), coverage thresholds (branches 70%, functions 70%, lines 75%, statements 75%), and separate E2E job.
- New `test:e2e` and `test:e2e:ui` npm scripts for running Playwright tests.

## [1.2.0] - 2026-07-08

### Added
- Comprehensive project roadmap (`ROADMAP.md`) outlining development phases.
- Technical testing strategy (`TESTING.md`) detailing test coverage, mocks, E2E, and CI/CD pipelines.
- Interactive demo features including a settings panel floating action button (FAB), custom theme presets, and dashboard improvements.
- Official branding assets, including the GuideLoop logo, added to docs and demo.

### Fixed
- Build configuration, type declarations, lint errors, and dependency resolution.

## [1.1.0] - 2024

### Added

- Popper.js integration for smart tooltip positioning
- Masked overlay with spotlight effect
- Smooth scroll to target elements
- Keyboard navigation (arrow keys, escape)
- Multiple theme support (Tailwind, Material, Ant Design)
- Custom theme configuration
- Step action hooks (beforeStep, afterStep)
- Conditional steps
- Event callbacks (onStepChange, onComplete, onSkip)
- Animation configuration
- ARIA-compliant accessibility
- Portal-based rendering
- Progress indicator
- Custom button rendering

### Fixed

- Spotlight position calculation
- Empty querySelector handling
- React 19 compatibility for action buttons

## [1.0.0] - 2024

### Added

- Initial release
- Basic guided tour functionality
- Overlay and spotlight
- Step navigation (next/prev/skip)
- Customizable tooltip
