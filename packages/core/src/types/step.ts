import type { SpotlightShape } from '../geometry/spotlightShape';

export type {
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  SpotlightRect,
  ResolvedSpotlightShape,
} from '../geometry/spotlightShape';

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

export interface AdditionalSpotlightTarget {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}

export interface SpotlightHole {
  top: number;
  left: number;
  width: number;
  height: number;
  shape: SpotlightShape;
  padding?: number;
}

export interface Step {
  target: string;
  title?: string;
  content?: string;
  placement?: string;
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
  spotlightPadding?: number;
  spotlightShape?: SpotlightShape;
  additionalTargets?: (string | AdditionalSpotlightTarget)[];
  beforeStep?: () => void | Promise<void>;
  afterStep?: () => void | Promise<void>;
  branch?: () => number | void | Promise<number | void>;
  condition?: () => boolean;

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

  /** Allow framework-specific extra properties (ReactNode content, etc.) */
  [key: string]: unknown;
}

export interface SpotlightTarget {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}
