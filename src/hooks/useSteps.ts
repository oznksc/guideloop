import { useState, useCallback, useEffect } from 'react';
import { Step } from '../components/GuideLoop/types';

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
}

export const useSteps = ({
  steps,
  initialStep,
  onStepChange,
  onComplete,
}: UseStepsProps): UseStepsReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [validSteps, setValidSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Filter steps based on conditions
    const filtered = steps.filter(step => !step.condition || step.condition());
    setValidSteps(filtered);
  }, [steps]);

  const nextStep = useCallback(async () => {
    const currentStepData = validSteps[currentStep];
    
    try {
      // Execute beforeStep hook if exists
      await currentStepData?.afterStep?.();
      
      const next = currentStep + 1;
      if (next < validSteps.length) {
        // Execute next step's beforeStep hook
        await validSteps[next]?.beforeStep?.();
        
        setCurrentStep(next);
        onStepChange?.(next);
      } else {
        onComplete?.();
      }
    } catch (error) {
      console.error('Error during step transition:', error);
    }
  }, [currentStep, validSteps, onStepChange, onComplete]);

  const prevStep = useCallback(async () => {
    const prev = currentStep - 1;
    if (prev >= 0) {
      await validSteps[prev]?.beforeStep?.();
      setCurrentStep(prev);
      onStepChange?.(prev);
    }
  }, [currentStep, validSteps, onStepChange]);

  return {
    currentStepData: validSteps[currentStep],
    nextStep,
    prevStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === validSteps.length - 1,
    totalSteps: validSteps.length,
    setCurrentStep,
  };
};