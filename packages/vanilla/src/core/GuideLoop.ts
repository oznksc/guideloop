/**
 * GuideLoop — imperative API for the guided tour.
 * Orchestrates tooltip, spotlight, overlay, progress, keyboard, focus trap, etc.
 *
 * Usage:
 *   const tour = new GuideLoop({ steps: [...], theme: 'tailwind' });
 *   tour.start();    // opens the tour
 *   tour.next();     // advance to next step
 *   tour.prev();     // go back
 *   tour.close();    // close the tour
 *   tour.destroy();  // clean up
 */

import {
  createStepManager,
  injectKeyframes,
  saveTourState,
  loadTourState,
  clearTourState,
  GUIDE_RESTART_EVENT,
  RESTART_DELAY,
  scrollIntoView,
  querySelectorAsHTMLElement,
  buildTargetDebugInfo,
  waitForElement,
} from '@guideloop/core';
import type {
  StepManager,
  AdditionalSpotlightTarget,
  SpotlightHole,
  WaitForTargetConfig,
  Step as CoreStep,
} from '@guideloop/core';

import { createPortalElement, destroyPortalElement } from './Portal';
import { createTooltip, type TooltipInstance } from '../components/Tooltip';
import { createSpotlight, type SpotlightInstance } from '../components/Spotlight';
import {
  createMaskedOverlay,
  type MaskedOverlayInstance,
} from '../components/MaskedOverlay';
import { createProgress, type ProgressInstance } from '../components/Progress';
import {
  createDebugHUD,
  type DebugHUDInstance,
  type DebugSnapshot,
} from '../components/DebugHUD';
import { createFocusTrap, type FocusTrapInstance } from './FocusTrap';
import { enableKeyboard } from './KeyboardHandler';
import {
  createSpotlightTracker,
  type SpotlightTargetInput,
  type SpotlightTrackerInstance,
} from './SpotlightTracker';
import {
  createElementTrigger,
  type ElementTriggerInstance,
} from './ElementTrigger';
import { handleElementClick } from './ElementClick';
import {
  createDebugLogger,
  resolveDebugEnabled,
  type DebugLoggerInstance,
} from './DebugLogger';

import type { GuideLoopOptions, Step, ButtonLabels, SpotlightShape } from './types';

/** Map vanilla steps onto core Step shape for the step manager. */
function toCoreSteps(steps: Step[]): CoreStep[] {
  return steps.map((s) => ({
    ...s,
    content: typeof s.content === 'string' ? s.content : undefined,
    title: s.title,
  }));
}

function normalizeAdditionalTarget(
  entry: string | AdditionalSpotlightTarget
): AdditionalSpotlightTarget {
  if (typeof entry === 'string') {
    return { selector: entry };
  }
  return entry;
}

function elementExists(selector: string): boolean {
  try {
    return !!document.querySelector(selector);
  } catch {
    return false;
  }
}

const DEFAULT_LABELS: ButtonLabels = {
  next: 'Next',
  prev: 'Previous',
  skip: 'Skip',
  finish: 'Finish',
};

export class GuideLoop {
  private options: GuideLoopOptions;
  /** Original vanilla steps (preserves HTMLElement content/icons). */
  private vanillaSteps: Step[] = [];
  private stepManager: StepManager | null = null;
  private portalContainer: HTMLElement | null = null;
  private tooltip: TooltipInstance | null = null;
  private spotlightComp: SpotlightInstance | null = null;
  private overlay: MaskedOverlayInstance | null = null;
  private progressComp: ProgressInstance | null = null;
  private debugHud: DebugHUDInstance | null = null;
  private spotlightTracker: SpotlightTrackerInstance | null = null;
  private focusTrap: FocusTrapInstance | null = null;
  private elementTrigger: ElementTriggerInstance | null = null;
  private debugLogger: DebugLoggerInstance | null = null;
  private keyboardCleanup: (() => void) | null = null;
  private spotlightUnsub: (() => void) | null = null;
  private waitGeneration = 0;

