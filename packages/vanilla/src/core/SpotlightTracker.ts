/**
 * Spotlight tracker — measures target elements and keeps their
 * padded viewport rects in sync with scroll/resize/mutation.
 */

import type { SpotlightShape, SpotlightHole } from '@guideloop/core';

export interface SpotlightTargetInput {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}

export type SpotlightTrackerListener = (holes: SpotlightHole[]) => void;

const DEFAULT_POSITION: SpotlightHole = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  shape: 'rect',
  padding: 0,
};

function measureElement(
  selector: string,
  padding: number,
  shape: SpotlightShape = 'rect'
): SpotlightHole {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return { ...DEFAULT_POSITION, shape, padding };
    }

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      shape,
      padding,
    };
  } catch (error) {
    console.warn('[SpotlightTracker] Error measuring selector:', selector, error);
    return { ...DEFAULT_POSITION, shape, padding };
  }
}

export interface SpotlightTrackerInstance {
  getHoles: () => SpotlightHole[];
  setTargets: (targets: SpotlightTargetInput[]) => void;
  subscribe: (listener: SpotlightTrackerListener) => () => void;
  destroy: () => void;
}

export function createSpotlightTracker(
  initialTargets: SpotlightTargetInput[] = []
): SpotlightTrackerInstance {
  let targets: SpotlightTargetInput[] = initialTargets;
  let holes: SpotlightHole[] = targets.map((t) =>
    measureElement(t.selector, t.padding ?? 8, t.shape ?? 'rect')
  );
  const listeners = new Set<SpotlightTrackerListener>();
  let observer: MutationObserver | null = null;
  let observedElements = new Set<Element>();

  function updateHoles(): void {
    holes = targets.map((t) =>
      measureElement(t.selector, t.padding ?? 8, t.shape ?? 'rect')
    );
    for (const listener of listeners) {
      listener(holes);
    }
  }

  function setupObservers(): void {
    disconnectObservers();
    observedElements = new Set<Element>();
    if (!observer) return;

    for (const t of targets) {
      try {
        const element = document.querySelector(t.selector);
        if (element && !observedElements.has(element)) {
          observer.observe(element, {
            attributes: true,
            childList: true,
            subtree: true,
          });
          observedElements.add(element);
        }
      } catch {
        // invalid selector — skip
      }
    }
  }

  function disconnectObservers(): void {
    if (observer) {
      observer.disconnect();
    }
    observedElements.clear();
  }

  function handleScrollOrResize(): void {
    updateHoles();
  }

  function startListening(): void {
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, {
      capture: true,
      passive: true,
    });
    observer = new MutationObserver(updateHoles);
    setupObservers();
  }

  function stopListening(): void {
    window.removeEventListener('resize', handleScrollOrResize);
    window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    disconnectObservers();
    observer = null;
  }

  // Initialize
  startListening();

  return {
    getHoles: () => holes,

    setTargets(newTargets: SpotlightTargetInput[]) {
      targets = newTargets;
      updateHoles();
      setupObservers();
    },

    subscribe(listener: SpotlightTrackerListener) {
      listeners.add(listener);
      // Immediately notify with current holes
      listener(holes);
      return () => {
        listeners.delete(listener);
      };
    },

    destroy() {
      stopListening();
      listeners.clear();
      holes = [];
    },
  };
}
