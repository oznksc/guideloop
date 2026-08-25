import { ReactNode, type ErrorInfo } from 'react';
import type {
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
  StepTrigger,
  WaitForTargetConfig,
  AdditionalSpotlightTarget,
  SpotlightShape,
  TourEndReason,
  TargetMissingInfo,
} from '@guideloop/core';
import type { Placement } from '@popperjs/core';

/** Document-level portal by default, or a host-provided node / selector. */
export type PortalContainer = HTMLElement | string;

export type {
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  AdditionalSpotlightTarget,
  SpotlightHole,
  StepTrigger,
  StepStatus,
  WaitForTargetConfig,
  TourEndReason,
  TargetMissingInfo,
} from '@guideloop/core';

export type ImageContent = {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
} | {
  type: 'svg';
  component: ReactNode;
  width?: number;
  height?: number;
};

export interface ButtonLabels {
  next?: string;
  prev?: string;
  skip?: string;
  finish?: string;
}

export interface ShowButtons {
  next?: boolean;
  previous?: boolean;
  close?: boolean;
}

export interface StepActions {
  nextButtonClickElementId?: string;
  prevButtonClickElementId?: string;
  skipButtonClickElementId?: string;
  nextButtonOnClick?: () => void;
  prevButtonOnClick?: () => void;
  skipButtonOnClick?: () => void;
  nextDelay?: number;
  prevDelay?: number;
  skipDelay?: number;
}

export interface StepUI {
  buttonLabels?: ButtonLabels;
  buttons?: {
    next?: ReactNode;
    prev?: ReactNode;
    close?: ReactNode;
  };
  image?: ImageContent;
  icon?: ReactNode;
  showButtons?: ShowButtons;
  spotlightPadding?: number;
  spotlightShape?: SpotlightShape;
  additionalTargets?: Array<string | AdditionalSpotlightTarget>;
}

export interface StepHooks {
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
  branch?: () => number | Promise<number>;
}

export interface StepTriggers {
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
}

export interface Step extends StepActions, StepUI, StepHooks, StepTriggers {
  target: string;
  title: string;
  content: string | ReactNode;
  placement?: Placement;
}


export interface GuideLoopHandle {
  /** Remeasure target geometry after layout, zoom, scroll, or canvas transform. */
  refreshTargets: () => void;
}

export interface GuideLoopProps {
  steps: Step[];
  isOpen: boolean;
  /**
   * Tour ended. Always fires for skip, complete, and dismiss.
   * Use the reason argument (or `onSkip` / `onComplete`) instead of inferring.
   */
  onClose: (reason?: TourEndReason) => void;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  initialStep?: number;
  overlay?: boolean;
  keyboard?: boolean;
  scrollSmooth?: boolean;
  spotlightPadding?: number;
  animations?: AnimationConfig;
  onStepChange?: (step: number) => void;
  /** Finish / Next on the last step. Not fired for Skip. */
  onComplete?: () => void;
  /** Skip button. Not fired for overlay click, Escape, or Finish. */
  onSkip?: () => void;
  /**
   * Primary or additional target was missing when the step rendered
   * (or after `waitForTarget` timed out). The tour stays mounted with a
   * centered fallback tooltip — it does not throw.
   */
  onTargetMissing?: (info: TargetMissingInfo) => void;
  zIndex?: number;
  defaultButtonLabels?: ButtonLabels;
  persist?: PersistConfig;
  debug?: boolean | 'auto';
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
  /**
   * Portal mount node (element or selector). Defaults to `#guideloop-portal`
   * on `document.body`. Override for transformed ancestors or embedded webviews.
   */
  portalContainer?: PortalContainer | null;
  /**
   * Change this value after layout / zoom / canvas pan to remeasure
   * spotlight and tooltip geometry. Equivalent to `ref.refreshTargets()`.
   */
  refreshKey?: string | number;
}
