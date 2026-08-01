# GuideLoop Framework-agnostic Dönüşüm Planı

## 1. Monorepo Yapısı

```
guideloop/
├── packages/
│   ├── core/                    # @guideloop/core
│   ├── react/                   # @guideloop/react (mevcut paket)
│   ├── vue/                     # @guideloop/vue
│   ├── svelte/                  # @guideloop/svelte
│   ├── angular/                 # @guideloop/angular
│   └── vanilla/                 # @guideloop/vanilla
├── examples/
│   ├── react/
│   ├── vue/
│   ├── svelte/
│   └── vanilla/
├── turbo.json
├── package.json                 # Root workspace
└── tsconfig.base.json
```

## 2. Core Paketi Tasarımı

### 2.1 Dosya Yapısı

```
packages/core/
├── src/
│   ├── index.ts                 # Public API
│   ├── types/
│   │   ├── step.ts              # Step, StepTrigger, StepStatus
│   │   ├── theme.ts             # Theme, ThemeConfig
│   │   ├── tour.ts              # TourState, PersistConfig
│   │   ├── onboarding.ts        # OnboardingItem, OnboardingState
│   │   └── index.ts             # Barrel export
│   ├── state/
│   │   ├── step-manager.ts      # useSteps mantığı (hook olmadan)
│   │   ├── tour-persist.ts      # saveTourState, loadTourState
│   │   └── onboarding-persist.ts
│   ├── theme/
│   │   ├── index.ts             # getTheme(), mergeTheme()
│   │   ├── tailwind.ts
│   │   ├── material.ts
│   │   └── antd.ts
│   ├── dom/
│   │   ├── query.ts             # querySelector, querySelectorAll
│   │   ├── spotlight.ts         # calculateSpotlightHoles
│   │   ├── scroll.ts            # scrollIntoView
│   │   ├── wait.ts              # waitForElement
│   │   ├── events.ts            # createRestartEvent, GUIDE_RESTART_EVENT
│   │   └── animation.ts         # injectKeyframes, getAnimationStyle
│   ├── geometry/
│   │   ├── shapes.ts            # rect, circle, ellipse, polygon
│   │   └── padding.ts           # applyPadding
│   └── debug/
│       ├── logger.ts            # Ring buffer log
│       └── targets.ts           # buildTargetDebugInfo
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### 2.2 Core API Örnekleri

```typescript
// Step Manager (state machine)
export interface StepManagerConfig {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export interface StepManager {
  currentStep: number;
  currentStepData: Step | null;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  enterStep: (target: number) => Promise<void>;
  leaveStep: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  stepStatus: StepStatus;
  setStep: (step: number) => void;
}

export function createStepManager(config: StepManagerConfig): StepManager;

// Spotlight Calculator
export interface SpotlightTarget {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}

export interface SpotlightHole {
  rect: DOMRect;
  shape: SpotlightShape;
  padding: number;
}

export function calculateSpotlightHoles(
  targets: SpotlightTarget[]
): SpotlightHole[];

// Theme
export function getTheme(
  theme: Theme,
  customTheme?: Partial<ThemeConfig>
): ThemeConfig;

// DOM Utilities
export function querySelectorAsHTMLElement(
  selector: string
): HTMLElement | null;

export function waitForElement(
  selector: string,
  options?: WaitForElementOptions
): Promise<Element>;

export function scrollIntoView(
  element: Element,
  options?: ScrollIntoViewOptions
): Promise<void>;

// Animation
export function injectKeyframes(): void;
export function getAnimationStyle(config?: AnimationConfig): React.CSSProperties;

// Persist
export function saveTourState(
  key: string,
  state: TourState,
  type?: 'local' | 'session'
): void;

export function loadTourState(
  key: string,
  type?: 'local' | 'session'
): TourState | null;
```

### 2.3 Core Bağımlılıkları

```json
{
  "name": "@guideloop/core",
  "dependencies": {
    "@popperjs/core": "^2.11.8"
  },
  "peerDependencies": {},
  "devDependencies": {
    "typescript": "^4.9.5"
  }
}
```

**Not:** Core paketi framework bağımlılığı içermez. Sadece DOM API ve `@popperjs/core` kullanır.

## 3. React Binding Tasarımı

### 3.1 Dosya Yapısı

```
packages/react/
├── src/
│   ├── index.ts                 # Public API (mevcut API ile uyumlu)
│   ├── hooks/
│   │   ├── useSteps.ts          # Core createStepManager'ı wrap eder
│   │   ├── useSpotlight.ts      # Core calculateSpotlightHoles'ı wrap eder
│   │   ├── usePopper.ts         # Popper.js wrapper
│   │   ├── useKeyboard.ts       # Core events'ı wrap eder
│   │   ├── useFocusTrap.ts      # Core DOM utilities'ı wrap eder
│   │   ├── useElementTrigger.ts
│   │   ├── useElementClick.ts
│   │   ├── useWaitForTarget.ts
│   │   ├── useDebugLog.ts
│   │   ├── useTheme.ts
│   │   └── useViewportSize.ts
│   ├── components/
│   │   ├── GuideLoop/           # Ana orchestrator
│   │   ├── Tooltip/
│   │   ├── Spotlight/
│   │   ├── MaskedOverlay/
│   │   ├── Progress/
│   │   ├── DebugHUD/
│   │   └── OnboardingChecklist/
│   └── Portal.tsx
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### 3.2 React Bağımlılıkları

```json
{
  "name": "@guideloop/react",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "dependencies": {
    "@guideloop/core": "workspace:*"
  }
}
```

### 3.3 Hook Örnekleri

```typescript
// useSteps - Core state manager'ı React'a bağlar
import { createStepManager, type StepManagerConfig } from '@guideloop/core';

export function useSteps(config: StepManagerConfig) {
  const managerRef = useRef<StepManager | null>(null);
  const [state, setState] = useState({
    currentStep: config.initialStep,
    currentStepData: null as Step | null,
    isFirstStep: true,
    isLastStep: false,
    totalSteps: 0,
    stepStatus: 'idle' as StepStatus,
  });

  useEffect(() => {
    managerRef.current = createStepManager(config);
    // State sync
  }, [config.steps]);

  return {
    ...state,
    nextStep: () => managerRef.current?.nextStep(),
    prevStep: () => managerRef.current?.prevStep(),
    // ...
  };
}
```

## 4. Vue Binding Tasarımı

### 4.1 Dosya Yapısı

```
packages/vue/
├── src/
│   ├── index.ts
│   ├── composables/
│   │   ├── useSteps.ts
│   │   ├── useSpotlight.ts
│   │   ├── useKeyboard.ts
│   │   └── useTheme.ts
│   ├── components/
│   │   ├── GuideLoop.vue
│   │   ├── Tooltip.vue
│   │   ├── Spotlight.vue
│   │   ├── MaskedOverlay.vue
│   │   ├── Progress.vue
│   │   └── DebugHUD.vue
│   └── types.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 4.2 Vue Bağımlılıkları

```json
{
  "name": "@guideloop/vue",
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "dependencies": {
    "@guideloop/core": "workspace:*"
  }
}
```

### 4.3 Vue Component Örneği

```vue
<!-- GuideLoop.vue -->
<template>
  <Portal>
    <div class="guideloop-container" v-if="canShow">
      <MaskedOverlay
        v-if="overlay"
        :targets="spotlightHoles"
        :theme="theme"
        @click="handleSkip"
      />
      <Spotlight
        :targets="spotlightHoles"
        :theme="theme"
      />
      <Tooltip
        :step="currentStepData"
        :theme="theme"
        @next="handleNext"
        @prev="handlePrev"
        @close="handleSkip"
      />
    </div>
  </Portal>
</template>

<script setup lang="ts">
import { useSteps } from '@guideloop/vue/composables';
import { calculateSpotlightHoles } from '@guideloop/core';

const props = defineProps<GuideLoopProps>();
const { currentStep, nextStep, prevStep } = useSteps(props);
</script>
```

## 5. Svelte Binding Tasarımı

### 5.1 Dosya Yapısı

```
packages/svelte/
├── src/
│   ├── index.ts
│   ├── stores/
│   │   ├── steps.ts
│   │   ├── spotlight.ts
│   │   └── theme.ts
│   ├── components/
│   │   ├── GuideLoop.svelte
│   │   ├── Tooltip.svelte
│   │   ├── Spotlight.svelte
│   │   ├── MaskedOverlay.svelte
│   │   └── Progress.svelte
│   └── types.ts
├── package.json
├── svelte.config.js
└── rollup.config.js
```

### 5.2 Svelte Component Örneği

```svelte
<!-- GuideLoop.svelte -->
<script lang="ts">
  import { createStepsStore } from '@guideloop/svelte/stores';
  import { calculateSpotlightHoles } from '@guideloop/core';
  
