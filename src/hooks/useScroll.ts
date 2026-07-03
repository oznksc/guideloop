import { useEffect, useState, useRef } from 'react';

export const useScroll = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrollPosition({
          x: window.scrollX,
          y: window.scrollY,
        });
        rafRef.current = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return scrollPosition;
};