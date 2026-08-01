# GuideLoop Core + React Dönüşüm Uygulama Planı

## Genel Bakış

Bu plan, GuideLoop'u mevcut React yapısından çıkarıp `@guideloop/core` + `@guideloop/react` mimarisine dönüştürmek için adım adım yol haritasıdır.

**Hedef:** Mevcut React API'sini koruyarak, framework'ten bağımsız bir core kütüphane oluşturmak.

---

## Aşama 0: Monorepo Kurulumu (1 gün)

### 0.1 Root Workspace Oluşturma

```json
// package.json (root)
{
  "name": "guideloop-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### 0.2 Turbo Config

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 0.3 Shared TypeScript Config

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["DOM", "ES2019"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 0.4 Paket Dizinlerini Oluştur

```bash
mkdir -p packages/core/src
mkdir -p packages/react/src
mkdir -p examples/react
```

---

## Aşama 1: Core Paketi - Temel Yapı (2-3 gün)

### 1.1 Core Package.json

```json
// packages/core/package.json
{
  "name": "@guideloop/core",
  "version": "1.0.0",
  "description": "Framework-agnostic guided tour core logic",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint 'src/**/*.{ts,tsx}'"
  },
  "dependencies": {
    "@popperjs/core": "^2.11.8"
  },
  "peerDependencies": {},
  "sideEffects": false
}
```

### 1.2 Core Tip Tanımları

```typescript
// packages/core/src/types/step.ts
export type StepTrigger = 'click' | 'change' | 'blur' | 'hover' | 'drag';

export type StepStatus = 'idle' | 'pending' | 'success' | 'error';

export type ShowButtons = {
  next?: boolean;
  prev?: boolean;
  skip?: boolean;
  close?: boolean;
};

export interface WaitForTargetConfig {
  timeout?: number;
  root?: Element;
}

export interface Step {
  target: string;
  title?: string;
  content?: string;  // Core'da sadece string, React'ta ReactNode'a çevrilir
  placement?: string; // Placement union type'ı core'da tanımlı olacak
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
  spotlightPadding?: number;
  spotlightShape?: SpotlightShape;
  additionalTargets?: (string | AdditionalSpotlightTarget)[];
  beforeStep?: () => void | Promise<void>;
  afterStep?: () => void | Promise<void>;
  branch?: () => number | void | Promise<number | void>;
  condition?: () => boolean;
  
  // Button configs
  showButtons?: ShowButtons;
  nextButtonClickElementId?: string;
  nextButtonOnClick?: () => void | Promise<void>;
  nextDelay?: number;
  prevButtonClickElementId?: string;
  prevButtonOnClick?: () => void | Promise<void>;
  prevDelay?: number;
  skipButtonClickElementId?: string;
  skipButtonOnClick?: () => void | Promise<void>;
  skipDelay?: number;
}

export interface AdditionalSpotlightTarget {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}

export type SpotlightShape = 'rect' | 'circle' | 'ellipse' | SpotlightPolygonShape;

export type SpotlightShapeName = 'rect' | 'circle' | 'ellipse' | 'polygon';

export interface SpotlightPolygonShape {
  type: 'polygon';
  points: Array<{ x: number; y: number }>;
}

export interface SpotlightHole {
  rect: DOMRect;
  shape: SpotlightShape;
  padding: number;
}
```

```typescript
// packages/core/src/types/theme.ts
export type Theme = 'tailwind' | 'material' | 'antd' | 'custom';

export interface ThemeConfig {
  tooltip: {
    background: string;
    textColor: string;
    borderRadius: string;
    padding: string;
    boxShadow: string;
  };
  overlay: {
    background: string;
    opacity: number;
  };
  spotlight: {
    borderColor: string;
    borderWidth: string;
    borderRadius: string;
    animation: string;
  };
  buttons: {
    primary: {
      background: string;
      textColor: string;
      hoverBackground: string;
      padding: string;
    };
    secondary: {
      background: string;
      textColor: string;
      hoverBackground: string;
      padding: string;
    };
  };
}
```

```typescript
// packages/core/src/types/tour.ts
export type PersistType = 'local' | 'session';