  export let steps: Step[];
  export let isOpen: boolean;
  
  const stepsStore = createStepsStore(steps);
</script>

{#if canShow}
  <div class="guideloop-container">
    <Spotlight holes={$spotlightHoles} />
    <Tooltip step={$currentStepData} on:next next on:prev prev />
  </div>
{/if}
```

## 6. Vanilla JS/TS Binding Tasarımı

### 6.1 Dosya Yapısı

```
packages/vanilla/
├── src/
│   ├── index.ts
│   ├── guide-loop.ts            # Ana sınıf
│   ├── tooltip.ts
│   ├── spotlight.ts
│   ├── overlay.ts
│   ├── progress.ts
│   └── types.ts
├── package.json
├── tsconfig.json
└── rollup.config.js
```

### 6.2 Vanilla API Örneği

```typescript
import { GuideLoop } from '@guideloop/vanilla';

const tour = new GuideLoop({
  steps: [
    { target: '#btn', title: 'Tıklayın', content: '...' },
    { target: '#input', title: 'Doldurun', content: '...' },
  ],
  theme: 'tailwind',
});

tour.start();
tour.on('stepChange', (step) => console.log('Step:', step));
tour.on('complete', () => console.log('Tour finished'));
```

## 7. Angular Binding Tasarımı

### 7.1 Dosya Yapısı

```
packages/angular/
├── src/
│   ├── public-api.ts
│   ├── services/
│   │   ├── guide-loop.service.ts
│   │   ├── spotlight.service.ts
│   │   └── theme.service.ts
│   ├── components/
│   │   ├── guide-loop.component.ts
│   │   ├── tooltip.component.ts
│   │   ├── spotlight.component.ts
│   │   ├── overlay.component.ts
│   │   └── progress.component.ts
│   └── types.ts
├── package.json
├── tsconfig.lib.json
└── ng-package.json
```

### 7.2 Angular Component Örneği

```typescript
// guide-loop.component.ts
import { Component, Input } from '@angular/core';
import { GuideLoopService } from '@guideloop/angular/services';

@Component({
  selector: 'gl-guide-loop',
  template: `
    <div class="guideloop-container" *ngIf="canShow">
      <gl-spotlight [holes]="spotlightHoles" />
      <gl-tooltip [step]="currentStepData" (next)="handleNext()" />
    </div>
  `
})
export class GuideLoopComponent {
  @Input() steps: Step[] = [];
  @Input() isOpen = false;
  
  constructor(private guideLoop: GuideLoopService) {}
}
```

## 8. Build ve Test Stratejisi

### 8.1 Build Araçları

- **Monorepo**: Turborepo
- **Core**: Rollup (vanilla TS)
- **React**: Rollup (mevcut config korunur)
- **Vue**: Vite + @vitejs/plugin-vue
- **Svelte**: Rollup + svelte-preprocess
- **Angular**: ng-packagr
- **Vanilla**: Rollup

### 8.2 Test Stratejisi

```
packages/
├── core/
│   └── __tests__/
│       ├── step-manager.test.ts
│       ├── spotlight.test.ts
│       ├── theme.test.ts
│       └── dom.test.ts
├── react/
│   └── __tests__/
│       ├── hooks/
│       │   ├── useSteps.test.tsx
│       │   └── useSpotlight.test.tsx
│       └── components/
│           └── GuideLoop.test.tsx
├── vue/
│   └── __tests__/
│       ├── composables/
│       │   └── useSteps.test.ts
│       └── components/
│           └── GuideLoop.test.ts
└── ...
```

### 8.3 CI/CD

```yaml
# .github/workflows/ci.yml
jobs:
  core:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test --workspace=@guideloop/core
      - run: npm run build --workspace=@guideloop/core
  
  react:
    needs: core
    runs-on: ubuntu-latest
    steps:
      - run: npm run test --workspace=@guideloop/react
      - run: npm run build --workspace=@guideloop/react
  
  vue:
    needs: core
    runs-on: ubuntu-latest
    steps:
      - run: npm run test --workspace=@guideloop/vue
      - run: npm run build --workspace=@guideloop/vue
```

## 9. Migration Planı

### 9.1 Mevcut React Kullanıcıları İçin

```bash
# Eski paket (deprecated)
npm uninstall guideloop

# Yeni paket
npm install @guideloop/react
```

**API Değişikliği Yok**: Mevcut import'lar ve kullanım aynen devam eder.

```typescript
// Eski kullanım (hâlâ çalışır)
import { GuideLoop, Step } from 'guideloop';

// Yeni kullanım (aynı API)
import { GuideLoop, Step } from '@guideloop/react';
```

### 9.2 Yeni Kullanıcılar İçin

```bash
# React
npm install @guideloop/react

# Vue
npm install @guideloop/vue

# Svelte
npm install @guideloop/svelte

# Angular
ng add @guideloop/angular

# Vanilla
npm install @guideloop/vanilla
```

## 10. Uygulama Sırası

### Aşama 1: Core Paketi (2-3 hafta)
1. Monorepo yapısını kur
2. Core paketini oluştur
3. Mevcut utility'leri core'a taşı
4. State manager'ı yaz
5. Core unit testlerini yaz

### Aşama 2: React Binding (1-2 hafta)
1. React paketini oluştur
2. Hook'ları yeniden yaz (core kullanır)
3. Component'leri güncelle
4. Mevcut testleri güncelle
5. Backward compatibility testleri

### Aşama 3: Vue Binding (1-2 hafta)
1. Vue paketini oluştur
2. Composable'ları yaz
3. Component'leri yaz
4. Vue testlerini yaz

### Aşama 4: Diğer Binding'ler (2-3 hafta)
1. Svelte binding
2. Vanilla binding
3. Angular binding
4. Her biri için testler

### Aşama 5: Dokümantasyon ve Yayınlama (1 hafta)
1. README'leri güncelle
2. Migration kılavuzu
3. npm publish
4. Example'ları güncelle

## 11. Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Breaking changes | Yüksek | Yüksek | Semantik versioning, migration kılavuzu |
| Performans düşüşü | Orta | Orta | Benchmark testleri, core optimizasyonu |
| Framework uyumsuzluğu | Düşük | Yüksek | Her framework için ayrı test suite |
| Bakım maliyeti artışı | Yüksek | Orta | Core'a odaklanma, shared testler |
| TypeScript uyumsuzluğu | Düşük | Orta | Strict mode,共同 tsconfig |

## 12. Sonraki Adımlar

1. Bu planı onayla
2. Core paketinin detaylı tasarımını yap
3. İlk prototipi oluştur (core + react)
4. Geri bildirim al
5. Diğer binding'leri ekle
