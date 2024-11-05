"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { WalkthroughTooltip, getTooltipPosition, type TooltipVariant } from '../WalkthroughTooltip';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface WalkthroughEventDetail {
  nextStep: number;
}

export interface Step {
  target: string;
  title: string;
  content: string;
  placement?: Placement;
  showButtons?: {
    next?: boolean;
    previous?: boolean;
    close?: boolean;
  };
  nextButtonOnClick?: () => void;
  nextButtonClickElementId?: string;
  prevButtonOnClick?: () => void;
  prevButtonClickElementId?: string;
}

interface WalkthroughProps {
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
  tooltipVariant?: TooltipVariant;
}

const RESTART_WALKTHROUGH_EVENT = "restartWalkthrough";

const Walkthrough: React.FC<WalkthroughProps> = ({ 
  steps, 
  isOpen, 
  onClose,
  tooltipVariant = 'tailwind'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [lastCompletedStep, setLastCompletedStep] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentStepData = steps[currentStep];

  const updateTargetRect = useCallback((selector: string) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      return rect;
    }
    return null;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      updateTargetRect(currentStepData.target);
    };

    const handleScroll = () => {
      if (!isTransitioning) {
        updateTargetRect(currentStepData.target);
      }
    };

    updateTargetRect(currentStepData.target);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [currentStep, currentStepData.target, isTransitioning, updateTargetRect]);

  useEffect(() => {
    const handleRestart = async (e: Event) => {
      const event = e as CustomEvent<WalkthroughEventDetail>;
      const nextStep = event.detail.nextStep;
      setIsTransitioning(true);

      await new Promise(resolve => setTimeout(resolve, 50));

      const nextStepData = steps[nextStep];
      if (nextStepData) {
        updateTargetRect(nextStepData.target);
      }

      setCurrentStep(nextStep);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    };

    document.addEventListener(RESTART_WALKTHROUGH_EVENT, handleRestart);

    return () => {
      document.removeEventListener(RESTART_WALKTHROUGH_EVENT, handleRestart);
    };
  }, [steps, updateTargetRect]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(lastCompletedStep);
      const stepData = steps[lastCompletedStep];
      if (stepData) {
        updateTargetRect(stepData.target);
      }
    }
  }, [isOpen, lastCompletedStep, steps, updateTargetRect]);

  const defaultShowButtons = {
    next: true,
    previous: true,
    close: true
  };

  const dispatchRestartEvent = (nextStep: number) => {
    const event = new CustomEvent<WalkthroughEventDetail>(RESTART_WALKTHROUGH_EVENT, {
      detail: { nextStep }
    });
    document.dispatchEvent(event);
  };

  const handleCustomButtonClick = async (
    elementId: string | undefined, 
    onClick: (() => void) | undefined,
    defaultAction: () => void,
    nextStepIndex: number
  ) => {
    if (onClick) {
      onClick();
    }
    
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        setIsTransitioning(true);
        setLastCompletedStep(currentStep);
        
        element.click();

        await new Promise(resolve => setTimeout(resolve, 50));
        dispatchRestartEvent(nextStepIndex);
      }
    } else {
      defaultAction();
    }
  };

  const handleNext = () => {
    handleCustomButtonClick(
      currentStepData.nextButtonClickElementId,
      currentStepData.nextButtonOnClick,
      () => {
        if (currentStep < steps.length - 1) {
          const nextStepData = steps[currentStep + 1];
          updateTargetRect(nextStepData.target);
          setCurrentStep(prev => prev + 1);
        } else {
          setCurrentStep(0);
          onClose();
        }
      },
      currentStep + 1
    );
  };

  const handlePrev = () => {
    handleCustomButtonClick(
      currentStepData.prevButtonClickElementId,
      currentStepData.prevButtonOnClick,
      () => {
        if (currentStep > 0) {
          const prevStepData = steps[currentStep - 1];
          updateTargetRect(prevStepData.target);
          setCurrentStep(prev => prev - 1);
        }
      },
      currentStep - 1
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {targetRect && !isTransitioning && (
        <div className="fixed inset-0" style={{ zIndex: 1001 }}>
          <div 
            className="absolute bg-black/50"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: targetRect.top
            }}
          />
          
          <div 
            className="absolute bg-black/50"
            style={{
              top: targetRect.top,
              left: 0,
              width: targetRect.left,
              height: targetRect.height
            }}
          />
          
          <div 
            className="absolute bg-black/50"
            style={{
              top: targetRect.top,
              left: targetRect.right,
              width: `calc(100% - ${targetRect.right}px)`,
              height: targetRect.height
            }}
          />
          
          <div 
            className="absolute bg-black/50"
            style={{
              top: targetRect.bottom,
              left: 0,
              width: '100%',
              height: `calc(100% - ${targetRect.bottom}px)`
            }}
          />

          <div
            className="absolute border-2 border-blue-500 animate-pulse rounded-md pointer-events-none"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
          />
          
          <WalkthroughTooltip
            currentStep={currentStep}
            totalSteps={steps.length}
            currentStepData={currentStepData}
            defaultShowButtons={defaultShowButtons}
            position={getTooltipPosition(targetRect, currentStepData.placement)}
            onNext={handleNext}
            onPrev={handlePrev}
            onClose={onClose}
            variant={tooltipVariant}
          />
        </div>
      )}
    </>
  );
};

export default Walkthrough;