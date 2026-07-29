import type { StepStatus, StepTrigger, WaitForTargetConfig } from '../GuideLoop/types';

export type DebugEventType =
  | 'open'
  | 'close'
  | 'next'
  | 'prev'
  | 'skip'
  | 'trigger'
  | 'step-change'
  | 'target-missing'
  | 'target-found'
  | 'wait'
  | 'error'
  | 'info';

export interface DebugEvent {
  id: number;
  ts: number;
  type: DebugEventType;
  message: string;
  stepIndex?: number;
}

export interface TargetDebugInfo {
  selector: string;
  found: boolean;
  role: 'primary' | 'additional';
  rect?: { top: number; left: number; width: number; height: number };
  shape?: string;
}

export interface DebugSnapshot {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepStatus: StepStatus;
  targetReady: boolean;
  targetWaiting: boolean;
  tourVisible: boolean;
  targets: TargetDebugInfo[];
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
  stepEnteredAt: number;
  events: DebugEvent[];
  persistKey?: string;
}

export interface DebugHUDProps {
  snapshot: DebugSnapshot;
  zIndex?: number;
  /** Start collapsed */
  defaultCollapsed?: boolean;
}
