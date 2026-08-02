import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist', 'index.d.ts');

mkdirSync(dirname(out), { recursive: true });

const dts = `import type { SvelteComponentTyped } from 'svelte';
import type {
  GuideLoopOptions,
  Step,
  ButtonLabels,
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
} from '@guideloop/vanilla';

export type {
  GuideLoopOptions,
  Step,
  ButtonLabels,
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
};

export type {
  StepTrigger,
  WaitForTargetConfig,
  AdditionalSpotlightTarget,
  SpotlightShape,
  OnboardingActionContext,
  OnboardingModalAction,
  OnboardingTourAction,
  OnboardingLinkAction,
  OnboardingCustomAction,
  OnboardingItemAction,
  OnboardingLabels,
  OnboardingPersistConfig,
} from '@guideloop/vanilla';

export {
  loadTourState,
  clearTourState,
  saveTourState,
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from '@guideloop/core';

export interface GuideLoopProps {
  steps: Step[];
  isOpen?: boolean;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  initialStep?: number;
  overlay?: boolean;
  keyboard?: boolean;
  scrollSmooth?: boolean;
  spotlightPadding?: number;
  animations?: AnimationConfig;
  zIndex?: number;
  defaultButtonLabels?: ButtonLabels;
  persist?: PersistConfig;
  debug?: boolean | 'auto';
}

export interface GuideLoopEvents {
  close: void;
  complete: void;
  skip: void;
  stepchange: { step: number };
}

export declare class GuideLoop extends SvelteComponentTyped<
  GuideLoopProps,
  GuideLoopEvents
> {
  next(): Promise<void>;
  prev(): Promise<void>;
  goTo(index: number): Promise<void>;
  skip(): void;
  close(): void;
}

export interface OnboardingChecklistProps extends OnboardingChecklistOptions {
  /** Mount immediately when true (default). */
  active?: boolean;
}

export interface OnboardingChecklistEvents {
  complete: OnboardingProgress;
  progress: OnboardingProgress;
}

export declare class OnboardingChecklist extends SvelteComponentTyped<
  OnboardingChecklistProps,
  OnboardingChecklistEvents
> {
  completeItem(id: string): void;
  uncompleteItem(id: string): void;
  getProgress(): OnboardingProgress | undefined;
}

export interface ProgressProps {
  current: number;
  total: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
}

export declare class Progress extends SvelteComponentTyped<ProgressProps> {}

export type { GuideLoopOptions as TourOptions };
`;

writeFileSync(out, dts);
console.log('wrote', out);