export interface TourState {
  currentStepIndex: number;
  isActive: boolean;
}

export interface PersistConfig {
  key: string;
  type?: PersistType;
  autoRestore?: boolean;
}
```

```typescript
// packages/core/src/types/animation.ts
export interface AnimationSettings {
  duration?: string;
  easing?: string;
  delay?: string;
}

export interface AnimationConfig {
  tooltip?: AnimationSettings;
  overlay?: AnimationSettings;
  spotlight?: AnimationSettings;
}
```

```typescript
// packages/core/src/types/index.ts
export * from './step';
export * from './theme';
export * from './tour';
export * from './animation';
```

### 1.3 Core Utility Fonksiyonları (Mevcut Dosyaları Taşı)

**Taşınacak dosyalar:**
- `src/utils/env.ts` → `packages/core/src/utils/env.ts`
- `src/utils/events.ts` → `packages/core/src/utils/events.ts`
- `src/utils/dom.ts` → `packages/core/src/utils/dom.ts`
- `src/utils/scroll.ts` → `packages/core/src/utils/scroll.ts`
- `src/utils/waitForElement.ts` → `packages/core/src/utils/waitForElement.ts`
- `src/utils/spotlightShape.ts` → `packages/core/src/utils/spotlightShape.ts`
- `src/utils/tourState.ts` → `packages/core/src/utils/tourState.ts`
- `packages/core/src/utils/onboardingState.ts`
- `packages/core/src/utils/animation.ts`

**Notlar:**
- `animation.ts`: `React.CSSProperties` return type → `Record<string, string | number>` olarak değiştir
- Dosyalar aynen taşınacak, sadece import path'leri güncellenecek

### 1.4 Core Tema Dosyaları

**Taşınacak dosyalar:**
- `src/themes/types.ts` → `packages/core/src/themes/types.ts`
- `src/themes/index.ts` → `packages/core/src/themes/index.ts`
- `src/themes/tailwind.ts` → `packages/core/src/themes/tailwind.ts`
- `src/themes/material.ts` → `packages/core/src/themes/material.ts`
- `src/themes/antd.ts` → `packages/core/src/themes/antd.ts`

### 1.5 Core State Manager

```typescript
// packages/core/src/state/step-manager.ts
import type { Step, StepStatus } from '../types';

export interface StepManagerConfig {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export interface StepManager {
  currentStep: number;
  currentStepData: Step | null;
  validSteps: Step[];
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  enterStep: (target: number) => Promise<void>;
  leaveStep: () => Promise<void>;
  setStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  stepStatus: StepStatus;
}

export function createStepManager(config: StepManagerConfig): StepManager {
  let currentStep = config.initialStep;
  let stepStatus: StepStatus = 'idle';
  const validSteps = config.steps.filter(step => !step.condition || step.condition());

  const advanceTo = async (target: number): Promise<void> => {
    stepStatus = 'pending';
    try {
      const targetStep = validSteps[target];
      if (targetStep?.beforeStep) {
        await targetStep.beforeStep();
      }
      currentStep = target;
      stepStatus = 'success';
      config.onStepChange?.(target);
    } catch (error) {
      console.error('Error during step transition:', error);
      stepStatus = 'error';
      currentStep = target;
    }
  };

  const leaveStep = async (): Promise<void> => {
    const currentData = validSteps[currentStep];
    if (currentData?.afterStep) {
      await currentData.afterStep();
    }
  };

  const enterStep = async (target: number): Promise<void> => {
    if (target < 0 || target >= validSteps.length) {
      return;
    }
    await advanceTo(target);
  };

  const nextStep = async (): Promise<void> => {
    const currentData = validSteps[currentStep];

    const branchTarget = await currentData?.branch?.();
    if (typeof branchTarget === 'number') {
      if (branchTarget < validSteps.length) {
        await leaveStep();
        await advanceTo(branchTarget);
      } else {
        config.onComplete?.();
      }
      return;
    }

    const next = currentStep + 1;
    if (next < validSteps.length) {
      await leaveStep();
      await advanceTo(next);
    } else {
      config.onComplete?.();
    }
  };

  const prevStep = async (): Promise<void> => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      await leaveStep();
      await advanceTo(prev);
    }
  };

  const setStep = (step: number): void => {
    currentStep = step;
  };

  return {
    get currentStep() { return currentStep; },
    get currentStepData() { return validSteps[currentStep] || null; },
    validSteps,
    nextStep,
    prevStep,
    enterStep,
    leaveStep,
    setStep,
    get isFirstStep() { return validSteps.length === 0 || currentStep === 0; },
    get isLastStep() { return validSteps.length === 0 || currentStep === validSteps.length - 1; },
    get totalSteps() { return validSteps.length; },
    get stepStatus() { return stepStatus; },
  };
}
```

### 1.6 Core Spotlight Hesaplama

```typescript
// packages/core/src/dom/spotlight.ts
import type { SpotlightTarget, SpotlightHole } from '../types';
import { getElementRect } from './query';
import { applyPadding } from '../geometry/padding';

