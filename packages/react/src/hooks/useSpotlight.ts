import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  GUIDE_REFRESH_EVENT,
  isBrowser,
  isGuideLoopChrome,
  type SpotlightShape,
  type SpotlightHole,
} from '@guideloop/core';

function mutationsAreAppDom(mutations: MutationRecord[]): boolean {
  return mutations.some((m) => !isGuideLoopChrome(m.target));
}

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
  if (!isBrowser()) {
    return { ...defaultPosition, shape, padding };
  }
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
    if (!selector || !isBrowser()) {
      setPosition(defaultPosition);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener(GUIDE_REFRESH_EVENT, handleScrollOrResize);

    const observer = new MutationObserver((mutations) => {
      if (!mutationsAreAppDom(mutations)) return;
      updatePosition();
    });
    try {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } catch (error) {
      console.warn('[useSpotlight] Error setting up observer:', error);
    }

    let resizeObserver: ResizeObserver | null = null;
    try {
      const element = document.querySelector(selector);
      if (element && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(element);
      }
    } catch {
      // invalid selector — skip ResizeObserver
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener(GUIDE_REFRESH_EVENT, handleScrollOrResize);
      observer.disconnect();
      resizeObserver?.disconnect();
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

  const [holes, setHoles] = useState<SpotlightHole[]>([]);

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
    if (!isBrowser()) {
      setHoles([]);
      return;
    }

    updateHoles();

    const handleScrollOrResize = () => {
      updateHoles();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener(GUIDE_REFRESH_EVENT, handleScrollOrResize);

    const observer = new MutationObserver((mutations) => {
      if (!mutationsAreAppDom(mutations)) return;
      updateHoles();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHoles);
      for (const t of targetsRef.current) {
        try {
          const element = document.querySelector(t.selector);
          if (element) {
            resizeObserver.observe(element);
          }
        } catch {
          // invalid selector — skip
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      window.removeEventListener(GUIDE_REFRESH_EVENT, handleScrollOrResize);
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, [targetsKey, updateHoles]);

  return holes;
};
