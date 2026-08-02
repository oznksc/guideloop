/**
 * Element trigger — listens for DOM events on a target element
 * and fires a callback when the event occurs.
 */

import type { StepTrigger } from '@guideloop/core';

const EVENT_MAP: Record<StepTrigger, string> = {
  click: 'click',
  change: 'change',
  blur: 'blur',
  hover: 'mouseenter',
  drag: 'dragend',
};

export interface ElementTriggerInstance {
  attach: () => void;
  detach: () => void;
}

export function createElementTrigger(
  targetSelector: string,
  trigger: StepTrigger | undefined,
  onTrigger: () => void
): ElementTriggerInstance {
  let handler: ((event: Event) => void) | null = null;
  let element: Element | null = null;

  return {
    attach() {
      this.detach();
      if (!trigger || !targetSelector) return;

      const eventType = EVENT_MAP[trigger];
      if (!eventType) return;

      try {
        element = document.querySelector(targetSelector);
      } catch {
        console.warn(`GuideLoop: Invalid selector "${targetSelector}"`);
        return;
      }

      if (!element) {
        console.warn(
          `GuideLoop: Target element '${targetSelector}' not found for trigger '${trigger}'`
        );
        return;
      }

      handler = (event: Event) => {
        event.preventDefault();
        onTrigger();
      };

      element.addEventListener(eventType, handler);
    },

    detach() {
      if (element && handler) {
        const eventType = EVENT_MAP[trigger!];
        if (eventType) {
          element.removeEventListener(eventType, handler);
        }
      }
      handler = null;
      element = null;
    },
  };
}
