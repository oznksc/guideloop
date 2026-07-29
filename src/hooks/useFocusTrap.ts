import { useEffect, useRef, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface UseFocusTrapOptions {
  enabled: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Extra deps that should re-run initial focus (e.g. target ready state). */
  focusKey?: string | number | boolean;
}

/**
 * Traps Tab focus inside `containerRef` while enabled and restores focus to
 * the previously focused element when the trap is torn down.
 */
export const useFocusTrap = ({
  enabled,
  containerRef,
  focusKey,
}: UseFocusTrapOptions): void => {
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const dialog = containerRef.current;
    if (!dialog) return;

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
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
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
  }, [enabled, containerRef, focusKey]);
};