export function calculateSpotlightHoles(
  targets: SpotlightTarget[]
): SpotlightHole[] {
  return targets.map(target => {
    const element = document.querySelector(target.selector);
    if (!element) {
      return {
        rect: new DOMRect(0, 0, 0, 0),
        shape: target.shape || 'rect',
        padding: target.padding || 0,
      };
    }

    const rect = getElementRect(element);
    const paddedRect = applyPadding(rect, target.padding || 0);

    return {
      rect: paddedRect,
      shape: target.shape || 'rect',
      padding: target.padding || 0,
    };
  });
}
```

### 1.7 Core Barrel Export

```typescript
// packages/core/src/index.ts
export * from './types';

export { createStepManager } from './state/step-manager';
export type { StepManager, StepManagerConfig } from './state/step-manager';

export { getTheme, mergeTheme } from './themes';
export { themes } from './themes';

export {
  querySelectorAsHTMLElement,
  getElementRect,
} from './dom/query';

export { calculateSpotlightHoles } from './dom/spotlight';
export { scrollIntoView } from './dom/scroll';
export { waitForElement } from './dom/wait';
export { injectKeyframes, getAnimationStyle } from './dom/animation';
export { createRestartEvent, GUIDE_RESTART_EVENT } from './dom/events';

export { saveTourState, loadTourState, clearTourState } from './state/tour-persist';
export { saveOnboardingState, loadOnboardingState, clearOnboardingState } from './state/onboarding-persist';

