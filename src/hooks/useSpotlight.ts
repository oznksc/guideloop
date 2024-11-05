import { useEffect, useState, useCallback } from 'react';
import { getElementPosition } from '../utils/dom';
import { useScroll } from './useScroll';

export const useSpotlight = (selector: string, padding: number = 8) => {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const scrollPosition = useScroll();

  const updatePosition = useCallback(() => {
    const element = document.querySelector(selector);
    if (element) {
      const pos = getElementPosition(element);
      setPosition({
        top: pos.top - padding + scrollPosition.y,
        left: pos.left - padding + scrollPosition.x,
        width: pos.width + (padding * 2),
        height: pos.height + (padding * 2),
      });
    }
  }, [selector, padding, scrollPosition]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    const observer = new MutationObserver(updatePosition);
    const element = document.querySelector(selector);
    
    if (element) {
      observer.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [selector, updatePosition]);

  return position;
};
