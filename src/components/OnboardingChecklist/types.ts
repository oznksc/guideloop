import type { CSSProperties, ReactNode } from 'react';
import type { GuideLoopProps, Step } from '../GuideLoop/types';
import type { Theme, ThemeConfig } from '../../themes/types';
import type { StorageType } from '../../utils/tourState';

export interface OnboardingActionContext {
  itemId: string;
  isComplete: boolean;
  setCompleted: (completed: boolean) => void;
  complete: () => void;
  uncomplete: () => void;
  close: () => void;
}

export interface OnboardingModalAction {
  type: 'modal';
  title?: ReactNode;
  content: ReactNode | ((context: OnboardingActionContext) => ReactNode);
  primaryLabel?: ReactNode;
  secondaryLabel?: ReactNode;
  completeOnPrimary?: boolean;
  closeOnPrimary?: boolean;
  onPrimary?: (
    context: OnboardingActionContext
  ) => boolean | void | Promise<boolean | void>;
  onSecondary?: (context: OnboardingActionContext) => void;
  onClose?: (context: OnboardingActionContext) => void;
}

export interface OnboardingTourAction {
  type: 'tour';
  steps: Step[];
  guideProps?: Omit<
    GuideLoopProps,
    'steps' | 'isOpen' | 'onClose' | 'onComplete' | 'onSkip'
  >;
  completeOnSkip?: boolean;
  onComplete?: (context: OnboardingActionContext) => void;
  onSkip?: (context: OnboardingActionContext) => void;
  onClose?: (context: OnboardingActionContext) => void;
}

export interface OnboardingLinkAction {
  type: 'link';
  href: string;
  target?: string;
  rel?: string;
  completeOnClick?: boolean;
  onNavigate?: (context: OnboardingActionContext) => void;
}

export interface OnboardingCustomAction {
  type: 'custom';
  onAction: (
    context: OnboardingActionContext
  ) => void | Promise<void>;
  completeOnResolve?: boolean;
}

export type OnboardingItemAction =
  | OnboardingModalAction
  | OnboardingTourAction
  | OnboardingLinkAction
  | OnboardingCustomAction;

export interface OnboardingItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: OnboardingItemAction;
  disabled?: boolean;
}

export interface OnboardingProgress {
  completed: number;
  total: number;
  percentage: number;
  completedIds: string[];
}

export interface OnboardingLabels {
  progress: (completed: number, total: number) => ReactNode;
  completed: string;
  loading: string;
  error: string;
  done: ReactNode;
  close: string;
  collapse: string;
  expand: string;
}

export interface OnboardingPersistConfig {
  key: string;
  type?: StorageType;
}

export interface OnboardingChecklistProps {
  items: OnboardingItem[];
  title?: ReactNode;
  description?: ReactNode;
  completedIds?: string[];
  defaultCompletedIds?: string[];
  onCompletedIdsChange?: (completedIds: string[]) => void;
  onProgressChange?: (progress: OnboardingProgress) => void;
  onComplete?: (progress: OnboardingProgress) => void;
  onItemAction?: (item: OnboardingItem) => void;
  onActionError?: (error: unknown, item: OnboardingItem) => void;
  persist?: OnboardingPersistConfig;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  labels?: Partial<OnboardingLabels>;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  showProgressBar?: boolean;
  emptyState?: ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  zIndex?: number;
}
