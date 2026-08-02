/**
 * Element click handler — programmatically scrolls to and clicks
 * an element, optionally hiding the tour and restarting after a delay.
 */

import { scrollIntoView, createRestartEvent } from '@guideloop/core';

export interface ElementClickOptions {
  elementSelector?: string;
  delay?: number;
  onClick?: () => void | Promise<void>;
  nextStepIndex?: number;
  hideTour?: () => void;
  onAdvance?: (stepIndex: number) => void | Promise<void>;
  scrollSmooth: boolean;
}

let processing = false;

export async function handleElementClick(options: ElementClickOptions): Promise<void> {
  const {
    elementSelector,
    delay = 0,
    onClick,
    nextStepIndex,
    hideTour,
    onAdvance,
    scrollSmooth,
  } = options;

  if (processing) return;
  processing = true;

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

      // Hide the tour
      hideTour?.();

      // Click the element
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

      // Wait 100ms for the click to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Dispatch restart event
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
    processing = false;
  }
}

export function isElementClickProcessing(): boolean {
  return processing;
}
