import type { Placement } from '@popperjs/core';
import type { SpotlightShapeName, StepTrigger } from 'guideloop';

/** Serializable step used by the Visual Tour Builder (export-friendly). */
export interface BuilderStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: Placement;
  spotlightShape: SpotlightShapeName;
  spotlightPadding?: number;
  trigger?: StepTrigger | '';
  /** Extra selectors highlighted with the primary target. */
  additionalTargets?: string[];
}

export type BuilderMode = 'idle' | 'pick' | 'preview';

export type PickIntent =
  | { type: 'add' }
  | { type: 'repick'; stepId: string }
  | { type: 'add-additional'; stepId: string };

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

export const STORAGE_KEY = 'guideloop-tour-builder-v1';

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
