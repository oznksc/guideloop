import type { Placement } from '@popperjs/core';
import type { SpotlightShapeName, StepTrigger } from '../GuideLoop/types';

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
  enabled?: boolean | 'auto';
  storageKey?: string;
  zIndex?: number;
  defaultOpen?: boolean;
  onStepsChange?: (steps: BuilderStep[]) => void;
}