  private _isOpen = false;
  private _isProcessing = false;
  private _containerEl: HTMLDivElement | null = null;
  private _currentStepIndex = 0;
  private _targetReady = true;
  private _targetWaiting = false;
  private _stepEnteredAt = Date.now();
  private debugEnabled: boolean;
  private restartHandler: ((event: Event) => void) | null = null;

  constructor(options: GuideLoopOptions) {
    this.options = options;
    this.debugEnabled = resolveDebugEnabled(options.debug);
    this.debugLogger = this.debugEnabled ? createDebugLogger() : null;
  }

  // ─── Public API ───

  get isOpen(): boolean {
    return this._isOpen;
  }

  get currentStep(): number {
    return this._currentStepIndex;
  }

  /** Open the tour. Returns a promise that resolves when the first step is ready. */
  async start(): Promise<void> {
    if (this._isOpen) return;
    this._isOpen = true;
    await this._initTour();
  }

  async next(): Promise<void> {
    if (!this._isOpen || this._isProcessing) return;
    this._debugPush('next', `Next from step ${this._currentStepIndex}`);
    await this._goNext();
  }

  async prev(): Promise<void> {
    if (!this._isOpen || this._isProcessing) return;
    this._debugPush('prev', `Prev from step ${this._currentStepIndex}`);
    await this._goPrev();
  }

  close(): void {
    if (!this._isOpen) return;
    this._debugPush('close', 'Tour closed');
    void this.stepManager?.leaveStep();
    this._savePersistState(false);
    this._cleanup();
    this.options.onClose?.();
  }

  skip(): void {
    if (!this._isOpen) return;
    this._debugPush('skip', `Skip on step ${this._currentStepIndex}`);
    const isLast = this.stepManager?.isLastStep ?? true;
    if (isLast) {
      this._handleComplete();
      this.close();
    } else {
      this.options.onSkip?.();
      void this.stepManager?.leaveStep();
      this._savePersistState(false);
      this._cleanup();
      this.options.onClose?.();
    }
  }

  async goTo(stepIndex: number): Promise<void> {
    if (!this._isOpen || !this.stepManager) return;
    if (stepIndex < 0 || stepIndex >= this.stepManager.totalSteps) return;
    await this.stepManager.leaveStep();
    await this.stepManager.enterStep(stepIndex);
    this._currentStepIndex = this.stepManager.currentStep;
    this._stepEnteredAt = Date.now();
    this._savePersistState(true);
    this._renderStep();
  }

  destroy(): void {
    if (this._isOpen) {
      void this.stepManager?.leaveStep();
    }
    this._cleanup();
    this.stepManager = null;
    this.spotlightTracker?.destroy();
    this.spotlightTracker = null;
    this.debugLogger = null;
  }

  // ─── Private: Tour Lifecycle ───

  private async _initTour(): Promise<void> {
    injectKeyframes();

    const { steps, initialStep = 0 } = this.options;
    // Keep full vanilla steps; core manager only needs serializable fields
    this.vanillaSteps = steps.filter((step) => !step.condition || step.condition());

    this.stepManager = createStepManager({
      steps: toCoreSteps(this.vanillaSteps),
      initialStep,
      onStepChange: (step) => {
        this._currentStepIndex = step;
        this.options.onStepChange?.(step);
      },
      onComplete: () => {
        this._handleComplete();
      },
    });

    this._currentStepIndex = this.stepManager.currentStep;

    // Auto-restore multi-page tour state
    if (this.options.persist?.autoRestore) {
      const saved = loadTourState(
        this.options.persist.key,
        this.options.persist.type
      );
      if (saved?.isActive && typeof saved.currentStepIndex === 'number') {
        this.stepManager.setStep(saved.currentStepIndex);
        this._currentStepIndex = saved.currentStepIndex;
      }
    }

    this.spotlightTracker = createSpotlightTracker();

    if (this.debugEnabled) {
      this.debugLogger?.push(
        'open',
        `Tour opened at step ${this._currentStepIndex}`
      );
    }

    // Resume after hide+click element actions
    this.restartHandler = (event: Event) => {
      const { nextStep } = (event as CustomEvent<{ nextStep: number }>).detail;
      setTimeout(() => {
        if (!this.stepManager) return;
        this._isOpen = true;
        void this.stepManager.enterStep(nextStep).then(() => {
          this._currentStepIndex = this.stepManager?.currentStep ?? nextStep;
          this._stepEnteredAt = Date.now();
          this._savePersistState(true);
          this._renderStep();
        });
      }, RESTART_DELAY);
    };
    document.addEventListener(GUIDE_RESTART_EVENT, this.restartHandler);

    // Run beforeStep for the first step, then render
    await this.stepManager.enterStep(this._currentStepIndex);

    // destroy() may have run while enterStep was pending
    if (!this._isOpen || !this.stepManager) return;

    this._currentStepIndex = this.stepManager.currentStep;
    this._stepEnteredAt = Date.now();
    this._savePersistState(true);
    this._renderStep();
  }

