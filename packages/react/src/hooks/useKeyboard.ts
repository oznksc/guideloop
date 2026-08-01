import { useEffect } from 'react';

interface UseKeyboardProps {
  enabled: boolean;
  onEscape?: () => void;
  onArrowRight?: () => void;
  onArrowLeft?: () => void;
  onEnter?: () => void;
}

export const useKeyboard = ({
  enabled,
  onEscape,
  onArrowRight,
  onArrowLeft,
  onEnter,
}: UseKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'ArrowRight':
          onArrowRight?.();
          break;
        case 'ArrowLeft':
          onArrowLeft?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape, onArrowRight, onArrowLeft, onEnter]);
};
