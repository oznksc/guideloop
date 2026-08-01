import { useState, useCallback, useEffect, useRef } from 'react';
import { createStepManager, type StepStatus } from '@guideloop/core';

interface UseStepsProps {
  steps: any[];
  initialStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseStepsReturn {
  currentStep: number;
  currentStepData: any;
  nextStep: () => Promise<void>;
  prevStep: () => Promise<void>;
  leaveStep: () => Promise<void>;
  enterStep: (target: number) => Promise<void>;
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
  const managerRef = useRef<ReturnType<typeof createStepManager> | null>(null);
  const [, forceRender] = useState({});

  useEffect(() => {
    managerRef.current = createStepManager({
      steps,
      initialStep,
      onStepChange,
      onComplete,
    });
    forceRender({});
  }, [steps, initialStep, onStepChange, onComplete]);

  const currentStep = managerRef.current?.currentStep ?? initialStep;
  const currentStepData = managerRef.current?.currentStepData ?? undefined;
  const isFirstStep = managerRef.current?.isFirstStep ?? true;
  const isLastStep = managerRef.current?.isLastStep ?? true;
  const totalSteps = managerRef.current?.totalSteps ?? 0;
  const stepStatus = managerRef.current?.stepStatus ?? 'idle';

  const nextStep = useCallback(async () => {
    await managerRef.current?.nextStep();
    forceRender({});
  }, []);

  const prevStep = useCallback(async () => {
    await managerRef.current?.prevStep();
    forceRender({});
  }, []);

  const leaveStep = useCallback(async () => {
    await managerRef.current?.leaveStep();
  }, []);

  const enterStep = useCallback(async (target: number) => {
    await managerRef.current?.enterStep(target);
    forceRender({});
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    managerRef.current?.setStep(step);
    forceRender({});
  }, []);

  return {
    currentStep,
    currentStepData,
    nextStep,
    prevStep,
    leaveStep,
    enterStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    setCurrentStep,
    stepStatus,
  };
};