  private _getStepData(): Step | null {
    const index = this.stepManager?.currentStep ?? this._currentStepIndex;
    return this.vanillaSteps[index] ?? null;
  }

  private _renderStep(): void {
    const stepData = this._getStepData();
    if (!stepData || !this._isOpen) {
      return;
    }

    // Cancel in-flight waitForTarget from previous step
    this.waitGeneration += 1;
    const generation = this.waitGeneration;

    this._destroySubComponents();
    this._ensureContainer();

    const waitConfig = stepData.waitForTarget;
    const needsWait = Boolean(waitConfig) && !elementExists(stepData.target);

    if (needsWait) {
      this._targetReady = false;
      this._targetWaiting = true;
      this._renderWaitingState(stepData, generation);
      return;
    }

    this._targetReady = true;
    this._targetWaiting = false;
    this._mountStepUI(stepData);
  }

  private _ensureContainer(): void {
    if (this._containerEl && this.portalContainer) {
      this._containerEl.innerHTML = '';
      return;
    }

    this._containerEl = document.createElement('div');
    this._containerEl.className = 'guideloop-container';
    Object.assign(this._containerEl.style, {
      position: 'fixed',
      inset: '0',
      zIndex: String(this.options.zIndex ?? 2000),
      isolation: 'isolate',
    });
    this._containerEl.setAttribute('role', 'dialog');
    this._containerEl.setAttribute('aria-modal', 'true');
    this._containerEl.setAttribute('aria-label', 'Guided tour');
    this._containerEl.tabIndex = -1;

    this.portalContainer = createPortalElement();
    this.portalContainer.style.display = '';
    this.portalContainer.appendChild(this._containerEl);
  }

  private _renderWaitingState(stepData: Step, generation: number): void {
    if (!this._containerEl) return;

    const waiting = document.createElement('div');
    Object.assign(waiting.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#666',
      fontSize: '0.875rem',
    });
    waiting.textContent = 'Waiting for target element...';
    this._containerEl.appendChild(waiting);

    if (this.debugEnabled && this.debugLogger) {
      this._debugPush('wait', `Waiting for target ${stepData.target}`);
      this._renderDebugHud(stepData);
    }

    if (this.options.keyboard !== false) {
      this.keyboardCleanup = enableKeyboard({
        onEscape: () => this.skip(),
      });
    }

    const options: { timeout?: number; root?: HTMLElement } = {};
    if (typeof stepData.waitForTarget === 'object' && stepData.waitForTarget) {
      const cfg = stepData.waitForTarget as WaitForTargetConfig;
      if (cfg.timeout) options.timeout = cfg.timeout;
      if (cfg.root instanceof HTMLElement) options.root = cfg.root;
    }

