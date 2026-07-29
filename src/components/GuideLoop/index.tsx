import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { useSteps } from '../../hooks/useSteps';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useFocusTrap } from '../../hooks/useFocusTrap';
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
  const [tourVisible, setTourVisible] = useState(isOpen);
  const autoRestoredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(() => {
    if (persist) {
      clearTourState(persist.key, persist.type);
    }
    onComplete?.();
  }, [persist, onComplete]);

  const {
    currentStep,
    nextStep: goToNextStep,
    prevStep: goToPrevStep,
    leaveStep,
    enterStep,
    isFirstStep,
    isLastStep,
    totalSteps,
    currentStepData,
    setCurrentStep,
  } = useSteps({
    steps,
    initialStep,
    onStepChange,
    onComplete: handleComplete,
  });

  const handleClosePersistence = useCallback(() => {
    autoRestoredRef.current = false;
    if (persist) {
      saveTourState(
        persist.key,
        { currentStepIndex: currentStep, isActive: false },
        persist.type
      );
    }
    onClose();
  }, [persist, currentStep, onClose]);

  const targetSelector = currentStepData?.target ?? '';
  const spotlightPosition = useSpotlight(
    targetSelector || 'body',
    currentStepData?.spotlightPadding ?? spotlightPadding
  );

  const { handleElementClick, processingRef } = useElementClick({
    scrollSmooth,
  });

  // Auto-restore multi-page tour state once on mount
  useEffect(() => {
    if (!persist?.autoRestore) return;

    const saved = loadTourState(persist.key, persist.type);
    if (saved?.isActive && typeof saved.currentStepIndex === 'number') {
      autoRestoredRef.current = true;
      injectKeyframes();
      setTourVisible(true);
      setCurrentStep(saved.currentStepIndex);
    }
  }, []);

  const runElementAction = useCallback(
    async (options: {
      elementSelector?: string;
      delay?: number;
      onClick?: () => void;
      nextStepIndex?: number;
    }) => {
      await leaveStep();
      await handleElementClick({
        ...options,
        hideTour: () => setTourVisible(false),
        onAdvance: (stepIndex) => enterStep(stepIndex),
      });
    },
    [leaveStep, handleElementClick, enterStep]
  );

  const handleNext = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    if (isLastStep) {
      handleComplete();
      onClose();
      return;
    }

    try {
      const hasElementAction =
        currentStepData.nextButtonClickElementId ||
        currentStepData.nextButtonOnClick;

      if (hasElementAction) {
        const nextStepIndex = currentStep + 1;
        if (nextStepIndex >= totalSteps) {
          handleComplete();
          onClose();
          return;
        }
        await runElementAction({
          elementSelector: currentStepData.nextButtonClickElementId,
          delay: currentStepData.nextDelay,
          onClick: currentStepData.nextButtonOnClick,
          nextStepIndex,
        });
      } else {
        if (currentStepData.nextDelay) {
          await new Promise((resolve) =>
            setTimeout(resolve, currentStepData.nextDelay)
          );
        }
        await goToNextStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
    }
  }, [
    currentStepData,
    isLastStep,
    handleComplete,
    onClose,
    currentStep,
    totalSteps,
    goToNextStep,
    runElementAction,
    processingRef,
  ]);

  const handlePrev = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    const prevStepIndex = currentStep - 1;
    if (prevStepIndex < 0) return;

    try {
      if (
        currentStepData.prevButtonClickElementId ||
        currentStepData.prevButtonOnClick
      ) {
        await runElementAction({
          elementSelector: currentStepData.prevButtonClickElementId,
          delay: currentStepData.prevDelay,
          onClick: currentStepData.prevButtonOnClick,
          nextStepIndex: prevStepIndex,
        });
      } else {
        await goToPrevStep();
      }
    } catch (error) {
      console.error('Error during previous step:', error);
    }
  }, [
    currentStep,
    currentStepData,
    goToPrevStep,
    runElementAction,
    processingRef,
  ]);

  const handleSkip = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    try {
      if (
        currentStepData.skipButtonClickElementId ||
        currentStepData.skipButtonOnClick
      ) {
        await handleElementClick({
          elementSelector: currentStepData.skipButtonClickElementId,
          delay: currentStepData.skipDelay,
          onClick: currentStepData.skipButtonOnClick,
          hideTour: () => setTourVisible(false),
        });
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
  }, [
    currentStepData,
    isLastStep,
    onSkip,
    handleComplete,
    handleClosePersistence,
    handleElementClick,
    onClose,
    processingRef,
  ]);

  // Resume after hide+click element actions (single step source: enterStep)
  useEffect(() => {
    const handleRestart = (event: Event) => {
      const {
        detail: { nextStep: nextStepIndex },
      } = event as CustomEvent<{ nextStep: number }>;

      setTimeout(() => {
        setTourVisible(true);
        void enterStep(nextStepIndex);
      }, RESTART_DELAY);
    };

    document.addEventListener(GUIDE_RESTART_EVENT, handleRestart);
    return () => {
      document.removeEventListener(GUIDE_RESTART_EVENT, handleRestart);
    };
  }, [enterStep]);

  // Sync open/close with controlled isOpen prop
  useEffect(() => {
    if (isOpen && !autoRestoredRef.current) {
      injectKeyframes();
      setCurrentStep(initialStep);
      setTourVisible(true);
    } else if (!isOpen) {
      setTourVisible(false);
    }
  }, [isOpen, initialStep, setCurrentStep]);

  // Persist active tour progress
  useEffect(() => {
    if (!persist) return;
    if (tourVisible && currentStep >= 0) {
      saveTourState(
        persist.key,
        { currentStepIndex: currentStep, isActive: true },
        persist.type
      );
    }
  }, [persist, tourVisible, currentStep]);

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
    if (
      !tourVisible ||
      !targetReady ||
      !scrollSmooth ||
      !currentStepData?.target
    ) {
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

  useFocusTrap({
    enabled: canShow,
    containerRef: dialogRef,
    focusKey: `${targetReady}-${targetWaiting}-${currentStep}`,
  });

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

  const stepSpotlightPadding =
    currentStepData.spotlightPadding ?? spotlightPadding;

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
            padding={stepSpotlightPadding}
            theme={theme}
            customTheme={customTheme}
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
          padding={stepSpotlightPadding}
          theme={theme}
          customTheme={customTheme}
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
