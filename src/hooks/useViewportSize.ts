import { useState, useEffect, useRef } from 'react';
import { isBrowser } from '../utils/env';

interface ViewportSize {
  width: number;
  height: number;
}

function readViewport(): ViewportSize {
  if (!isBrowser()) {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Tracks viewport size. SSR-safe: returns 0×0 until hydrated, then live values.
 */
export const useViewportSize = (): ViewportSize => {
  const [size, setSize] = useState<ViewportSize>(readViewport);
  const rafRef = useRef(0);

  useEffect(() => {
    // Sync after hydration (SSR init may have been 0×0)
    setSize(readViewport());

    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setSize(readViewport());
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return size;
};
