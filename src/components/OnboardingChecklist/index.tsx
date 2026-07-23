import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GuideLoop } from '../GuideLoop';
import { useTheme } from '../../hooks/useTheme';
import {
  loadOnboardingState,
  saveOnboardingState,
} from '../../utils/onboardingState';
import { OnboardingModal } from './OnboardingModal';
import { injectOnboardingStyles } from './styles';
import type {
  OnboardingActionContext,
  OnboardingChecklistProps,
  OnboardingItem,
  OnboardingLabels,
  OnboardingProgress,
  OnboardingTourAction,
} from './types';

type StyleVariables = React.CSSProperties & Record<string, string | number | undefined>;

const defaultLabels: OnboardingLabels = {
  progress: (completed, total) => `${completed}/${total} steps completed`,
  completed: 'Completed',
  loading: 'Loading…',
  error: 'Something went wrong. Please try again.',
  done: 'Done',
  close: 'Close',
  collapse: 'Collapse checklist',
  expand: 'Expand checklist',
};

function uniqueIds(ids: string[]): string[] {
  return ids.reduce<string[]>((result, id) => {
    if (!result.includes(id)) result.push(id);
    return result;
  }, []);
}

function equalIds(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function deferFocus(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') return;
  window.setTimeout(() => element.focus(), 0);
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  items,
  title = 'Getting Started',
  description,
  completedIds: controlledCompletedIds,
  defaultCompletedIds = [],
  onCompletedIdsChange,
  onProgressChange,
  onComplete,
  onItemAction,
  onActionError,
  persist,
  theme = 'tailwind',
  customTheme,
  labels: customLabels,
  collapsible = true,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  showProgressBar = true,
  emptyState = 'No onboarding steps yet.',
  ariaLabel = 'Getting started checklist',
  className,
  style,
  zIndex = 3000,
}) => {
  const isCompletionControlled = controlledCompletedIds !== undefined;
  const isCollapseControlled = controlledCollapsed !== undefined;
  const persistKey = persist?.key;
  const persistType = persist?.type;
  const defaultCompletedIdsJson = JSON.stringify(uniqueIds(defaultCompletedIds));
  const themeStyles = useTheme(theme, customTheme);
  const labels = useMemo(
    () => ({ ...defaultLabels, ...customLabels }),
    [customLabels]
  );

  const [internalCompletedIds, setInternalCompletedIds] = useState<string[]>(
    () => uniqueIds(defaultCompletedIds)
  );
  const [hydratedPersistKey, setHydratedPersistKey] = useState<string | null>(null);
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const [activeModalItem, setActiveModalItem] = useState<OnboardingItem | null>(null);
  const [activeTourItem, setActiveTourItem] = useState<OnboardingItem | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [errorItemId, setErrorItemId] = useState<string | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const completionNotifiedRef = useRef(false);

  useEffect(() => {
    injectOnboardingStyles();
  }, []);

  useEffect(() => {
    if (!persistKey) {
      setHydratedPersistKey(null);
      return;
    }

    if (!isCompletionControlled) {
      const saved = loadOnboardingState(persistKey, persistType);
      const fallbackIds = JSON.parse(defaultCompletedIdsJson) as string[];
      setInternalCompletedIds(saved?.completedIds ?? fallbackIds);
    }
    setHydratedPersistKey(persistKey);
  }, [
    defaultCompletedIdsJson,
    isCompletionControlled,
    persistKey,
    persistType,
  ]);

  const persistenceReady = !persistKey || hydratedPersistKey === persistKey;
  const validItemIds = useMemo(() => items.map((item) => item.id), [items]);
  const sourceCompletedIds = isCompletionControlled
    ? controlledCompletedIds
    : internalCompletedIds;
  const completedIds = useMemo(
    () => uniqueIds(sourceCompletedIds).filter((id) => validItemIds.includes(id)),
    [sourceCompletedIds, validItemIds]
  );
  const completedIdsRef = useRef(completedIds);

  useEffect(() => {
    completedIdsRef.current = completedIds;
  }, [completedIds]);

  const progress = useMemo<OnboardingProgress>(() => {
    const completed = completedIds.length;
    const total = items.length;
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      completedIds,
    };
  }, [completedIds, items.length]);

  useEffect(() => {
    if (!persistenceReady) return;
    onProgressChange?.(progress);
  }, [onProgressChange, persistenceReady, progress]);

  useEffect(() => {
    if (!persistKey || !persistenceReady) return;
    saveOnboardingState(persistKey, completedIds, persistType);
  }, [completedIds, persistKey, persistType, persistenceReady]);

  useEffect(() => {
    if (!persistenceReady) return;
    const isFinished = progress.total > 0 && progress.completed === progress.total;
    if (isFinished && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.(progress);
    } else if (!isFinished) {
      completionNotifiedRef.current = false;
    }
  }, [onComplete, persistenceReady, progress]);

  const commitCompletedIds = useCallback((nextIds: string[]) => {
    const normalized = uniqueIds(nextIds).filter((id) => validItemIds.includes(id));
    if (equalIds(normalized, completedIdsRef.current)) return;

    if (!isCompletionControlled) {
      completedIdsRef.current = normalized;
      setInternalCompletedIds(normalized);
      if (persistKey) {
        saveOnboardingState(persistKey, normalized, persistType);
      }
    }
    onCompletedIdsChange?.(normalized);
  }, [
    isCompletionControlled,
    onCompletedIdsChange,
    persistKey,
    persistType,
    validItemIds,
  ]);

  const completeItem = useCallback((itemId: string) => {
    commitCompletedIds([...completedIdsRef.current, itemId]);
  }, [commitCompletedIds]);

  const uncompleteItem = useCallback((itemId: string) => {
    commitCompletedIds(completedIdsRef.current.filter((id) => id !== itemId));
  }, [commitCompletedIds]);

  const createContext = useCallback((itemId: string): OnboardingActionContext => {
    const close = () => {
      setActiveModalItem((activeItem) => activeItem?.id === itemId ? null : activeItem);
      setActiveTourItem((activeItem) => activeItem?.id === itemId ? null : activeItem);
      deferFocus(triggerElementRef.current);
    };

    return {
      itemId,
      isComplete: completedIdsRef.current.includes(itemId),
      setCompleted: (completed) => {
        if (completed) completeItem(itemId);
        else uncompleteItem(itemId);
      },
      complete: () => completeItem(itemId),
      uncomplete: () => uncompleteItem(itemId),
      close,
    };
  }, [completeItem, uncompleteItem]);

  const reportActionError = useCallback((error: unknown, item: OnboardingItem) => {
    setErrorItemId(item.id);
    onActionError?.(error, item);
  }, [onActionError]);

  const handleCustomAction = useCallback(async (item: OnboardingItem) => {
    if (!item.action || item.action.type !== 'custom' || busyItemId) return;

    setBusyItemId(item.id);
    setErrorItemId(null);
    try {
      await item.action.onAction(createContext(item.id));
      if (item.action.completeOnResolve) {
        completeItem(item.id);
      }
    } catch (error) {
      reportActionError(error, item);
    } finally {
      setBusyItemId(null);
    }
  }, [busyItemId, completeItem, createContext, reportActionError]);

  const handleItemAction = useCallback((
    item: OnboardingItem,
    triggerElement: HTMLElement
  ) => {
    if (
      item.disabled ||
      busyItemId === item.id ||
      (busyItemId !== null && item.action?.type === 'custom')
    ) return;

    triggerElementRef.current = triggerElement;
    setErrorItemId(null);
    onItemAction?.(item);

    if (!item.action) {
      completeItem(item.id);
      return;
    }

    if (item.action.type === 'modal') {
      setActiveModalItem(item);
    } else if (item.action.type === 'tour') {
      setActiveTourItem(item);
    } else if (item.action.type === 'custom') {
      void handleCustomAction(item);
    }
  }, [busyItemId, completeItem, handleCustomAction, onItemAction]);

  const currentCollapsed = isCollapseControlled
    ? controlledCollapsed
    : internalCollapsed;

  const toggleCollapsed = () => {
    const nextCollapsed = !currentCollapsed;
    if (!isCollapseControlled) setInternalCollapsed(nextCollapsed);
    onCollapsedChange?.(nextCollapsed);
  };

  const styleVariables: StyleVariables = {
    '--gl-onboarding-background': themeStyles.tooltip.background,
    '--gl-onboarding-text': themeStyles.tooltip.textColor,
    '--gl-onboarding-accent': themeStyles.buttons.primary.background,
    '--gl-onboarding-accent-text': theme === 'antd'
      ? themeStyles.tooltip.textColor
      : themeStyles.buttons.primary.textColor,
    '--gl-onboarding-radius': themeStyles.tooltip.borderRadius,
    '--gl-onboarding-shadow': themeStyles.tooltip.boxShadow,
  };

  const activeModalAction = activeModalItem?.action?.type === 'modal'
    ? activeModalItem.action
    : null;
  const activeTourAction: OnboardingTourAction | null =
    activeTourItem?.action?.type === 'tour' ? activeTourItem.action : null;

  const closeModal = () => {
    setActiveModalItem(null);
    deferFocus(triggerElementRef.current);
  };

  const closeTour = () => {
    if (activeTourItem && activeTourAction) {
      activeTourAction.onClose?.(createContext(activeTourItem.id));
    }
    setActiveTourItem(null);
    deferFocus(triggerElementRef.current);
  };

  const skipTour = () => {
    if (!activeTourItem || !activeTourAction) return;
    const context = createContext(activeTourItem.id);
    if (activeTourAction.completeOnSkip) context.complete();
    activeTourAction.onSkip?.(context);
  };

  const completeTour = () => {
    if (!activeTourItem || !activeTourAction) return;
    const context = createContext(activeTourItem.id);
    context.complete();
    activeTourAction.onComplete?.(context);
  };

  const rootClassName = ['guideloop-onboarding', className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <section
        className={rootClassName}
        style={{ ...styleVariables, ...style }}
        aria-label={ariaLabel}
        data-collapsed={currentCollapsed}
        data-complete={progress.total > 0 && progress.completed === progress.total}
      >
        <div className="guideloop-onboarding__header">
          <div className="guideloop-onboarding__heading">
            <h2 className="guideloop-onboarding__title">{title}</h2>
            {description && (
              <p className="guideloop-onboarding__description">{description}</p>
            )}
            <div className="guideloop-onboarding__progress-copy" aria-live="polite">
              {labels.progress(progress.completed, progress.total)}
            </div>
          </div>

          {collapsible && (
            <button
              type="button"
              className="guideloop-onboarding__collapse"
              aria-expanded={!currentCollapsed}
              aria-label={currentCollapsed ? labels.expand : labels.collapse}
              onClick={toggleCollapsed}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )}
        </div>

        {showProgressBar && (
          <div
            className="guideloop-onboarding__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.completed}
            aria-label={typeof title === 'string' ? `${title} progress` : 'Onboarding progress'}
          >
            <div
              className="guideloop-onboarding__progress-value"
              style={{ '--gl-onboarding-progress': progress.percentage / 100 } as StyleVariables}
            />
          </div>
        )}

        {!currentCollapsed && (
          items.length > 0 ? (
            <ul className="guideloop-onboarding__items">
              {items.map((item) => {
                const isComplete = completedIds.includes(item.id);
                const isBusy = busyItemId === item.id;
                const hasError = errorItemId === item.id;
                const state = isBusy
                  ? 'loading'
                  : hasError
                    ? 'error'
                    : isComplete
                      ? 'success'
                      : 'default';
                const descriptionContent = hasError ? labels.error : item.description;
                const commonProps = {
                  className: 'guideloop-onboarding__item-control',
                  'data-state': state,
                  'aria-disabled': item.disabled || isBusy,
                  'aria-busy': isBusy,
                };
                const itemContent = (
                  <>
                    <span className="guideloop-onboarding__status" aria-hidden="true">
                      {isComplete && !isBusy && (
                        <svg width="13" height="13" viewBox="0 0 16 16">
                          <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                      {hasError && !isBusy && <span>!</span>}
                      {!isComplete && !isBusy && !hasError && item.icon && (
                        <span className="guideloop-onboarding__item-icon">{item.icon}</span>
                      )}
                    </span>
                    <span className="guideloop-onboarding__item-copy">
                      <span className="guideloop-onboarding__item-title">{item.title}</span>
                      {descriptionContent && (
                        <span className="guideloop-onboarding__item-description">
                          {descriptionContent}
                        </span>
                      )}
                      <span style={{ position: 'absolute', inlineSize: 1, blockSize: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                        {isComplete ? labels.completed : isBusy ? labels.loading : ''}
                      </span>
                    </span>
                    <span className="guideloop-onboarding__chevron" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 16 16">
                        <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </>
                );

                return (
                  <li key={item.id}>
                    {item.action?.type === 'link' ? (
                      <a
                        {...commonProps}
                        href={item.action.href}
                        target={item.action.target}
                        rel={item.action.rel ?? (item.action.target === '_blank' ? 'noopener noreferrer' : undefined)}
                        tabIndex={item.disabled ? -1 : undefined}
                        onClick={(event) => {
                          if (item.disabled || isBusy) {
                            event.preventDefault();
                            return;
                          }
                          triggerElementRef.current = event.currentTarget;
                          setErrorItemId(null);
                          onItemAction?.(item);
                          const context = createContext(item.id);
                          if (item.action?.type === 'link') {
                            if (item.action.completeOnClick !== false) context.complete();
                            item.action.onNavigate?.(context);
                          }
                        }}
                      >
                        {itemContent}
                      </a>
                    ) : (
                      <button
                        {...commonProps}
                        type="button"
                        disabled={item.disabled || isBusy}
                        onClick={(event) => handleItemAction(item, event.currentTarget)}
                      >
                        {itemContent}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="guideloop-onboarding__empty">{emptyState}</p>
          )
        )}
      </section>

      {activeModalItem && activeModalAction && (
        <OnboardingModal
          itemId={activeModalItem.id}
          fallbackTitle={activeModalItem.title}
          action={activeModalAction}
          context={createContext(activeModalItem.id)}
          labels={labels}
          styleVariables={styleVariables}
          zIndex={zIndex}
          onRequestClose={closeModal}
          onError={(error) => reportActionError(error, activeModalItem)}
        />
      )}

      {activeTourItem && activeTourAction && (
        <GuideLoop
          {...activeTourAction.guideProps}
          steps={activeTourAction.steps}
          isOpen={true}
          onClose={closeTour}
          onSkip={skipTour}
          onComplete={completeTour}
          theme={activeTourAction.guideProps?.theme ?? theme}
          customTheme={activeTourAction.guideProps?.customTheme ?? customTheme}
          zIndex={activeTourAction.guideProps?.zIndex ?? zIndex}
        />
      )}
    </>
  );
};

export type {
  OnboardingActionContext,
  OnboardingChecklistProps,
  OnboardingCustomAction,
  OnboardingItem,
  OnboardingItemAction,
  OnboardingLabels,
  OnboardingLinkAction,
  OnboardingModalAction,
  OnboardingPersistConfig,
  OnboardingProgress,
  OnboardingTourAction,
} from './types';
