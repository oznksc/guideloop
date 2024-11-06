import React, { useEffect } from 'react';
import { Tooltip } from '../Tooltip';
import { Overlay } from '../Overlay';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { useSteps } from '../../hooks/useSteps';
import { useSpotlight } from '../../hooks/useSpotlight';
import { useKeyboard } from '../../hooks/useKeyboard';
import { scrollIntoView } from '../../utils/scroll';
import type { GuideLoopProps } from './types';
const GuideLoop: React.FC<GuideLoopProps> = ({
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
  const spotlightPosition = useSpotlight(currentStepData.target, spotlightPadding);

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
      const element = document.querySelector(currentStepData.target);
      if (element) {
        scrollIntoView(element, { behavior: 'smooth' });
      }
    }
  }, [isOpen, currentStep, currentStepData.target, scrollSmooth]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label="Guided tour"
    >
      {overlay && <Overlay onClick={handleSkip} />}
      
      <Spotlight 
        position={spotlightPosition}
        padding={spotlightPadding}
        animation={animations?.spotlight}
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
      />
      
      <Progress 
        current={currentStep + 1}
        total={totalSteps}
        theme={theme}
      />
    </div>
  );
};

export default GuideLoop;
