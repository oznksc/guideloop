import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { useSteps } from '../../hooks/useSteps';
import { useKeyboard } from '../../hooks/useKeyboard';
import { scrollIntoView } from '../../utils/scroll';
import type { GuideLoopProps } from './types';
import { Portal } from './Portal';
import { MaskedOverlay } from '../MaskedOverlay';
import { useSpotlight } from '../../hooks/useSpotlight';

const GUIDE_RESTART_EVENT = 'guideRestart';
const RESTART_DELAY = 100;
type GuideRestartEvent = CustomEvent<{ nextStep: number }>;

export const createRestartEvent = (nextStep: number) => 
  new CustomEvent(GUIDE_RESTART_EVENT, { 
    detail: { nextStep } 
  });

export const GuideLoop: React.FC<GuideLoopProps> = ({
  steps,
  isOpen,
  onClose,
  theme = 'tailwind',
  customTheme,
  initialStep = 0,
  overlay = true,
  keyboard = true,
  scrollSmooth = true,
  spotlightPadding = 8,
  animations,
  onStepChange,
  onComplete,
  onSkip,
  zIndex = 2000,
  defaultButtonLabels,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [tourVisible, setTourVisible] = useState(isOpen);
  const [targetElement, setTargetElement] = useState<string>('');
  const processingRef = useRef(false);

  const {
    nextStep: goToNextStep,
    prevStep: goToPrevStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    currentStepData,
    setCurrentStep
  } = useSteps({
    steps,
    initialStep: currentStepIndex,
    onStepChange,
    onComplete,
  });

  const spotlightPosition = useSpotlight(targetElement, spotlightPadding);

  useEffect(() => {
    if (currentStepData?.target) {
      setTargetElement(currentStepData.target);
    }
  }, [currentStepData]);

  const triggerElementClick = async (element: Element): Promise<void> => {
    return new Promise((resolve) => {
      if (element instanceof HTMLElement) {
        element.click();
      } else {
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(clickEvent);
      }
      
      setTimeout(resolve, 100);
    });
  };

  const handleElementClick = useCallback(async (
    elementId: string | undefined,
    delay: number = 0,
    onClick?: () => void,
    nextStepIndex?: number
  ) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      if (onClick) {
        await Promise.resolve(onClick());
      }

      if (elementId) {
        const element = document.querySelector(elementId);
        if (!element) {
          console.warn(`Element with id '${elementId}' not found`);
          return;
        }

        if (scrollSmooth) {
          await scrollIntoView(element, { behavior: 'smooth' });
        }
        
        setTourVisible(false);
        await triggerElementClick(element);

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (typeof nextStepIndex === 'number') {
          document.dispatchEvent(createRestartEvent(nextStepIndex));
        }

      } else if (typeof nextStepIndex === 'number') {
        setCurrentStepIndex(nextStepIndex);
        setCurrentStep(nextStepIndex);
      }
    } catch (error) {
      console.error('Error during element click:', error);
      if (typeof nextStepIndex === 'number') {
        setCurrentStepIndex(nextStepIndex);
        setCurrentStep(nextStepIndex);
      }
    } finally {
      processingRef.current = false;
    }
  }, [steps, setCurrentStep, scrollSmooth]);

  const handleNext = useCallback(async () => {
    const stepData = currentStepData;
    const nextStepIndex = currentStepIndex + 1;
    
    try {
      if (stepData?.beforeStep) {
        await stepData.beforeStep();
      }

      if (stepData?.nextButtonClickElementId || stepData?.nextButtonOnClick) {
        await handleElementClick(
          stepData.nextButtonClickElementId,
          stepData.nextDelay,
          stepData.nextButtonOnClick,
          nextStepIndex
        );
      } else {
        setCurrentStepIndex(nextStepIndex);
        goToNextStep();
      }

      if (stepData?.afterStep) {
        await stepData.afterStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
      setCurrentStepIndex(nextStepIndex);
      goToNextStep();
    }
  }, [currentStepIndex, currentStepData, goToNextStep, handleElementClick]);

  const handlePrev = useCallback(async () => {
    const stepData = currentStepData;
    const prevStepIndex = currentStepIndex - 1;
    
    try {
      if (stepData?.prevButtonClickElementId || stepData?.prevButtonOnClick) {
        await handleElementClick(
          stepData.prevButtonClickElementId,
          stepData.prevDelay,
          stepData.prevButtonOnClick,
          prevStepIndex
        );
      } else {
        setCurrentStepIndex(prevStepIndex);
        goToPrevStep();
      }
    } catch (error) {
      console.error('Error during previous step:', error);
      setCurrentStepIndex(prevStepIndex);
      goToPrevStep();
    }
  }, [currentStepIndex, currentStepData, goToPrevStep, handleElementClick]);

  const handleSkip = useCallback(async () => {
    const stepData = currentStepData;
    
    try {
      if (stepData?.skipButtonClickElementId || stepData?.skipButtonOnClick) {
        await handleElementClick(
          stepData.skipButtonClickElementId,
          stepData.skipDelay,
          stepData.skipButtonOnClick
        );
      }
      onSkip?.();
      onClose();
    } catch (error) {
      console.error('Error during skip:', error);
      onSkip?.();
      onClose();
    }
  }, [currentStepData, onSkip, onClose, handleElementClick]);

  useEffect(() => {
    const handleRestart = (event: Event) => {
      const { detail: { nextStep } } = event as GuideRestartEvent;
      
      setTimeout(() => {
        setTourVisible(true);
        setCurrentStepIndex(nextStep);
        setCurrentStep(nextStep);
      }, RESTART_DELAY);
    };

    document.addEventListener(GUIDE_RESTART_EVENT, handleRestart);
    return () => {
      document.removeEventListener(GUIDE_RESTART_EVENT, handleRestart);
    };
  }, [setCurrentStep]);

  useEffect(() => {
    if (isOpen) {
      setTourVisible(true);
      setCurrentStepIndex(initialStep);
      const initialStepData = steps[initialStep];
      if (initialStepData?.target) {
        setTargetElement(initialStepData.target);
      }
    }
  }, [isOpen, initialStep, steps]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useKeyboard({
    enabled: keyboard && tourVisible,
    onEscape: handleSkip,
    onArrowRight: handleNext,
    onArrowLeft: handlePrev,
  });

  if (!isOpen || !tourVisible) {
    return null;
  }

  return (
    <Portal>
      <div 
        className="guideloop-container" 
        style={{ 
          position: 'fixed',
          inset: 0,
          zIndex,
          isolation: 'isolate',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Guided tour"
      >
        {overlay && (
          <MaskedOverlay 
            targetRect={spotlightPosition}
            padding={spotlightPadding}
            onClick={handleSkip}
            animation={animations?.overlay}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: zIndex + 1,
            }}
          />
        )}

        <Spotlight 
          position={spotlightPosition}
          padding={spotlightPadding}
          animation={animations?.spotlight}
          style={{
            position: 'absolute',
            zIndex: zIndex + 2,
          }}
        />

        <Tooltip
          step={currentStepData}
          theme={theme}
          customTheme={customTheme}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleSkip}
          isFirst={isFirstStep}
          isLast={isLastStep}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          animation={animations?.tooltip}
          defaultButtonLabels={defaultButtonLabels}
          style={{
            position: 'absolute',
            zIndex: zIndex + 3,
          }}
        />

        <Progress 
          current={currentStepIndex + 1}
          total={totalSteps}
          theme={theme}
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: zIndex + 3,
          }}
        />
      </div>
    </Portal>
  );
};

export default GuideLoop;