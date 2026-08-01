'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Portal } from '../GuideLoop/Portal';
import type {
  OnboardingActionContext,
  OnboardingLabels,
  OnboardingModalAction,
} from './types';

interface OnboardingModalProps {
  itemId: string;
  fallbackTitle: React.ReactNode;
  action: OnboardingModalAction;
  labels: OnboardingLabels;
  context: OnboardingActionContext;
  styleVariables?: React.CSSProperties & Record<string, string | number | undefined>;
  zIndex?: number;
  onRequestClose: () => void;
  onError?: (error: unknown) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  itemId,
  fallbackTitle,
  action,
  labels,
  context,
  styleVariables: _styleVariables,
  zIndex: _zIndex,
  onRequestClose,
  onError,
}) => {
  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;
  const [hasError, setHasError] = useState(false);

  const title = action.title ?? fallbackTitle;

  const content = useMemo(() => {
    if (typeof action.content === 'function') {
      return action.content(context);
    }
    return action.content;
  }, [action.content, context]);

  const handlePrimary = async () => {
    setHasError(false);
    try {
      const result = await action.onPrimary?.(context);
      if (result === false) return;

      if (action.completeOnPrimary !== false) {
        context.complete();
      }
      if (action.closeOnPrimary !== false) {
        closeRef.current();
      }
    } catch (error) {
      setHasError(true);
      onError?.(error);
    }
  };

  const handleSecondary = () => {
    action.onSecondary?.(context);
    closeRef.current();
  };

  return (
    <Portal>
      <div className="guideloop-onboarding-modal__backdrop" role="dialog" aria-modal="true" aria-labelledby={`onboarding-modal-title-${itemId}`}>
        <div className="guideloop-onboarding-modal">
          <div className="guideloop-onboarding-modal__header">
            <h2 id={`onboarding-modal-title-${itemId}`} className="guideloop-onboarding-modal__title">
              {title}
            </h2>
            <button
              className="guideloop-onboarding-modal__close"
              onClick={() => closeRef.current()}
              aria-label={labels.close}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="guideloop-onboarding-modal__body">
            {content}
            {hasError && (
              <div role="alert" className="guideloop-onboarding-modal__error">
                Something went wrong. Please try again.
              </div>
            )}
          </div>
          <div className="guideloop-onboarding-modal__footer">
            <button
              className="guideloop-onboarding-modal__button"
              onClick={handleSecondary}
            >
              {action.secondaryLabel ?? labels.close}
            </button>
            <button
              className="guideloop-onboarding-modal__button guideloop-onboarding-modal__button--primary"
              onClick={handlePrimary}
            >
              {action.primaryLabel ?? labels.done}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
