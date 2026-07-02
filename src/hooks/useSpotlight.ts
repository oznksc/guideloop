import { useEffect, useState, useCallback } from 'react';
import { getElementPosition } from '../utils/dom';
import { useScroll } from './useScroll';

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
  const scrollPosition = useScroll();

  const updatePosition = useCallback(() => {
    // Return early with default position if selector is empty, null, or undefined
    if (!selector) {
      setPosition(defaultPosition);
      return;
    }

    try {
      const element = document.querySelector(selector);
      
      if (!element) {
        console.warn(`[useSpotlight] Element not found with selector: ${selector}`);
        setPosition(defaultPosition);
        return;
      }

      const pos = getElementPosition(element);
      setPosition({
        top: pos.top - padding + scrollPosition.y,
        left: pos.left - padding + scrollPosition.x,
        width: pos.width + (padding * 2),
        height: pos.height + (padding * 2),
      });
    } catch (error) {
      console.error('[useSpotlight] Error updating position:', error);
      setPosition(defaultPosition);
    }
  }, [selector, padding, scrollPosition.x, scrollPosition.y]);

  useEffect(() => {
    // Skip effect if selector is empty
    if (!selector) {
      setPosition(defaultPosition);
      return;
    }

    // Initial position update
    updatePosition();

    // Add resize listener
    window.addEventListener('resize', updatePosition);
    
    // Setup mutation observer
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [selector, updatePosition]);

  return position;
};