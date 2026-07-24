import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { useSteps } from '../../hooks/useSteps';
import { useKeyboard } from '../../hooks/useKeyboard';
import { injectKeyframes } from '../../utils/animation';
import {
  saveTourState,
  loadTourState,
  clearTourState,
} from '../../utils/tourState';
import { useElementTrigger } from '../../hooks/useElementTrigger';
import { useElementClick } from '../../hooks/useElementClick';
import { useWaitForTarget } from '../../hooks/useWaitForTarget';
import { GUIDE_RESTART_EVENT, RESTART_DELAY } from '../../utils/events';
import type { GuideLoopProps } from './types';
import { Portal } from './Portal';
import { MaskedOverlay } from '../MaskedOverlay';
import { useSpotlight } from '../../hooks/useSpotlight';
import { scrollIntoView } from '../../utils/scroll';
import { querySelectorAsHTMLElement } from '../../utils/dom';

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
  persist,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [tourVisible, setTourVisible] = useState(isOpen);
  const [targetElement, setTargetElement] = useState<string>('');
  const autoRestoredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const handleComplete = useCallback(() => {
    if (persist) {
      clearTourState(persist.key, persist.type);
    }
    onComplete?.();
  }, [persist, onComplete]);

  const handleClosePersistence = useCallback(() => {
    autoRestoredRef.current = false;
    if (persist) {
      saveTourState(persist.key, { currentStepIndex, isActive: false }, persist.type);
    }
    onClose();
  }, [persist, currentStepIndex, onClose]);

  const syncedOnStepChange = useCallback((step: number) => {
    setCurrentStepIndex(step);
    onStepChange?.(step);
  }, [onStepChange]);

  const {
    nextStep: goToNextStep,
    prevStep: goToPrevStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    currentStepData,
    setCurrentStep,
  } = useSteps({
    steps,
    initialStep: currentStepIndex,
    onStepChange: syncedOnStepChange,
    onComplete: handleComplete,
  });

  // Güvenli bir şekilde target elementini güncelle
  const updateTargetElement = useCallback((stepData?: typeof currentStepData) => {
    if (stepData?.target) {
      setTargetElement(stepData.target);
    }
  }, []);

  const spotlightPosition = useSpotlight(targetElement || 'body', spotlightPadding);

  const { handleElementClick, processingRef } = useElementClick({
    scrollSmooth,
  });

  useEffect(() => {
    updateTargetElement(currentStepData);
  }, [currentStepData, updateTargetElement]);

  useEffect(() => {
    if (persist?.autoRestore) {
      const saved = loadTourState(persist.key, persist.type);
      if (saved?.isActive && typeof saved.currentStepIndex === 'number') {
        autoRestoredRef.current = true;
        injectKeyframes();
        setTourVisible(true);
        setCurrentStepIndex(saved.currentStepIndex);
        setCurrentStep(saved.currentStepIndex);
      }
    }
  }, []);

  const handleNext = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    try {
      const hasElementAction = currentStepData?.nextButtonClickElementId || currentStepData?.nextButtonOnClick;
      if (hasElementAction) {
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex >= steps.length) return;
        await handleElementClick(
          currentStepData.nextButtonClickElementId,
          currentStepData.nextDelay,
          currentStepData.nextButtonOnClick,
          nextStepIndex,
          setCurrentStep,
          syncedOnStepChange,
          setTourVisible
        );
      } else {
        if (currentStepData?.nextDelay) {
          await new Promise((resolve) => setTimeout(resolve, currentStepData.nextDelay));
        }
        await goToNextStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
    }
  }, [currentStepData, currentStepIndex, steps.length, goToNextStep, handleElementClick, setCurrentStep, syncedOnStepChange, setTourVisible]);

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
          prevStepIndex,
          setCurrentStep,
          syncedOnStepChange,
          setTourVisible
        );
      } else {
        await goToPrevStep();
      }
    } catch (error) {
      console.error('Error during previous step:', error);
    }
  }, [currentStepIndex, currentStepData, goToPrevStep, handleElementClick, setCurrentStep, syncedOnStepChange, setTourVisible]);

  const handleSkip = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;
    
    try {
      if (currentStepData?.skipButtonClickElementId || currentStepData?.skipButtonOnClick) {
        await handleElementClick(
          currentStepData.skipButtonClickElementId,
          currentStepData.skipDelay,
          currentStepData.skipButtonOnClick,
          undefined,
          setCurrentStep,
          syncedOnStepChange,
          setTourVisible
        );
      }
      if (isLastStep) {
        handleComplete();
        onClose();
      } else {
        onSkip?.();
        handleClosePersistence();
      }
    } catch (error) {
      console.error('Error during skip:', error);
      if (isLastStep) {
        handleComplete();
        onClose();
      } else {
        onSkip?.();
        handleClosePersistence();
      }
    }
  }, [currentStepData, isLastStep, onSkip, handleComplete, handleClosePersistence, handleElementClick, onClose, setCurrentStep, syncedOnStepChange]);

  useEffect(() => {
    const handleRestart = (event: Event) => {
      const { detail: { nextStep } } = event as CustomEvent<{ nextStep: number }>;
      
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
    if (isOpen && !autoRestoredRef.current) {
      injectKeyframes();
      setTourVisible(true);
      setCurrentStepIndex(initialStep);
      setCurrentStep(initialStep);
      updateTargetElement(steps[initialStep]);
    }
  }, [isOpen, initialStep, steps, updateTargetElement, setCurrentStep]);

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!persist) return;
    if (tourVisible && currentStepIndex >= 0) {
      saveTourState(persist.key, { currentStepIndex, isActive: true }, persist.type);
    }
  }, [persist, tourVisible, currentStepIndex]);

  useElementTrigger({
    enabled: tourVisible && !!currentStepData?.trigger,
    targetSelector: currentStepData?.target ?? '',
    trigger: currentStepData?.trigger,
    onTrigger: handleNext,
  });

  const { isReady: targetReady, isWaiting: targetWaiting } = useWaitForTarget({
    targetSelector: currentStepData?.target ?? '',
    enabled: tourVisible,
    config: currentStepData?.waitForTarget,
  });

  useEffect(() => {
    if (!tourVisible || !targetReady || !scrollSmooth || !currentStepData?.target) {
      return;
    }

    const element = querySelectorAsHTMLElement(currentStepData.target);
    if (element) {
      void scrollIntoView(element, {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [currentStepData?.target, scrollSmooth, targetReady, tourVisible]);

  useKeyboard({
    enabled: keyboard && tourVisible,
    onEscape: handleSkip,
    onArrowRight: handleNext,
    onArrowLeft: handlePrev,
  });

  const canShow = Boolean(
    (isOpen || autoRestoredRef.current) && tourVisible && currentStepData
  );

  useEffect(() => {
    if (!canShow) return;

    const activeElement = document.activeElement;
    openerRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null;

    return () => {
      const opener = openerRef.current;
      openerRef.current = null;
      if (!opener?.isConnected) return;

      window.setTimeout(() => {
        opener.focus({ preventScroll: true });
      }, 0);
    };
  }, [canShow]);

  useEffect(() => {
    if (!canShow) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusInitialControl = () => {
      const preferredControl =
        dialog.querySelector<HTMLElement>('[data-guideloop-action="next"]') ??
        dialog.querySelector<HTMLElement>('[data-guideloop-action="close"]') ??
        dialog;
      preferredControl.focus({ preventScroll: true });
    };

    const focusTimer = window.setTimeout(focusInitialControl, 0);
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', trapFocus, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', trapFocus, true);
    };
  }, [canShow, targetReady, targetWaiting]);

  if (!canShow) {
    return null;
  }

  if (targetWaiting) {
    return (
      <Portal>
        <div
          ref={dialogRef}
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
          tabIndex={-1}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#666',
              fontSize: '0.875rem',
            }}
          >
            Waiting for target element...
          </div>
        </div>
      </Portal>
    );
  }

  if (!targetReady) {
    return null;
  }

  return (
    <Portal>
      <div
        ref={dialogRef}
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
        tabIndex={-1}
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
