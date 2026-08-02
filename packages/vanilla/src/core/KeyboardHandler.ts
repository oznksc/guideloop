/**
 * Keyboard handler — attaches global keydown listeners
 * and dispatches to registered callbacks.
 */

export interface KeyboardHandlers {
  onEscape?: () => void;
  onArrowRight?: () => void;
  onArrowLeft?: () => void;
  onEnter?: () => void;
}

let activeHandler: KeyboardHandlers | null = null;
let keydownListener: ((e: KeyboardEvent) => void) | null = null;

function handleKeyDown(event: KeyboardEvent): void {
  if (!activeHandler) return;

  switch (event.key) {
    case 'Escape':
      activeHandler.onEscape?.();
      break;
    case 'ArrowRight':
      activeHandler.onArrowRight?.();
      break;
    case 'ArrowLeft':
      activeHandler.onArrowLeft?.();
      break;
    case 'Enter':
      activeHandler.onEnter?.();
      break;
  }
}

export function enableKeyboard(handlers: KeyboardHandlers): () => void {
  disableKeyboard();
  activeHandler = handlers;
  keydownListener = handleKeyDown;
  window.addEventListener('keydown', keydownListener);

  return () => {
    disableKeyboard();
  };
}

export function disableKeyboard(): void {
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener);
    keydownListener = null;
  }
  activeHandler = null;
}
