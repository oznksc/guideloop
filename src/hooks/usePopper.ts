import { useEffect, useRef } from 'react';
import type { Instance, Placement, Options } from '@popperjs/core';

interface UsePopperProps {
  referenceElement: HTMLElement | null;
  tooltipElement: HTMLElement | null;
  placement?: Placement;
  modifiers?: Options['modifiers'];
}

/**
 * Positions the tooltip with Popper.js.
 * Loads `@popperjs/core` via dynamic import so consumer bundlers can code-split it
 * and the library never eagerly evaluates Popper on import.
 */
export const usePopper = ({
  referenceElement,
  tooltipElement,
  placement = 'bottom',
  modifiers = [],
}: UsePopperProps) => {
  const instanceRef = useRef<Instance | null>(null);

  useEffect(() => {
    if (!referenceElement || !tooltipElement) {
      return undefined;
    }

    let cancelled = false;

    const setup = async () => {
      // Dynamic import — kept external by Rollup; enables async chunks in apps.
      const { createPopper } = await import('@popperjs/core');
      if (cancelled) return;

      const instance = createPopper(referenceElement, tooltipElement, {
        placement,
        strategy: 'fixed',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 12],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 12,
              boundary: 'viewport',
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'right', 'bottom', 'left'],
              padding: 12,
            },
          },
          ...modifiers,
        ],
      });

      instanceRef.current = instance;
    };

    void setup();

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
    // modifiers intentionally omitted: callers pass inline arrays; identity churn
    // would thrash Popper. placement/ref/tooltip cover the public surface.
  }, [referenceElement, tooltipElement, placement]);

  return {
    update: () => {
      void instanceRef.current?.update();
    },
  };
};
