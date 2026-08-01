import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { SpotlightShape, SpotlightHole } from '@guideloop/core';

export interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SpotlightTargetInput {
  selector: string;
  padding?: number;
  shape?: SpotlightShape;
}

const defaultPosition: SpotlightPosition = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

function measureElement(
  selector: string,
  padding: number,
  shape: SpotlightShape = 'rect'
): SpotlightHole {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return { ...defaultPosition, shape, padding };
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
    console.warn('[useSpotlight] Error measuring selector:', selector, error);
    return { ...defaultPosition, shape, padding };
  }
}

/**
 * Track a single target element's padded viewport rect.
 * Backwards-compatible single-position API.
 */
export const useSpotlight = (selector?: string | null, padding = 8): SpotlightPosition => {
  const [position, setPosition] = useState<SpotlightPosition>(defaultPosition);

  const updatePosition = useCallback(() => {
    if (!selector) {
      setPosition(defaultPosition);
      return;
    }
    const hole = measureElement(selector, padding, 'rect');
    setPosition({
      top: hole.top,
      left: hole.left,
      width: hole.width,
      height: hole.height,
    });
  }, [selector, padding]);

  useEffect(() => {
    if (!selector) {
      setPosition(defaultPosition);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });

    const observer = new MutationObserver(updatePosition);

    try {
      const element = document.querySelector(selector);
      if (element) {
        observer.observe(element, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    } catch (error) {
      console.warn('[useSpotlight] Error setting up observer:', error);
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      observer.disconnect();
    };
  }, [selector, updatePosition]);

  return position;
};

/**
 * Track one or more spotlight targets (multi-spotlight + per-target shapes).
 * Returns padded holes ready for MaskedOverlay / Spotlight.
 */
export const useSpotlights = (targets: SpotlightTargetInput[]): SpotlightHole[] => {
  const targetsKey = useMemo(
    () =>
      targets
        .map((t) => `${t.selector}|${t.padding ?? ''}|${JSON.stringify(t.shape ?? 'rect')}`)
        .join(';;'),
    [targets]
  );

  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  const [holes, setHoles] = useState<SpotlightHole[]>(() =>
    targets.map((t) => measureElement(t.selector, t.padding ?? 8, t.shape ?? 'rect'))
  );

  const updateHoles = useCallback(() => {
    const list = targetsRef.current;
    if (list.length === 0) {
      setHoles([]);
      return;
    }
    setHoles(
      list.map((t) => measureElement(t.selector, t.padding ?? 8, t.shape ?? 'rect'))
    );
  }, []);

  useEffect(() => {
    updateHoles();

    const handleScrollOrResize = () => {
      updateHoles();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });

    const observer = new MutationObserver(updateHoles);
    const observed = new Set<Element>();

    for (const t of targetsRef.current) {
      try {
        const element = document.querySelector(t.selector);
        if (element && !observed.has(element)) {
          observer.observe(element, {
            attributes: true,
            childList: true,
            subtree: true,
          });
          observed.add(element);
        }
      } catch {
        // invalid selector — skip observer
      }
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      observer.disconnect();
    };
  }, [targetsKey, updateHoles]);

  return holes;
};
