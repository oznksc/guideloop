import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Portal } from '../GuideLoop/Portal';
import type {
  OnboardingActionContext,
  OnboardingLabels,
  OnboardingModalAction,
} from './types';

type StyleVariables = React.CSSProperties & Record<string, string | number | undefined>;

interface OnboardingModalProps {
  itemId: string;
  fallbackTitle: React.ReactNode;
  action: OnboardingModalAction;
  context: OnboardingActionContext;
  labels: OnboardingLabels;
  styleVariables: StyleVariables;
  zIndex: number;
  onRequestClose: () => void;
  onError: (error: unknown) => void;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.getAttribute('aria-hidden') !== 'true'
  );
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  itemId,
  fallbackTitle,
  action,
  context,
  labels,
  styleVariables,
  zIndex,
  onRequestClose,
  onError,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);
  const closedRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const titleId = useMemo(
    () => `guideloop-onboarding-modal-${itemId.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [itemId]
  );

  const closeModal = (force = false) => {
    if (closedRef.current || (busyRef.current && !force)) return;
    closedRef.current = true;
    action.onClose?.(context);
    onRequestClose();
  };
  const modalContext: OnboardingActionContext = {
    ...context,
    close: () => closeModal(true),
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const focusTarget = primaryButtonRef.current ||
      (dialog ? getFocusableElements(dialog)[0] : null);
    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const handlePrimary = async () => {
    if (busy) return;

    busyRef.current = true;
    setBusy(true);
    setHasError(false);
    try {
      const result = await action.onPrimary?.(modalContext);
      if (result === false) return;

      if (action.completeOnPrimary !== false) {
        context.complete();
      }
      if (action.closeOnPrimary !== false) {
        closeModal(true);
      }
    } catch (error) {
      setHasError(true);
      onError(error);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const handleSecondary = () => {
    action.onSecondary?.(modalContext);
    closeModal();
  };

  const content = typeof action.content === 'function'
    ? action.content(modalContext)
    : action.content;

  return (
    <Portal>
      <div
        className="guideloop-onboarding-modal__backdrop"
        style={{ ...styleVariables, zIndex }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div
          ref={dialogRef}
          className="guideloop-onboarding-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-busy={busy}
          tabIndex={-1}
        >
          <div className="guideloop-onboarding-modal__header">
            <h2 id={titleId} className="guideloop-onboarding-modal__title">
              {action.title ?? fallbackTitle}
            </h2>
            <button
              type="button"
              className="guideloop-onboarding-modal__close"
              aria-label={labels.close}
              onClick={() => closeModal()}
              disabled={busy}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="guideloop-onboarding-modal__body">{content}</div>

          {hasError && (
            <p className="guideloop-onboarding-modal__error" role="alert">
              {labels.error}
            </p>
          )}

          <div className="guideloop-onboarding-modal__footer">
            {action.secondaryLabel && (
              <button
                type="button"
                className="guideloop-onboarding-modal__button"
                onClick={handleSecondary}
                disabled={busy}
              >
                {action.secondaryLabel}
              </button>
            )}
            <button
              ref={primaryButtonRef}
              type="button"
              className="guideloop-onboarding-modal__button guideloop-onboarding-modal__button--primary"
              onClick={handlePrimary}
              disabled={busy}
            >
              {busy ? labels.loading : (action.primaryLabel ?? labels.done)}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
