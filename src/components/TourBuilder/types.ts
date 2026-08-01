import type { Placement } from '@popperjs/core';
import type { SpotlightShapeName, StepTrigger } from '../GuideLoop/types';
import { isDevelopmentEnv } from '../../utils/env';

export interface BuilderStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: Placement;
  spotlightShape: SpotlightShapeName;
  spotlightPadding?: number;
  trigger?: StepTrigger | '';
  additionalTargets?: string[];
}

export type BuilderMode = 'idle' | 'pick';

export type PickIntent =
  | { type: 'add' }
  | { type: 'repick'; stepId: string }
  | { type: 'add-additional'; stepId: string };

export interface TourBuilderProps {
  /**
   * Force show/hide. Default: auto — only mounts when
   * `process.env.NODE_ENV === 'development'` (or `enabled={true}`).
   */
  enabled?: boolean | 'auto';
  /** localStorage key for draft steps. */
  storageKey?: string;
  /** z-index for FAB + panel (default 2147483000). */
  zIndex?: number;
  /** Start with the panel open. */
  defaultOpen?: boolean;
  /** Called whenever the draft steps change. */
  onStepsChange?: (steps: BuilderStep[]) => void;
}

export const PLACEMENTS: Placement[] = [
  'top',
  'bottom',
  'left',
  'right',
  'auto',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
  'right-start',
  'right-end',
];

export const SHAPES: SpotlightShapeName[] = ['rect', 'circle', 'ellipse'];

export const TRIGGERS: Array<StepTrigger | ''> = [
  '',
  'click',
  'change',
  'blur',
  'hover',
  'drag',
];

export const DEFAULT_STORAGE_KEY = 'guideloop_tour_builder_draft_v1';

export function createEmptyStep(partial?: Partial<BuilderStep>): BuilderStep {
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    target: '',
    title: 'New step',
    content: 'Describe what the user should do.',
    placement: 'bottom',
    spotlightShape: 'rect',
    spotlightPadding: 8,
    trigger: '',
    additionalTargets: [],
    ...partial,
  };
}

export function isValidPlacement(value: unknown): value is Placement {
  return typeof value === 'string' && (PLACEMENTS as string[]).includes(value);
}

export function isValidShape(value: unknown): value is SpotlightShapeName {
  return typeof value === 'string' && (SHAPES as string[]).includes(value);
}

export function resolveBuilderEnabled(
  enabled: boolean | 'auto' | undefined
): boolean {
  if (enabled === true) return true;
  if (enabled === false) return false;
  // 'auto' / omitted — development only (never production or test)
  return isDevelopmentEnv();
}
