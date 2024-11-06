import React, { useCallback, useEffect, useState } from 'react';
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
  const [lastCompletedStep, setLastCompletedStep] = useState<number>(0);
  const [tourVisible, setTourVisible] = useState(isOpen);

  const {
    currentStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    totalSteps,
  } = useSteps({
    steps,
    initialStep: lastCompletedStep,
    onStepChange,
    onComplete,
  });

  const currentStepData = steps[currentStep];
  const spotlightPosition = useSpotlight(currentStepData?.target || '', spotlightPadding);

  const triggerElementClick = (element: Element) => {
    // HTMLElement'e cast ederek click() metodunu kullanabiliriz
    if (element instanceof HTMLElement) {
      element.click();
    } else {
      // HTMLElement değilse MouseEvent ile tıklama simüle et
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(clickEvent);
    }
  };

  const handleElementClick = useCallback(async (
    elementId: string | undefined, 
    delay: number = 0,
    onClick?: () => void,
    nextStepIndex?: number
  ) => {
    if (!elementId && !onClick) return;

    try {
      if (onClick) {
        await onClick();
      }

      if (elementId) {
        const element = document.querySelector(elementId);
        if (!element) {
          console.warn(`Element with id '${elementId}' not found`);
          return;
        }

        await scrollIntoView(element, { behavior: 'smooth' });
        
        setTourVisible(false);
        
        triggerElementClick(element);

        if (typeof nextStepIndex === 'number') {
          setLastCompletedStep(nextStepIndex);
          setTimeout(() => {
            document.dispatchEvent(createRestartEvent(nextStepIndex));
          }, delay || RESTART_DELAY);
        }
      }
    } catch (error) {
      console.error('Error during element click:', error);
      if (typeof nextStepIndex === 'number') {
        nextStep();
      }
    }
  }, [nextStep]);

  const handleNext = useCallback(async () => {
    const stepData = currentStepData;
    
    try {
      if (stepData?.beforeStep) {
        await stepData.beforeStep();
      }

      if (stepData?.nextButtonClickElementId) {
        await handleElementClick(
          stepData.nextButtonClickElementId,
          stepData.nextDelay,
          stepData.nextButtonOnClick,
          currentStep + 1
        );
      } else {
        nextStep();
      }

      if (stepData?.afterStep) {
        await stepData.afterStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
      nextStep();
    }
  }, [currentStep, currentStepData, nextStep, handleElementClick]);

  const handlePrev = useCallback(async () => {
    const stepData = currentStepData;
    
    try {
      if (stepData?.prevButtonClickElementId) {
        await handleElementClick(
          stepData.prevButtonClickElementId,
          stepData.prevDelay,
          stepData.prevButtonOnClick,
          currentStep - 1
        );
      } else {
        prevStep();
      }
    } catch (error) {
      console.error('Error during previous step:', error);
      prevStep();
    }
  }, [currentStep, currentStepData, prevStep, handleElementClick]);

  const handleSkip = useCallback(async () => {
    const stepData = currentStepData;
    
    try {
      if (stepData?.skipButtonClickElementId) {
        await handleElementClick(
          stepData.skipButtonClickElementId,
          stepData.skipDelay,
          stepData.skipButtonOnClick
        );
      }
    } catch (error) {
      console.error('Error during skip:', error);
    }
    
    onSkip?.();
    onClose();
  }, [currentStep, currentStepData, onSkip, onClose, handleElementClick]);

  useEffect(() => {
    const handleRestart = (event: Event) => {
      const { detail: { nextStep } } = event as GuideRestartEvent;
      
      setTimeout(() => {
        setTourVisible(true);
        setLastCompletedStep(nextStep);
      }, RESTART_DELAY);
    };
  
    document.addEventListener(GUIDE_RESTART_EVENT, handleRestart);
  
    return () => {
      document.removeEventListener(GUIDE_RESTART_EVENT, handleRestart);
    };
  
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTourVisible(true);
      setLastCompletedStep(initialStep);
    }
  }, [isOpen, initialStep]);

  useEffect(() => {
    if (isOpen && scrollSmooth) {
      const element = document.querySelector(currentStepData?.target);
      if (element) {
        scrollIntoView(element, { behavior: 'smooth' });
      }
    }
  }, [isOpen, currentStep, currentStepData?.target, scrollSmooth]);

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
          zIndex: 2000,
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
          currentStep={currentStep}
          totalSteps={totalSteps}
          animation={animations?.tooltip}
          defaultButtonLabels={defaultButtonLabels}
          style={{
            position: 'absolute',
            zIndex: zIndex + 3,
          }}
        />

        <Progress 
          current={currentStep + 1}
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