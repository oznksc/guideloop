# GuideLoop Comprehensive Testing Strategy

This document outlines the testing strategy, methodologies, and technical infrastructure implemented to maintain the quality, stability, and backward compatibility of the **GuideLoop** React library.

---

## 🧪 1. Testing Pyramid & Methodology

Because GuideLoop is an interactive UI package, our testing strategy validates both logical execution (hooks/utils) and UI rendering behavior (components/DOM).

```
                  ┌─────────────────────────┐
                  │ Visual Regression Tests │  <-- Storybook + Chromatic (Visual Consistency)
                  ├─────────────────────────┤
                  │     E2E / Integration   │  <-- Playwright / Cypress (User Flow Simulation)
                  ├─────────────────────────┤
                  │   Component Tests       │  <-- Jest + React Testing Library (DOM & Event Emulation)
                  ├─────────────────────────┤
                  │   Unit Tests            │  <-- Jest + ts-jest (Hooks & Utils Validation)
                  └─────────────────────────┘
```

---

## 📦 2. Unit and Component Testing (Jest & RTL)

Unit and component tests verify the internal state machine, public APIs, and user interaction triggers.

### 2.1 Hooks Testing Plan

#### `useSteps.ts`
- **Scenario 1:** Correctly set the initial step index from the `initialStep` prop.
- **Scenario 2:** Advance the index on `nextStep` call and trigger the `onStepChange` callback.
- **Scenario 3:** Trigger `onComplete` when `nextStep` is called on the last step of the tour.
- **Scenario 4:** Auto-skip steps whose `condition` returns `false`.

#### `useSpotlight.ts`
- **Scenario 1:** Return default values (`0, 0, 0, 0`) if the target element is missing from the DOM.
- **Scenario 2:** Calculate correct coordinates when the target element exists, factoring in custom `spotlightPadding`.
- **Scenario 3:** Recompute coordinates dynamically when a window `resize` event is fired.

#### `useKeyboard.ts`
- **Scenario 1:** Trigger `onEscape` when the `Escape` key is pressed while `enabled` is `true`.
- **Scenario 2:** Route navigation to `nextStep` and `prevStep` on `ArrowRight` and `ArrowLeft` presses.
- **Scenario 3:** Clean up and register no keyboard events when `enabled` is `false`.

---

### 2.2 Component Testing Plan

#### `GuideLoop.tsx`
- **Scenario 1:** Do not render any DOM node when `isOpen={false}`.
- **Scenario 2:** Append container element to the document body via `Portal` when `isOpen={true}`.
- **Scenario 3:** Render the overlay backdrop when `overlay={true}` and omit it when `overlay={false}`.

#### `Tooltip.tsx`
- **Scenario 1:** Display current step's `title` and `content` correctly in the UI.
- **Scenario 2:** Hide or disable the "Previous" navigation button when rendering the first step.
- **Scenario 3:** Replace the "Skip" button label with "Finish" (or equivalent custom labels) on the final step.
- **Scenario 4:** Apply theme styles and `customTheme` configurations to inline CSS blocks correctly.

---

## ⚙️ 3. Jest Mock Configurations

To ensure unit tests run predictably in simulated Node.js environments (JSDOM), browser-specific APIs (Popper.js, ResizeObserver, and scroll behaviors) must be mocked. Include the following mocks in your test setup:

```typescript
// 1. Mocking Popper.js
jest.mock('@popperjs/core', () => ({
  createPopper: () => ({
    state: {},
    destroy: jest.fn(),
    forceUpdate: jest.fn(),
    update: jest.fn(() => Promise.resolve()),
    setOptions: jest.fn(),
  }),
}));

// 2. Mocking ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// 3. Mocking Scroll Into View
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// 4. Mocking getBoundingClientRect (for Spotlight tests)
const mockGetBoundingClientRect = (rect: Partial<DOMRect>) => {
  return jest.fn().mockImplementation(() => ({
    width: 100,
    height: 50,
    top: 10,
    left: 20,
    bottom: 60,
    right: 120,
    x: 20,
    y: 10,
    toJSON: () => {},
    ...rect
  }));
};
```

---

## 🚀 4. End-to-End (E2E) Testing (Playwright)

We use Playwright to validate user journeys in real browser sessions. Playwright runs E2E validation against the local Next.js environment in the `demo` directory.

### 4.1 Critical E2E Test Scenarios
1. **Sequential Tour Progression:**
   - Navigates to page, clicks "Start Tour".
   - Verifies the tooltip displays next to the target element and the spotlight overlay isolates the target.
   - Clicks "Next" and verifies smooth scroll and transition to the next step.
   - Clicks "Finish" on the final step and verifies the tour unmounts and body scroll is restored.
2. **Keyboard Events Validation:**
   - Verifies pressing right arrow advances steps.
   - Verifies pressing Escape closes the tour immediately.
3. **Responsive Visual Adjustment:**
   - Resizes viewport to mobile dimensions and verifies Popper repositioning rules apply (e.g. tooltip shifts above/below target to fit the screen).
4. **Programmatic Clicks & Custom Delays:**
   - Verifies that when a step defines `nextButtonClickElementId`, GuideLoop automatically clicks that DOM node, waits for the specified `nextDelay`, and then advances.

---

## 🎨 5. Visual Regression Testing

To prevent unintended layout shifts across built-in themes (Tailwind, Material-UI, Ant Design):
- **Storybook Integration:** Define distinct stories for `Tooltip`, `Spotlight`, and `Overlay` variations.
- **Chromatic / Jest-Image-Snapshot:** Compare screenshots generated during the CI cycle against baseline snapshots. Flag and request approval for visual deviations during code reviews.

---

## 📝 6. Manual Verification Checklist (Release Protocol)

The following matrix must be manually verified across major browsers and devices prior to publishing any package update:

- [ ] **Browser Compatibility:** Chrome, Firefox, Safari, and Edge (latest 2 versions).
- [ ] **Mobile Touch Support:** Validate tour closing and advancement via tap interactions on iOS Safari and Android Chrome.
- [ ] **Accessibility (Focus Trapping):** Ensure focus remains trapped within the tooltip while the tour dialog is active.
- [ ] **Screen Reader Compatibility:** Ensure `role="dialog"` and `aria-label` tags are read aloud when the tour starts.
- [ ] **Dark Mode Styling:** Ensure background/foreground contrasts meet WCAG AA specifications for all themes.

---

## 🔄 7. CI/CD Integration

Automated testing and verification are handled by GitHub Actions on every commit and Pull Request.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run ESLint
      run: npm run lint

    - name: Run Unit Tests with Coverage
      run: npm run test -- --coverage

    - name: Build Project
      run: npm run build
```
