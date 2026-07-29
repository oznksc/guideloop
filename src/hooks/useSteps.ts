import { useState, useCallback, useEffect } from 'react';
import { Step, StepStatus } from '../components/GuideLoop/types';

interface UseStepsProps {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseStepsReturn {
  /** Single source of truth for the active step index within validSteps. */
  currentStep: number;
  currentStepData: Step;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  /**
   * Runs the current step's `afterStep` hook (leave lifecycle).
   * Used by action paths that resume via `enterStep` after DOM work.
   */
  leaveStep: () => Promise<void>;
  /**
   * Enters a step index, running that step's `beforeStep` hook.
   * Does not run the previous step's `afterStep`.
   */
  enterStep: (target: number) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  /** Direct index set without lifecycle hooks (restore / open / forced jump). */
  setCurrentStep: (step: number) => void;
  stepStatus: StepStatus;
}

export const useSteps = ({
  steps,
  initialStep,
  onStepChange,
  onComplete,
}: UseStepsProps): UseStepsReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [validSteps, setValidSteps] = useState<Step[]>([]);
  const [stepStatus, setStepStatus] = useState<StepStatus>('idle');

  useEffect(() => {
    const filtered = steps.filter(step => !step.condition || step.condition());
    setValidSteps(filtered);
  }, [steps]);

  const advanceTo = useCallback(async (target: number) => {
    setStepStatus('pending');
    try {
      const targetStep = validSteps[target];
      if (targetStep?.beforeStep) {
        await targetStep.beforeStep();
      }
      setCurrentStep(target);
      setStepStatus('success');
      onStepChange?.(target);
    } catch (error) {
      console.error('Error during step transition:', error);
      setStepStatus('error');
      setCurrentStep(target);
    }
  }, [validSteps, onStepChange]);

  const leaveStep = useCallback(async () => {
    const currentData = validSteps[currentStep];
    if (currentData?.afterStep) {
      await currentData.afterStep();
    }
  }, [validSteps, currentStep]);

  const enterStep = useCallback(async (target: number) => {
    if (target < 0 || target >= validSteps.length) {
      return;
    }
    await advanceTo(target);
  }, [validSteps, advanceTo]);

  const nextStep = useCallback(async () => {
    const currentData = validSteps[currentStep];

    const branchTarget = await currentData?.branch?.();
    if (typeof branchTarget === 'number') {
      if (branchTarget < validSteps.length) {
        await leaveStep();
        await advanceTo(branchTarget);
      } else {
        onComplete?.();
      }
      return;
    }

    const next = currentStep + 1;
    if (next < validSteps.length) {
      await leaveStep();
      await advanceTo(next);
    } else {
      onComplete?.();
    }
  }, [currentStep, validSteps, leaveStep, advanceTo, onComplete]);

  const prevStep = useCallback(async () => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      await leaveStep();
      await advanceTo(prev);
    }
  }, [currentStep, validSteps, leaveStep, advanceTo]);

  return {
    currentStep,
    currentStepData: validSteps[currentStep],
    nextStep,
    prevStep,
    leaveStep,
    enterStep,
    isFirstStep: validSteps.length === 0 || currentStep === 0,
    isLastStep: validSteps.length === 0 || currentStep === validSteps.length - 1,
    totalSteps: validSteps.length,
    setCurrentStep,
    stepStatus,
  };
};
