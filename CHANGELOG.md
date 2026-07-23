# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
