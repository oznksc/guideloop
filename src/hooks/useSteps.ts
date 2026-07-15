import { useState, useCallback, useEffect } from 'react';
import { Step, StepStatus } from '../components/GuideLoop/types';

interface UseStepsProps {
  steps: Step[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseStepsReturn {
  currentStepData: Step;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
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

  const nextStep = useCallback(async () => {
    const currentData = validSteps[currentStep];

    const branchTarget = await currentData?.branch?.();
    if (typeof branchTarget === 'number') {
      if (branchTarget < validSteps.length) {
        await currentData?.afterStep?.();
        await advanceTo(branchTarget);
      } else {
        onComplete?.();
      }
      return;
    }

    const next = currentStep + 1;
    if (next < validSteps.length) {
      await currentData?.afterStep?.();
      await advanceTo(next);
    } else {
      onComplete?.();
    }
  }, [currentStep, validSteps, advanceTo, onComplete]);

  const prevStep = useCallback(async () => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      await validSteps[currentStep]?.afterStep?.();
      await advanceTo(prev);
    }
  }, [currentStep, validSteps, advanceTo]);

  return {
    currentStepData: validSteps[currentStep],
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === validSteps.length - 1,
    totalSteps: validSteps.length,
    setCurrentStep,
    stepStatus,
  };
};
