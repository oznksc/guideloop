import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist', 'index.d.ts');

mkdirSync(dirname(out), { recursive: true });

const dts = `import type { DefineComponent, PropType } from 'vue';
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

export interface GuideLoopExposed {
  next(): Promise<void>;
  prev(): Promise<void>;
  goTo(index: number): Promise<void>;
  skip(): void;
  close(): void;
}

export declare const GuideLoop: DefineComponent<
  GuideLoopProps,
  GuideLoopExposed,
  unknown,
  {},
  {},
  {},
  {},
  {
    'update:isOpen': (value: boolean) => void;
    close: () => void;
    complete: () => void;
    skip: () => void;
    stepChange: (step: number) => void;
  }
>;

export interface OnboardingChecklistProps {
  items: OnboardingItem[];
  title?: string;
  description?: string;
  completedIds?: string[];
  defaultCompletedIds?: string[];
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  persist?: OnboardingChecklistOptions['persist'];
  labels?: OnboardingChecklistOptions['labels'];
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  showProgressBar?: boolean;
  emptyState?: string;
  ariaLabel?: string;
  className?: string;
  zIndex?: number;
}

export interface OnboardingChecklistExposed {
  completeItem(id: string): void;
  uncompleteItem(id: string): void;
  getProgress(): OnboardingProgress | undefined;
  refresh(): void;
}

export declare const OnboardingChecklist: DefineComponent<
  OnboardingChecklistProps,
  OnboardingChecklistExposed,
  unknown,
  {},
  {},
  {},
  {},
  {
    complete: (progress: OnboardingProgress) => void;
    progress: (progress: OnboardingProgress) => void;
  }
>;

export interface ProgressProps {
  current?: number;
  total?: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
}

export declare const Progress: DefineComponent<ProgressProps>;
`;

writeFileSync(out, dts);
console.log('wrote', out);
