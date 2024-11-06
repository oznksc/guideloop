import { useEffect, useState } from 'react';
import { createPopper, Instance, Placement, Options } from '@popperjs/core';

interface UsePopperProps {
  referenceElement: HTMLElement | null;
  tooltipElement: HTMLElement | null;
  placement?: Placement;
  modifiers?: Options['modifiers'];
}

export const usePopper = ({
  referenceElement,
  tooltipElement,
  placement = 'bottom',
  modifiers = []
}: UsePopperProps) => {
  const [popperInstance, setPopperInstance] = useState<Instance | null>(null);

  useEffect(() => {
    if (!referenceElement || !tooltipElement) {
      return;
    }

    const instance = createPopper(referenceElement, tooltipElement, {
      placement,
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 12], // [skidding, distance]
          },
        },
        {
          name: 'preventOverflow',
          options: {
            padding: 12, // Minimum distance from viewport edges
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

    setPopperInstance(instance);

    return () => {
      instance.destroy();
    };
  }, [referenceElement, tooltipElement, placement]);

  return { update: () => popperInstance?.update() };
};
