import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { useSteps } from '../../hooks/useSteps';
import { useKeyboard } from '../../hooks/useKeyboard';
import { scrollIntoView } from '../../utils/scroll';
import { injectKeyframes } from '../../utils/animation';
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

  // Güvenli bir şekilde target elementini güncelle
  const updateTargetElement = useCallback((stepData?: typeof currentStepData) => {
    if (stepData?.target) {
      setTargetElement(stepData.target);
    }
  }, []);

  // spotlightPosition'ı sadece geçerli bir targetElement varsa hesapla
  const spotlightPosition = useSpotlight(targetElement || 'body', spotlightPadding);

  useEffect(() => {
    updateTargetElement(currentStepData);
  }, [currentStepData, updateTargetElement]);

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
    delay = 0,
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
    if (!currentStepData || processingRef.current) return;
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex >= steps.length) return;
    
    try {
      if (currentStepData?.beforeStep) {
        await currentStepData.beforeStep();
      }

      if (currentStepData?.nextButtonClickElementId || currentStepData?.nextButtonOnClick) {
        await handleElementClick(
          currentStepData.nextButtonClickElementId,
          currentStepData.nextDelay,
          currentStepData.nextButtonOnClick,
          nextStepIndex
        );
      } else {
        setCurrentStepIndex(nextStepIndex);
        goToNextStep();
      }

      if (currentStepData?.afterStep) {
        await currentStepData.afterStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
      setCurrentStepIndex(nextStepIndex);
      goToNextStep();
    }
  }, [currentStepIndex, currentStepData, steps.length, goToNextStep, handleElementClick]);

  const handlePrev = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;
    
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex < 0) return;
    
    try {
      if (currentStepData?.prevButtonClickElementId || currentStepData?.prevButtonOnClick) {
        await handleElementClick(
          currentStepData.prevButtonClickElementId,
          currentStepData.prevDelay,
          currentStepData.prevButtonOnClick,
          prevStepIndex
        );
      } else {
        setCurrentStepIndex(prevStepIndex);
        goToPrevStep();
        // Önceki adımın hedef elementini güvenli bir şekilde güncelle
        updateTargetElement(steps[prevStepIndex]);
      }
    } catch (error) {
      console.error('Error during previous step:', error);
      setCurrentStepIndex(prevStepIndex);
      goToPrevStep();
      updateTargetElement(steps[prevStepIndex]);
    }
  }, [currentStepIndex, currentStepData, steps, goToPrevStep, handleElementClick, updateTargetElement]);

  const handleSkip = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;
    
    try {
      if (currentStepData?.skipButtonClickElementId || currentStepData?.skipButtonOnClick) {
        await handleElementClick(
          currentStepData.skipButtonClickElementId,
          currentStepData.skipDelay,
          currentStepData.skipButtonOnClick
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
        updateTargetElement(steps[nextStep]);
      }, RESTART_DELAY);
    };

    document.addEventListener(GUIDE_RESTART_EVENT, handleRestart);
    return () => {
      document.removeEventListener(GUIDE_RESTART_EVENT, handleRestart);
    };
  }, [setCurrentStep, steps, updateTargetElement]);

  useEffect(() => {
    if (isOpen) {
      injectKeyframes();
      setTourVisible(true);
      setCurrentStepIndex(initialStep);
      updateTargetElement(steps[initialStep]);
    }
  }, [isOpen, initialStep, steps, updateTargetElement]);

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

  if (!isOpen || !tourVisible || !currentStepData) {
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