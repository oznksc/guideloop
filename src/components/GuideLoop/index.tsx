'use client';

import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { Tooltip } from '../Tooltip';
import { Spotlight } from '../Spotlight';
import { Progress } from '../Progress';
import { DebugHUD } from '../DebugHUD';
import type { DebugSnapshot } from '../DebugHUD/types';
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
import { useDebugLog, resolveDebugEnabled } from '../../hooks/useDebugLog';
import { GUIDE_RESTART_EVENT, RESTART_DELAY } from '../../utils/events';
import type { GuideLoopProps, AdditionalSpotlightTarget } from './types';
import { Portal } from './Portal';
import { MaskedOverlay } from '../MaskedOverlay';
import { useSpotlights, type SpotlightTargetInput } from '../../hooks/useSpotlight';
import { scrollIntoView } from '../../utils/scroll';
import { querySelectorAsHTMLElement } from '../../utils/dom';
import { buildTargetDebugInfo } from '../../utils/debugTargets';

function normalizeAdditionalTarget(
  entry: string | AdditionalSpotlightTarget
): AdditionalSpotlightTarget {
  if (typeof entry === 'string') {
    return { selector: entry };
  }
  return entry;
}

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
  debug,
}) => {
  const [tourVisible, setTourVisible] = useState(isOpen);
  const autoRestoredRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const debugEnabled = resolveDebugEnabled(debug);
  const { events: debugEvents, push: pushDebug } = useDebugLog(debugEnabled);
  const [stepEnteredAt, setStepEnteredAt] = useState(() => Date.now());
  const lastStepRef = useRef<number | null>(null);
  const lastMissingRef = useRef<string>('');

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
    stepStatus,
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
  const stepSpotlightPadding =
    currentStepData?.spotlightPadding ?? spotlightPadding;

  const spotlightTargets = useMemo((): SpotlightTargetInput[] => {
    if (!currentStepData) return [];

    const primaryShape = currentStepData.spotlightShape ?? 'rect';
    const primary: SpotlightTargetInput = {
      selector: targetSelector || 'body',
      padding: stepSpotlightPadding,
      shape: primaryShape,
    };

    const extras = (currentStepData.additionalTargets ?? []).map((entry) => {
      const normalized = normalizeAdditionalTarget(entry);
      return {
        selector: normalized.selector,
        padding: normalized.padding ?? stepSpotlightPadding,
        shape: normalized.shape ?? primaryShape,
      };
    });

    return [primary, ...extras];
  }, [currentStepData, targetSelector, stepSpotlightPadding]);

  const spotlightHoles = useSpotlights(spotlightTargets);

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

    pushDebug('next', `Next from step ${currentStep}`, currentStep);

    if (isLastStep) {
      pushDebug('info', 'Tour complete (last step)', currentStep);
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
          pushDebug('info', 'Tour complete (after element action)', currentStep);
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
      pushDebug(
        'error',
        error instanceof Error ? error.message : 'Next step failed',
        currentStep
      );
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
    pushDebug,
  ]);

  const handlePrev = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    const prevStepIndex = currentStep - 1;
    if (prevStepIndex < 0) return;

    pushDebug('prev', `Prev from step ${currentStep}`, currentStep);

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
      pushDebug(
        'error',
        error instanceof Error ? error.message : 'Prev step failed',
        currentStep
      );
    }
  }, [
    currentStep,
    currentStepData,
    goToPrevStep,
    runElementAction,
    processingRef,
    pushDebug,
  ]);

  const handleSkip = useCallback(async () => {
    if (!currentStepData || processingRef.current) return;

    pushDebug('skip', `Skip on step ${currentStep}`, currentStep);

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
      pushDebug(
        'error',
        error instanceof Error ? error.message : 'Skip failed',
        currentStep
      );
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
    pushDebug,
    currentStep,
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

  const handleTrigger = useCallback(() => {
    pushDebug(
      'trigger',
      `Trigger "${currentStepData?.trigger ?? 'unknown'}" on ${
        currentStepData?.target ?? ''
      }`,
      currentStep
    );
    void handleNext();
  }, [pushDebug, currentStepData?.trigger, currentStepData?.target, currentStep, handleNext]);

  useElementTrigger({
    enabled: tourVisible && !!currentStepData?.trigger,
    targetSelector: currentStepData?.target ?? '',
    trigger: currentStepData?.trigger,
    onTrigger: handleTrigger,
  });

  const { isReady: targetReady, isWaiting: targetWaiting } = useWaitForTarget({
    targetSelector: currentStepData?.target ?? '',
    enabled: tourVisible,
    config: currentStepData?.waitForTarget,
  });

  // Debug: step changes while tour is visible
  useEffect(() => {
    if (!debugEnabled || !tourVisible) return;
    if (lastStepRef.current === null) {
      pushDebug('open', `Tour opened at step ${currentStep}`, currentStep);
    } else if (lastStepRef.current !== currentStep) {
      pushDebug(
        'step-change',
        `Step ${lastStepRef.current} → ${currentStep}`,
        currentStep
      );
    }
    lastStepRef.current = currentStep;
    setStepEnteredAt(Date.now());
  }, [currentStep, debugEnabled, pushDebug, tourVisible]);

  useEffect(() => {
    if (!debugEnabled) return;
    if (!tourVisible && lastStepRef.current !== null) {
      pushDebug('close', 'Tour hidden / closed', currentStep);
      lastStepRef.current = null;
    }
  }, [tourVisible, debugEnabled, pushDebug, currentStep]);

  useEffect(() => {
    if (!debugEnabled || !tourVisible || !targetWaiting) return;
    pushDebug(
      'wait',
      `Waiting for target ${currentStepData?.target ?? ''}`,
      currentStep
    );
  }, [
    targetWaiting,
    debugEnabled,
    pushDebug,
    currentStepData?.target,
    currentStep,
    tourVisible,
  ]);

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

  const debugTargets = useMemo(() => {
    if (!debugEnabled || !currentStepData) return [];
    return buildTargetDebugInfo({
      primarySelector: currentStepData.target,
      primaryShape: currentStepData.spotlightShape,
      additionalTargets: currentStepData.additionalTargets,
      holes: spotlightHoles,
    });
  }, [debugEnabled, currentStepData, spotlightHoles]);

  // Log missing selectors when set of missing targets changes
  useEffect(() => {
    if (!debugEnabled || !canShow) return;
    const missingKey = debugTargets
      .filter((t) => !t.found)
      .map((t) => t.selector)
      .join('|');
    if (missingKey && missingKey !== lastMissingRef.current) {
      pushDebug(
        'target-missing',
        `Missing: ${missingKey.replace(/\|/g, ', ')}`,
        currentStep
      );
    } else if (!missingKey && lastMissingRef.current) {
      pushDebug('target-found', 'All targets present', currentStep);
    }
    lastMissingRef.current = missingKey;
  }, [debugEnabled, canShow, debugTargets, pushDebug, currentStep]);

  const debugSnapshot: DebugSnapshot | null = useMemo(() => {
    if (!debugEnabled || !canShow || !currentStepData) return null;
    return {
      currentStep,
      totalSteps,
      stepTitle: currentStepData.title,
      stepStatus,
      targetReady,
      targetWaiting,
      tourVisible,
      targets: debugTargets,
      trigger: currentStepData.trigger,
      waitForTarget: currentStepData.waitForTarget,
      stepEnteredAt,
      events: debugEvents,
      persistKey: persist?.key,
    };
  }, [
    debugEnabled,
    canShow,
    currentStepData,
    currentStep,
    totalSteps,
    stepStatus,
    targetReady,
    targetWaiting,
    tourVisible,
    debugTargets,
    stepEnteredAt,
    debugEvents,
    persist?.key,
  ]);

  const debugHud =
    debugSnapshot && (
      <DebugHUD snapshot={debugSnapshot} zIndex={zIndex + 50} />
    );

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
          {debugHud}
        </div>
      </Portal>
    );
  }

  if (!targetReady) {
    return debugHud ? <Portal>{debugHud}</Portal> : null;
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
            targets={spotlightHoles}
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
          targets={spotlightHoles}
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

        {debugHud}
      </div>
    </Portal>
  );
};

export default GuideLoop;
