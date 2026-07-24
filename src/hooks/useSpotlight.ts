import { useEffect, useState, useCallback } from 'react';

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const defaultPosition: SpotlightPosition = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

export const useSpotlight = (selector?: string | null, padding = 8) => {
  const [position, setPosition] = useState<SpotlightPosition>(defaultPosition);

  const updatePosition = useCallback(() => {
    if (!selector) {
      setPosition(defaultPosition);
      return;
    }

    try {
      const element = document.querySelector(selector);

      if (!element) {
        setPosition(defaultPosition);
        return;
      }

      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } catch (error) {
      console.error('[useSpotlight] Error updating position:', error);
      setPosition(defaultPosition);
    }
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
      console.error('[useSpotlight] Error setting up observer:', error);
    }

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
      observer.disconnect();
    };
  }, [selector, updatePosition]);

  return position;
};