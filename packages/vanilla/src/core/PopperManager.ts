/**
 * PopperManager — wrapper around @popperjs/core for tooltip positioning.
 * Lazily imports Popper.js on first use.
 */

import type { Instance, Placement, Options } from '@popperjs/core';

let PopperModule: typeof import('@popperjs/core') | null = null;

async function loadPopper(): Promise<typeof import('@popperjs/core')> {
  if (!PopperModule) {
    PopperModule = await import('@popperjs/core');
  }
  return PopperModule;
}

export interface PopperManagerInstance {
  update: () => Promise<void>;
  destroy: () => void;
  setReference: (element: HTMLElement | null) => void;
  setTooltip: (element: HTMLElement | null) => void;
}

export function createPopperManager(
  referenceElement: HTMLElement | null,
  tooltipElement: HTMLElement | null,
  placement: Placement = 'bottom',
  modifiers: Options['modifiers'] = []
): PopperManagerInstance {
  let instance: Instance | null = null;
  let cancelled = false;
  let currentReference = referenceElement;
  let currentTooltip = tooltipElement;

  async function setup(): Promise<void> {
    if (cancelled || !currentReference || !currentTooltip) return;

    const { createPopper } = await loadPopper();
    if (cancelled) return;

    // Destroy previous instance if any
    instance?.destroy();

    instance = createPopper(currentReference, currentTooltip, {
      placement,
      strategy: 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: { offset: [0, 12] },
        },
        {
          name: 'preventOverflow',
          options: { padding: 12, boundary: 'viewport' },
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
  }

  // Initial setup
  void setup();

  return {
    async update() {
      if (!cancelled) {
        await instance?.update();
      }
    },

    destroy() {
      cancelled = true;
      instance?.destroy();
      instance = null;
    },

    setReference(element: HTMLElement | null) {
      currentReference = element;
      instance?.destroy();
      instance = null;
      void setup();
    },

    setTooltip(element: HTMLElement | null) {
      currentTooltip = element;
      instance?.destroy();
      instance = null;
      void setup();
    },
  };
}
