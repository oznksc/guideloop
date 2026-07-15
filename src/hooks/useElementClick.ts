import { useCallback, useRef } from 'react';
import { scrollIntoView } from '../utils/scroll';
import { createRestartEvent } from '../utils/events';

interface UseElementClickProps {
  scrollSmooth: boolean;
}

interface UseElementClickReturn {
  handleElementClick: (
    elementId: string | undefined,
    delay: number | undefined,
    onClick: (() => void) | undefined,
    nextStepIndex: number | undefined,
    setCurrentStep: ((step: number) => void) | undefined,
    setCurrentStepIndex: ((step: number) => void) | undefined,
    setTourVisible: ((visible: boolean) => void) | undefined,
  ) => Promise<void>;
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

  const handleElementClick = useCallback(async (
    elementId: string | undefined,
    delay = 0,
    onClick?: () => void,
    nextStepIndex?: number,
    setCurrentStep?: (step: number) => void,
    setCurrentStepIndex?: (step: number) => void,
    setTourVisible?: (visible: boolean) => void,
  ) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      if (onClick) {
        await Promise.resolve(onClick());
      }

      if (elementId && setCurrentStep && setCurrentStepIndex && setTourVisible) {
        const element = document.querySelector(elementId);
        if (!element) {
          console.warn(`Element with id '${elementId}' not found, advancing to next step`);
          if (typeof nextStepIndex === 'number') {
            setCurrentStepIndex(nextStepIndex);
            setCurrentStep(nextStepIndex);
          }
          return;
        }

        if (scrollSmooth) {
          await scrollIntoView(element, { behavior: 'smooth' });
        }

        setTourVisible(false);
        await triggerElementClick(element);

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        if (typeof nextStepIndex === 'number') {
          document.dispatchEvent(createRestartEvent(nextStepIndex));
        }
      } else if (typeof nextStepIndex === 'number' && setCurrentStep && setCurrentStepIndex) {
        setCurrentStepIndex(nextStepIndex);
        setCurrentStep(nextStepIndex);
      }
    } catch (error) {
      console.error('Error during element click:', error);
      if (typeof nextStepIndex === 'number' && setCurrentStep && setCurrentStepIndex) {
        setCurrentStepIndex(nextStepIndex);
        setCurrentStep(nextStepIndex);
      }
    } finally {
      processingRef.current = false;
    }
  }, [scrollSmooth, triggerElementClick]);

  return { handleElementClick, processingRef };
};