    void waitForElement(stepData.target, options)
      .then(() => {
        if (generation !== this.waitGeneration || !this._isOpen) return;
        this._targetReady = true;
        this._targetWaiting = false;
        this._debugPush('target-found', `Target ready: ${stepData.target}`);
        this._mountStepUI(stepData);
      })
      .catch((err: Error) => {
        if (generation !== this.waitGeneration || !this._isOpen) return;
        this._targetWaiting = false;
        this._targetReady = false;
        this._debugPush('error', err.message || 'waitForTarget timed out');
        console.warn(err.message);
      });
  }

  private _mountStepUI(stepData: Step): void {
    if (!this._containerEl || !this._isOpen) return;

    // Clear waiting UI / previous children without dropping container
    this._destroySubComponents();
    this._containerEl.innerHTML = '';

    const targets = this._computeSpotlightTargets(stepData);
    this.spotlightTracker?.setTargets(targets);
    const holes = this.spotlightTracker?.getHoles() ?? [];

    this._createOverlayAndSpotlight(holes);

    // Live-update cutouts on scroll/resize/mutation
    this.spotlightUnsub?.();
    this.spotlightUnsub =
      this.spotlightTracker?.subscribe((nextHoles) => {
        this.overlay?.updateTargets(nextHoles);
        this.spotlightComp?.updateTargets(nextHoles);
      }) ?? null;

    // Tooltip
    this.tooltip = createTooltip({
      step: stepData,
      theme: this.options.theme ?? 'tailwind',
      customTheme: this.options.customTheme,
      currentStep: this._currentStepIndex,
      totalSteps: this.stepManager?.totalSteps ?? 0,
      isFirst: this.stepManager?.isFirstStep ?? true,
      isLast: this.stepManager?.isLastStep ?? true,
      animation: this.options.animations?.tooltip,
      defaultButtonLabels: {
        ...DEFAULT_LABELS,
        ...this.options.defaultButtonLabels,
      },
      onNext: () => {
        void this._goNext();
      },
      onPrev: () => {
        void this._goPrev();
      },
      onClose: () => this.skip(),
    });
    Object.assign(this.tooltip.getElement().style, {
      position: 'absolute',
      zIndex: String((this.options.zIndex ?? 2000) + 3),
    });
    this.tooltip.mount(this._containerEl);

    // Progress
    this.progressComp = createProgress({
      current: this._currentStepIndex + 1,
      total: this.stepManager?.totalSteps ?? 0,
      theme: this.options.theme ?? 'tailwind',
      customTheme: this.options.customTheme,
    });
    Object.assign(this.progressComp.getElement().style, {
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: String((this.options.zIndex ?? 2000) + 3),
    });
    this.progressComp.mount(this._containerEl);

    if (this.debugEnabled && this.debugLogger) {
      this._renderDebugHud(stepData);
    }

    if (this.options.keyboard !== false) {
      this.keyboardCleanup = enableKeyboard({
        onEscape: () => this.skip(),
        onArrowRight: () => {
          void this._goNext();
        },
        onArrowLeft: () => {
          void this._goPrev();
        },
      });
    }

    this.focusTrap = createFocusTrap(this._containerEl);
    this.focusTrap.activate();

    if (stepData.trigger) {
      this.elementTrigger = createElementTrigger(
        stepData.target,
        stepData.trigger,
        () => {
          this._debugPush(
            'trigger',
            `Trigger "${stepData.trigger}" on ${stepData.target}`
          );
          void this._goNext();
        }
      );
      this.elementTrigger.attach();
    }

    if (this.options.scrollSmooth !== false && stepData.target) {
      const element = querySelectorAsHTMLElement(stepData.target);
      if (element) {
        void scrollIntoView(element, {
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }
  }

  private _createOverlayAndSpotlight(holes: SpotlightHole[]): void {
    if (!this._containerEl) return;

    if (this.options.overlay !== false) {
      this.overlay = createMaskedOverlay({
        targets: holes,
        theme: this.options.theme ?? 'tailwind',
        customTheme: this.options.customTheme,
        onClick: () => this.skip(),
        animation: this.options.animations?.overlay,
      });
      Object.assign(this.overlay.getElement().style, {
        position: 'fixed',
        inset: '0',
        zIndex: String((this.options.zIndex ?? 2000) + 1),
      });
      this.overlay.mount(this._containerEl);
    }

    this.spotlightComp = createSpotlight({
      targets: holes,
      theme: this.options.theme ?? 'tailwind',
      customTheme: this.options.customTheme,
      animation: this.options.animations?.spotlight,
    });
    Object.assign(this.spotlightComp.getElement().style, {
      position: 'absolute',
      zIndex: String((this.options.zIndex ?? 2000) + 2),
    });
    this.spotlightComp.mount(this._containerEl);
  }

  // ─── Private: Navigation ───

  private async _goNext(): Promise<void> {
    if (!this.stepManager || this._isProcessing) return;
    this._isProcessing = true;

    try {
      const stepData = this._getStepData();
      const isLast = this.stepManager.isLastStep;

      if (isLast) {
        this._handleComplete();
        this.close();
        return;
      }

      const hasElementAction =
        stepData?.nextButtonClickElementId || stepData?.nextButtonOnClick;

      if (hasElementAction) {
        const nextStepIndex = this._currentStepIndex + 1;
        if (nextStepIndex >= this.stepManager.totalSteps) {
          this._handleComplete();
          this.close();
          return;
        }
        await this._runElementAction({
          elementSelector: stepData?.nextButtonClickElementId,
          delay: stepData?.nextDelay,
          onClick: stepData?.nextButtonOnClick,
          nextStepIndex,
        });
      } else {
        if (stepData?.nextDelay) {
          await new Promise((r) => setTimeout(r, stepData.nextDelay));
        }
        if (!this.stepManager) return;
        await this.stepManager.nextStep();
        if (!this.stepManager || !this._isOpen) return;
        this._currentStepIndex = this.stepManager.currentStep;
        this._stepEnteredAt = Date.now();
        this._savePersistState(true);
        this._renderStep();
      }
    } catch (error) {
      console.error('Error during next step:', error);
      this._debugPush(
        'error',
        error instanceof Error ? error.message : 'Next step failed'
      );
    } finally {
      this._isProcessing = false;
    }
  }

  private async _goPrev(): Promise<void> {
    if (!this.stepManager || this._isProcessing) return;
    this._isProcessing = true;

    try {
      const stepData = this._getStepData();
      const prevStepIndex = this._currentStepIndex - 1;
      if (prevStepIndex < 0) return;

      if (stepData?.prevButtonClickElementId || stepData?.prevButtonOnClick) {
        await this._runElementAction({
          elementSelector: stepData?.prevButtonClickElementId,
          delay: stepData?.prevDelay,
          onClick: stepData?.prevButtonOnClick,
          nextStepIndex: prevStepIndex,
        });
      } else {
        if (!this.stepManager) return;
        await this.stepManager.prevStep();
        if (!this.stepManager || !this._isOpen) return;
        this._currentStepIndex = this.stepManager.currentStep;
        this._stepEnteredAt = Date.now();
        this._savePersistState(true);
        this._renderStep();
      }
    } catch (error) {
      console.error('Error during previous step:', error);
      this._debugPush(
        'error',
        error instanceof Error ? error.message : 'Prev step failed'
      );
    } finally {
      this._isProcessing = false;
    }
  }

  private async _runElementAction(options: {
    elementSelector?: string;
    delay?: number;
    onClick?: () => void | Promise<void>;
    nextStepIndex?: number;
  }): Promise<void> {
    await this.stepManager?.leaveStep();
    await this._cleanupForElementAction();

    await handleElementClick({
      ...options,
      hideTour: () => {
        this._isOpen = false;
        if (this.portalContainer) {
          this.portalContainer.style.display = 'none';
        }
      },
      onAdvance: async (stepIndex) => {
        this._isOpen = true;
        if (this.portalContainer) {
          this.portalContainer.style.display = '';
        }
        await this.stepManager?.enterStep(stepIndex);
        this._currentStepIndex = this.stepManager?.currentStep ?? stepIndex;
        this._stepEnteredAt = Date.now();
        this._savePersistState(true);
        this._renderStep();
      },
      scrollSmooth: this.options.scrollSmooth !== false,
    });
  }

  private async _cleanupForElementAction(): Promise<void> {
    this.waitGeneration += 1;
    this.keyboardCleanup?.();
    this.keyboardCleanup = null;
    this.focusTrap?.deactivate();
    this.focusTrap = null;
    this.elementTrigger?.detach();
    this.elementTrigger = null;
    this.spotlightUnsub?.();
    this.spotlightUnsub = null;
    this._destroySubComponents();
    if (this._containerEl) {
      this._containerEl.innerHTML = '';
    }
  }

  private _handleComplete(): void {
    if (this.options.persist) {
      clearTourState(this.options.persist.key, this.options.persist.type);
    }
    this.options.onComplete?.();
  }

  private _savePersistState(isActive: boolean): void {
    if (!this.options.persist) return;
    saveTourState(
      this.options.persist.key,
      { currentStepIndex: this._currentStepIndex, isActive },
      this.options.persist.type
    );
  }

  // ─── Private: Spotlight ───

  private _computeSpotlightTargets(stepData: Step): SpotlightTargetInput[] {
    const targetSelector = stepData.target ?? '';
    const spotlightPadding =
      stepData.spotlightPadding ?? this.options.spotlightPadding ?? 8;
    const primaryShape = stepData.spotlightShape ?? 'rect';

    const primary: SpotlightTargetInput = {
      selector: targetSelector || 'body',
      padding: spotlightPadding,
      shape: primaryShape,
    };

    const extras = (stepData.additionalTargets ?? []).map(
      (entry: string | AdditionalSpotlightTarget) => {
        const normalized = normalizeAdditionalTarget(entry);
        return {
          selector: normalized.selector,
          padding: normalized.padding ?? spotlightPadding,
          shape: (normalized.shape ?? primaryShape) as SpotlightShape,
        };
      }
    );

    return [primary, ...extras];
  }

  // ─── Private: Debug ───

  private _debugPush(
    type: import('./DebugLogger').DebugEvent['type'],
    message: string
  ): void {
    if (!this.debugEnabled || !this.debugLogger) return;
    this.debugLogger.push(type, message, this._currentStepIndex);
  }

  private _renderDebugHud(stepData?: Step | null): void {
    if (!this.debugLogger || !this._containerEl) return;

    const data = stepData ?? this._getStepData();
    const holes = this.spotlightTracker?.getHoles() ?? [];

    const targets = buildTargetDebugInfo({
      primarySelector: data?.target ?? '',
      primaryShape: data?.spotlightShape,
      additionalTargets: data?.additionalTargets,
      holes,
    });

    const snapshot: DebugSnapshot = {
      currentStep: this._currentStepIndex,
      totalSteps: this.stepManager?.totalSteps ?? 0,
      stepTitle: data?.title,
      stepStatus: this.stepManager?.stepStatus ?? 'idle',
      targetReady: this._targetReady,
      targetWaiting: this._targetWaiting,
      tourVisible: this._isOpen,
      targets,
      trigger: data?.trigger,
      waitForTarget: data?.waitForTarget,
      stepEnteredAt: this._stepEnteredAt,
      events: this.debugLogger.getEvents(),
      persistKey: this.options.persist?.key,
    };

    this.debugHud?.destroy();
    this.debugHud = createDebugHUD({
      snapshot,
      zIndex: (this.options.zIndex ?? 2000) + 50,
    });
    this.debugHud.mount(this._containerEl);
  }

  // ─── Private: Cleanup ───

  private _destroySubComponents(): void {
    this.spotlightUnsub?.();
    this.spotlightUnsub = null;
    this.tooltip?.destroy();
    this.tooltip = null;
    this.spotlightComp?.destroy();
    this.spotlightComp = null;
    this.overlay?.destroy();
    this.overlay = null;
    this.progressComp?.destroy();
    this.progressComp = null;
    this.debugHud?.destroy();
    this.debugHud = null;
    this.elementTrigger?.detach();
    this.elementTrigger = null;
    this.keyboardCleanup?.();
    this.keyboardCleanup = null;
    this.focusTrap?.deactivate();
    this.focusTrap = null;
  }

  private _cleanup(): void {
    if (!this._isOpen && !this._containerEl) return;

    this.waitGeneration += 1;
    this._destroySubComponents();
    this._isOpen = false;
    this._isProcessing = false;
    this._targetReady = true;
    this._targetWaiting = false;

    if (this.restartHandler) {
      document.removeEventListener(GUIDE_RESTART_EVENT, this.restartHandler);
      this.restartHandler = null;
    }

    if (this.portalContainer) {
      destroyPortalElement(this.portalContainer);
      this.portalContainer = null;
    }

    this._containerEl = null;
    this.spotlightTracker?.setTargets([]);
  }
}
