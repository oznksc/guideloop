// src/components/GuideLoop/index.tsx
import React, { useCallback, useEffect } from 'react';
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
  zIndex = 1000,
  defaultButtonLabels, // Eksik prop eklendi
}) => {
  const {
    currentStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    totalSteps,
  } = useSteps({
    steps,
    initialStep,
    onStepChange,
    onComplete,
  });

  const handleElementClick = useCallback(async (elementId: string | undefined, delay: number = 0) => {
    if (!elementId) return;

    const element = document.querySelector(elementId);
    if (!element) {
      console.warn(`Element with id '${elementId}' not found`);
      return;
    }

    // Element'e scroll et ve görünür olmasını bekle
    await scrollIntoView(element, { behavior: 'smooth' });

    // Küçük bir bekleme ekleyelim ki scroll tamamlansın
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Click event'i oluştur
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(clickEvent);
      
      // Delay varsa bekle
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error clicking element with id '${elementId}':`, error);
    }
  }, []);

  const handleNext = useCallback(async () => {
    const currentStepData = steps[currentStep];
    
    try {
      // 1. beforeStep hook'unu çalıştır
      if (currentStepData?.beforeStep) {
        await currentStepData.beforeStep();
      }

      // 2. Eğer clickBeforeNext true ise ve nextButtonClickElementId varsa
      if (currentStepData?.nextButtonClickElementId) {
        await handleElementClick(
          currentStepData.nextButtonClickElementId, 
          currentStepData.nextDelay || 0
        );
      }

      // 3. afterStep hook'unu çalıştır
      if (currentStepData?.afterStep) {
        await currentStepData.afterStep();
      }

      // 4. Bir sonraki adıma geç
      nextStep();
    } catch (error) {
      console.error('Error during step transition:', error);
    }
  }, [currentStep, steps, nextStep, handleElementClick]);

  const handlePrev = useCallback(async () => {
    const currentStepData = steps[currentStep];
    
    try {
      if (currentStepData?.prevButtonClickElementId) {
        await handleElementClick(
          currentStepData.prevButtonClickElementId, 
          currentStepData.prevDelay || 0
        );
      }

      prevStep();
    } catch (error) {
      console.error('Error during step transition:', error);
    }
  }, [currentStep, steps, prevStep, handleElementClick]);

  const handleSkip = useCallback(async () => {
    const currentStepData = steps[currentStep];
    
    try {
      if (currentStepData?.skipButtonClickElementId) {
        await handleElementClick(currentStepData.skipButtonClickElementId);
      }

      onSkip?.();
      onClose();
    } catch (error) {
      console.error('Error during skip:', error);
    }
  }, [currentStep, steps, onSkip, onClose, handleElementClick]);

  const currentStepData = steps[currentStep];
  const spotlightPosition = useSpotlight(currentStepData?.target, spotlightPadding);

  useKeyboard({
    enabled: keyboard && isOpen,
    onEscape: handleSkip,
    onArrowRight: handleNext,
    onArrowLeft: handlePrev,
  });

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

  if (!isOpen) return null;

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