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
 *
 * Retries until `containerRef.current` is set so deferred portals (SSR-safe
 * client mount) still receive initial focus under React 18/19.
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

    let cancelled = false;
    let focusTimer: number | undefined;
    let retryTimer: number | undefined;
    let removeTrap: (() => void) | undefined;

    const attach = (dialog: HTMLElement) => {
      const focusInitialControl = () => {
        if (cancelled) return;
        const preferredControl =
          dialog.querySelector<HTMLElement>('[data-guideloop-action="next"]') ??
          dialog.querySelector<HTMLElement>('[data-guideloop-action="close"]') ??
          dialog;
        preferredControl.focus({ preventScroll: true });
      };

      focusTimer = window.setTimeout(focusInitialControl, 0);

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
      removeTrap = () => {
        document.removeEventListener('keydown', trapFocus, true);
      };
    };

    const tryAttach = () => {
      if (cancelled) return;
      const dialog = containerRef.current;
      if (!dialog) {
        // Portal may still be null after first paint (client-only mount)
        retryTimer = window.setTimeout(tryAttach, 0);
        return;
      }
      attach(dialog);
    };

    tryAttach();

    return () => {
      cancelled = true;
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      removeTrap?.();
    };
  }, [enabled, containerRef, focusKey]);
};
