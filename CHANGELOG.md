# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