export { applyPadding } from './geometry/padding';
export { getShapeName, calculatePolygonPoints } from './geometry/shapes';
```

---

## Aşama 2: React Binding Yeniden Yapılanma (3-4 gün)

### 2.1 React Package.json

```json
// packages/react/package.json
{
  "name": "@guideloop/react",
  "version": "1.5.0",
  "description": "React guided tour library powered by @guideloop/core",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./types": {
      "types": "./dist/rsc-types.d.ts",
      "import": "./dist/esm/rsc-types.js",
      "require": "./dist/cjs/rsc-types.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint 'src/**/*.{ts,tsx}'"
  },
  "dependencies": {
    "@guideloop/core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

### 2.2 React Hook'larını Yeniden Yaz

```typescript
// packages/react/src/hooks/useSteps.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { createStepManager } from '@guideloop/core';
import type { Step, StepStatus } from '@guideloop/core';

interface UseStepsProps {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseStepsReturn {
  currentStep: number;
  currentStepData: Step | null;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  leaveStep: () => Promise<void>;
  enterStep: (target: number) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  stepStatus: StepStatus;
}

export const useSteps = ({
  steps,
  initialStep,
  onStepChange,
  onComplete,
}: UseStepsProps): UseStepsReturn => {
  const managerRef = useRef<ReturnType<typeof createStepManager> | null>(null);
  const [, forceRender] = useState({});

  // Core state manager'ı oluştur
  useEffect(() => {
    managerRef.current = createStepManager({
      steps,
      initialStep,
      onStepChange,
      onComplete,
    });
    forceRender({});
  }, [steps, initialStep, onStepChange, onComplete]);

  const currentStep = managerRef.current?.currentStep ?? initialStep;
  const currentStepData = managerRef.current?.currentStepData ?? null;
  const isFirstStep = managerRef.current?.isFirstStep ?? true;
  const isLastStep = managerRef.current?.isLastStep ?? true;
  const totalSteps = managerRef.current?.totalSteps ?? 0;
  const stepStatus = managerRef.current?.stepStatus ?? 'idle';

  const nextStep = useCallback(async () => {
    await managerRef.current?.nextStep();
    forceRender({});
  }, []);

  const prevStep = useCallback(async () => {
    await managerRef.current?.prevStep();
    forceRender({});
  }, []);

  const leaveStep = useCallback(async () => {
    await managerRef.current?.leaveStep();
  }, []);

  const enterStep = useCallback(async (target: number) => {
    await managerRef.current?.enterStep(target);
    forceRender({});
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    managerRef.current?.setStep(step);
    forceRender({});
  }, []);

  return {
    currentStep,
    currentStepData,
    nextStep,
    prevStep,
    leaveStep,
    enterStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    setCurrentStep,
    stepStatus,
  };
};
```

```typescript
// packages/react/src/hooks/useTheme.ts
import { useMemo } from 'react';
import { getTheme } from '@guideloop/core';
import type { Theme, ThemeConfig } from '@guideloop/core';

export const useTheme = (theme: Theme, customTheme?: Partial<ThemeConfig>): ThemeConfig => {
  return useMemo(() => {
    return getTheme(theme, customTheme);
  }, [theme, customTheme]);
};
```

```typescript
// packages/react/src/hooks/useKeyboard.ts
import { useEffect } from 'react';
import { addKeyboardListener, removeKeyboardListener } from '@guideloop/core';

interface UseKeyboardProps {
  enabled: boolean;
  onEscape?: () => void;
  onArrowRight?: () => void;
  onArrowLeft?: () => void;
  onEnter?: () => void;
}

export const useKeyboard = ({
  enabled,
  onEscape,
  onArrowRight,
  onArrowLeft,
  onEnter,
}: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const cleanup = addKeyboardListener({
      onEscape,
      onArrowRight,
      onArrowLeft,
      onEnter,
    });

    return cleanup;
  }, [enabled, onEscape, onArrowRight, onArrowLeft, onEnter]);
};
```

**Diğer hook'lar da benzer şekilde core utilities'ı wrap edecek.**

### 2.3 React Component'lerini Güncelle

Component'ler aynı kalacak, sadece import'lar değişecek:

```typescript
// packages/react/src/components/GuideLoop/index.tsx
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
// Eski:
// import { useSteps } from '../../hooks/useSteps';
// Yeni:
import { useSteps } from '../../hooks/useSteps';
import { calculateSpotlightHoles, injectKeyframes, saveTourState } from '@guideloop/core';
// ... diğer import'lar
```

### 2.4 React Barrel Export

```typescript
// packages/react/src/index.ts
export { GuideLoop, GuideLoopErrorBoundary } from './components/GuideLoop';
export type { GuideLoopErrorBoundaryProps } from './components/GuideLoop';
export type {
  Step,
  GuideLoopProps,
  ButtonLabels,
  StepStatus,
  StepTrigger,
  ShowButtons,
  ImageContent,
  WaitForTargetConfig,
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  AdditionalSpotlightTarget,
  SpotlightHole,
} from './components/GuideLoop/types';

export { OnboardingChecklist } from './components/OnboardingChecklist';
export type { OnboardingChecklistProps } from './components/OnboardingChecklist';

export { Spotlight } from './components/Spotlight';
export type { SpotlightProps } from './components/Spotlight/types';

export { DebugHUD } from './components/DebugHUD';
export type { DebugHUDProps } from './components/DebugHUD/types';

export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress/types';

export type { TooltipProps } from './components/Tooltip/types';
export type { MaskedOverlayProps, TargetRect } from './components/MaskedOverlay/types';

export type { Theme, ThemeConfig } from '@guideloop/core';
export type { AnimationConfig, AnimationSettings } from '@guideloop/core';
export type { PersistConfig, TourState } from '@guideloop/core';
export { loadTourState, clearTourState, saveTourState } from '@guideloop/core';
export type { OnboardingState } from '@guideloop/core';
export { loadOnboardingState, clearOnboardingState, saveOnboardingState } from '@guideloop/core';
```

---

## Aşama 3: Test Güncellemeleri (2-3 gün)

### 3.1 Core Testleri

```typescript
// packages/core/src/__tests__/step-manager.test.ts
import { createStepManager } from '../state/step-manager';

describe('StepManager', () => {
  const steps = [
    { target: '#step1', title: 'Step 1' },
    { target: '#step2', title: 'Step 2' },
    { target: '#step3', title: 'Step 3' },
  ];

  it('should initialize with correct step', () => {
    const manager = createStepManager({ steps, initialStep: 0 });
    expect(manager.currentStep).toBe(0);
    expect(manager.currentStepData?.title).toBe('Step 1');
  });

  it('should advance to next step', async () => {
    const manager = createStepManager({ steps, initialStep: 0 });
    await manager.nextStep();
    expect(manager.currentStep).toBe(1);
  });

  it('should go back to previous step', async () => {
    const manager = createStepManager({ steps, initialStep: 1 });
    await manager.prevStep();
    expect(manager.currentStep).toBe(0);
  });

  it('should call onComplete on last step', async () => {
    const onComplete = jest.fn();
    const manager = createStepManager({ steps, initialStep: 2, onComplete });
    await manager.nextStep();
    expect(onComplete).toHaveBeenCalled();
  });
});
```

### 3.2 React Testleri (Mevcut Testleri Güncelle)

```typescript
// packages/react/src/__tests__/hooks/useSteps.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useSteps } from '../../hooks/useSteps';

describe('useSteps', () => {
  const steps = [
    { target: '#step1', title: 'Step 1' },
    { target: '#step2', title: 'Step 2' },
  ];

  it('should initialize with correct step', () => {
    const { result } = renderHook(() =>
      useSteps({ steps, initialStep: 0 })
    );
    expect(result.current.currentStep).toBe(0);
  });

  it('should advance to next step', async () => {
    const { result } = renderHook(() =>
      useSteps({ steps, initialStep: 0 })
    );
    await act(async () => {
      await result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);
  });
});
```

---

## Aşama 4: Build Konfigürasyonları (1-2 gün)

### 4.1 Core Rollup Config

```javascript
// packages/core/rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/cjs/index.js', format: 'cjs', sourcemap: true },
      { file: 'dist/esm/index.js', format: 'esm', sourcemap: true },
    ],
    plugins: [resolve(), commonjs(), typescript()],
    external: ['@popperjs/core'],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
  },
];
```

### 4.2 React Rollup Config (Mevcut Config'i Güncelle)

```javascript
// packages/react/rollup.config.js
// Mevcut rollup.config.js'i güncelle
// @guideloop/core'yu external olarak işaretle
external: ['react', 'react-dom', '@popperjs/core', '@guideloop/core'],
```

---

## Aşama 5: Migration ve Dokümantasyon (1-2 gün)

### 5.1 Migration Kılavuzu

```markdown
# React Migration Kılavuzu

## Eski Kullanım
```bash
npm install guideloop
```

```typescript
import { GuideLoop, Step } from 'guideloop';
```

## Yeni Kullanım
```bash
npm uninstall guideloop
npm install @guideloop/react
```

```typescript
import { GuideLoop, Step } from '@guideloop/react';
```

## API Değişikliği
- Hiçbir API değişikliği yok
- Tüm import'lar aynı şekilde çalışmaya devam ediyor
- Core kütüphanesi otomatik olarak yüklenir

## Sorun Giderme
- TypeScript hataları alırsanız: `@types/react` versionunuzu kontrol edin
- Build hataları alırsanız: `node_modules`'ı silip `npm install` çalıştırın
```

### 5.2 Core API Dokümantasyonu

```markdown
# @guideloop/core API Reference

## createStepManager
Step state management için core fonksiyon.

```typescript
import { createStepManager } from '@guideloop/core';

const manager = createStepManager({
  steps: [...],
  initialStep: 0,
  onComplete: () => console.log('Done'),
});

await manager.nextStep();
console.log(manager.currentStep); // 1
```

## calculateSpotlightHoles
Hedef elementlerin spotlight deliklerini hesaplar.

```typescript
import { calculateSpotlightHoles } from '@guideloop/core';

const holes = calculateSpotlightHoles([
  { selector: '#my-button', padding: 8 },
  { selector: '#my-input', padding: 4, shape: 'circle' },
]);
```

## getTheme
Tema konfigürasyonunu döndürür.

```typescript
import { getTheme } from '@guideloop/core';

const theme = getTheme('tailwind', {
  tooltip: { background: '#000' },
});
```
```

---

## Aşama 6: Örnekler ve Final Test (1-2 gün)

### 6.1 React Örneği

```typescript
// examples/react/src/App.tsx
import { GuideLoop, Step } from '@guideloop/react';

const steps: Step[] = [
  { target: '#welcome', title: 'Welcome', content: 'This is step 1' },
  { target: '#features', title: 'Features', content: 'This is step 2' },
  { target: '#pricing', title: 'Pricing', content: 'This is step 3' },
];

function App() {
  return (
    <div>
      <h1 id="welcome">Welcome</h1>
      <div id="features">Features</div>
      <div id="pricing">Pricing</div>
      <GuideLoop steps={steps} isOpen={true} onClose={() => {}} />
    </div>
  );
}
```

### 6.2 E2E Test

```typescript
// e2e/react.spec.ts
import { test, expect } from '@playwright/test';

test('guide loop works', async ({ page }) => {
  await page.goto('http://localhost:3100');
  
  // First step should be visible
  await expect(page.locator('.guideloop-tooltip')).toBeVisible();
  await expect(page.locator('.guideloop-tooltip')).toContainText('Welcome');
  
  // Click next
  await page.click('[data-guideloop-action="next"]');
  
  // Second step should be visible
  await expect(page.locator('.guideloop-tooltip')).toContainText('Features');
});
```

---

## Zaman Çizelgesi

| Aşama | Süre | Bağımlılık |
|-------|------|------------|
| Aşama 0: Monorepo | 1 gün | - |
| Aşama 1: Core Paketi | 2-3 gün | Aşama 0 |
| Aşama 2: React Binding | 3-4 gün | Aşama 1 |
| Aşama 3: Testler | 2-3 gün | Aşama 2 |
| Aşama 4: Build | 1-2 gün | Aşama 2 |
| Aşama 5: Dokümantasyon | 1-2 gün | Aşama 3 |
| Aşama 6: Örnekler | 1-2 gün | Aşama 4 |
| **Toplam** | **11-17 gün** | |

---

## Riskler ve Azaltma

| Risk | Azaltma |
|------|---------|
| Breaking changes | Semantik versioning, migration kılavuzu |
| Core-React circular dependency | Tip soyutlaması, barrel exports |
| Test coverage düşüşü | Core ve React testleri ayrı ayrı |
| Build konfigürasyon hataları | Turborepo pipeline, incremental builds |

---

## Sonraki Adımlar

1. Bu planı onayla
2. Aşama 0 ile başla (monorepo kurulumu)
3. Aşama 1'e geç (core paketi)
4. Her aşamada test et
5. Iterative olarak ilerle
