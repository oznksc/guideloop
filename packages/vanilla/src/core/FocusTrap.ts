/**
 * Focus trap — traps Tab focus within a container element
 * and restores the previously focused element on cleanup.
 */

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface FocusTrapInstance {
  activate: () => void;
  deactivate: () => void;
}

export function createFocusTrap(container: HTMLElement): FocusTrapInstance {
  let openerElement: HTMLElement | null = null;
  let trapHandler: ((e: KeyboardEvent) => void) | null = null;

  return {
    activate() {
      // Remember who had focus before we took over
      const active = document.activeElement;
      openerElement =
        active instanceof HTMLElement && active !== document.body
          ? active
          : null;

      // Focus the next button or the container itself
      const preferredControl =
        container.querySelector<HTMLElement>('[data-guideloop-action="next"]') ??
        container.querySelector<HTMLElement>('[data-guideloop-action="close"]') ??
        container;

      setTimeout(() => {
        preferredControl?.focus({ preventScroll: true });
      }, 0);

      // Trap tab focus
      trapHandler = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (!focusable.length) {
          event.preventDefault();
          container.focus({ preventScroll: true });
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const currentActive = document.activeElement;

        if (!container.contains(currentActive)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus({ preventScroll: true });
        } else if (event.shiftKey && currentActive === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && currentActive === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      };

      document.addEventListener('keydown', trapHandler, true);
    },

    deactivate() {
      if (trapHandler) {
        document.removeEventListener('keydown', trapHandler, true);
        trapHandler = null;
      }

      // Restore focus to the opener element
      if (openerElement?.isConnected) {
        setTimeout(() => {
          openerElement?.focus({ preventScroll: true });
          openerElement = null;
        }, 0);
      }
    },
  };
}
