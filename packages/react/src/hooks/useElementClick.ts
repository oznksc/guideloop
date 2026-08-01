import { useCallback, useRef } from 'react';
import { scrollIntoView, createRestartEvent } from '@guideloop/core';

interface UseElementClickProps {
  scrollSmooth: boolean;
}

export interface ElementClickOptions {
  elementSelector?: string;
  delay?: number;
  onClick?: () => void | Promise<void>;
  nextStepIndex?: number;
  hideTour?: () => void;
  onAdvance?: (stepIndex: number) => void | Promise<void>;
}

interface UseElementClickReturn {
  handleElementClick: (options: ElementClickOptions) => Promise<void>;
  processingRef: React.MutableRefObject<boolean>;
}

export const useElementClick = ({
  scrollSmooth,
}: UseElementClickProps): UseElementClickReturn => {
  const processingRef = useRef(false);

  const triggerElementClick = useCallback(async (element: Element): Promise<void> => {
    return new Promise((resolve) => {
      if (element instanceof HTMLElement) {
        element.click();
      } else {
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        element.dispatchEvent(clickEvent);
      }
      setTimeout(resolve, 100);
    });
  }, []);

  const handleElementClick = useCallback(async ({
    elementSelector,
    delay = 0,
    onClick,
    nextStepIndex,
    hideTour,
    onAdvance,
  }: ElementClickOptions) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      if (onClick) {
        await Promise.resolve(onClick());
      }

      if (elementSelector) {
        const element = document.querySelector(elementSelector);
        if (!element) {
          console.warn(
            `Element with selector '${elementSelector}' not found, advancing to next step`
          );
          if (typeof nextStepIndex === 'number') {
            await onAdvance?.(nextStepIndex);
          }
          return;
        }

        if (scrollSmooth) {
          await scrollIntoView(element, { behavior: 'smooth' });
        }

        hideTour?.();
        await triggerElementClick(element);

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (typeof nextStepIndex === 'number') {
          document.dispatchEvent(createRestartEvent(nextStepIndex));
        }
      } else if (typeof nextStepIndex === 'number') {
        await onAdvance?.(nextStepIndex);
      }
    } catch (error) {
      console.error('Error during element click:', error);
      if (typeof nextStepIndex === 'number') {
        await onAdvance?.(nextStepIndex);
      }
    } finally {
      processingRef.current = false;
    }
  }, [scrollSmooth, triggerElementClick]);

  return { handleElementClick, processingRef };
};
