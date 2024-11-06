import React, { useEffect } from 'react';
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

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  const currentStepData = steps[currentStep];
  const spotlightPosition = useSpotlight(currentStepData?.target, spotlightPadding);
  

  useKeyboard({
    enabled: keyboard && isOpen,
    onEscape: onClose,
    onArrowRight: nextStep,
    onArrowLeft: prevStep,
  });

  const tooltipPosition = {
    ...spotlightPosition,
    x: spotlightPosition.left,
    y: spotlightPosition.top,
    bottom: spotlightPosition.top + spotlightPosition.height,
    right: spotlightPosition.left + spotlightPosition.width
  };

  useEffect(() => {
    if (isOpen && scrollSmooth) {
      const element = document.querySelector(currentStepData?.target);
      if (element) {
        scrollIntoView(element, { behavior: 'smooth' });
      }
    }
  }, [isOpen, currentStep, currentStepData?.target, scrollSmooth]);

  // Handle body scroll lock
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
          position={tooltipPosition}
          theme={theme}
          customTheme={customTheme}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={handleSkip}
          isFirst={isFirstStep}
          isLast={isLastStep}
          currentStep={currentStep}
          totalSteps={totalSteps}
          animation={animations?.tooltip}
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