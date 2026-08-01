import type { Step, StepStatus } from '../types';

export interface StepManagerConfig {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export interface StepManager {
  currentStep: number;
  currentStepData: Step | null;
  validSteps: Step[];
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  enterStep: (target: number) => Promise<void>;
  leaveStep: () => Promise<void>;
  setStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
  stepStatus: StepStatus;
}

export function createStepManager(config: StepManagerConfig): StepManager {
  let currentStep = config.initialStep;
  let stepStatus: StepStatus = 'idle';
  const validSteps = config.steps.filter(step => !step.condition || step.condition());

  const advanceTo = async (target: number): Promise<void> => {
    stepStatus = 'pending';
    try {
      const targetStep = validSteps[target];
      if (targetStep?.beforeStep) {
        await targetStep.beforeStep();
      }
      currentStep = target;
      stepStatus = 'success';
      config.onStepChange?.(target);
    } catch (error) {
      console.error('Error during step transition:', error);
      stepStatus = 'error';
      currentStep = target;
    }
  };

  const leaveStep = async (): Promise<void> => {
    const currentData = validSteps[currentStep];
    if (currentData?.afterStep) {
      await currentData.afterStep();
    }
  };

  const enterStep = async (target: number): Promise<void> => {
    if (target < 0 || target >= validSteps.length) {
      return;
    }
    await advanceTo(target);
  };

  const nextStep = async (): Promise<void> => {
    const currentData = validSteps[currentStep];

    const branchTarget = await currentData?.branch?.();
    if (typeof branchTarget === 'number') {
      if (branchTarget < validSteps.length) {
        await leaveStep();
        await advanceTo(branchTarget);
      } else {
        config.onComplete?.();
      }
      return;
    }

    const next = currentStep + 1;
    if (next < validSteps.length) {
      await leaveStep();
      await advanceTo(next);
    } else {
      config.onComplete?.();
    }
  };

  const prevStep = async (): Promise<void> => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      await leaveStep();
      await advanceTo(prev);
    }
  };

  const setStep = (step: number): void => {
    currentStep = step;
  };

  return {
    get currentStep() { return currentStep; },
    get currentStepData() { return validSteps[currentStep] || null; },
    validSteps,
    nextStep,
    prevStep,
    enterStep,
    leaveStep,
    setStep,
    get isFirstStep() { return validSteps.length === 0 || currentStep === 0; },
    get isLastStep() { return validSteps.length === 0 || currentStep === validSteps.length - 1; },
    get totalSteps() { return validSteps.length; },
    get stepStatus() { return stepStatus; },
  };
}
