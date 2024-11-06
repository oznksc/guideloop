import React from 'react';
import type { MaskedOverlayProps } from './types';

export const MaskedOverlay: React.FC<MaskedOverlayProps> = ({
    targetRect,
    padding = 8,
    onClick,
    className = '',
    animation,
    style = {},
  }) => {
    const maskId = React.useId();
  
    // Viewport boyutlarını al
    const [viewportSize, setViewportSize] = React.useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  
    // Viewport boyutlarını güncelle
    React.useEffect(() => {
      const updateSize = () => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
  
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, []);
  
    // Mask koordinatlarını hesapla
    const maskRect = React.useMemo(() => {
      if (!targetRect) {
        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          rx: 8,
        };
      }
  
      return {
        x: targetRect.left - padding,
        y: targetRect.top - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
        rx: 8,
      };
    }, [targetRect, padding]);
  
    // Scroll pozisyonunu al
    const [scrollPosition, setScrollPosition] = React.useState({
      x: window.scrollX,
      y: window.scrollY
    });
  
    // Scroll pozisyonunu güncelle
    React.useEffect(() => {
      const updateScroll = () => {
        setScrollPosition({
          x: window.scrollX,
          y: window.scrollY
        });
      };
  
      window.addEventListener('scroll', updateScroll);
      return () => window.removeEventListener('scroll', updateScroll);
    }, []);
  
    // Hedef element yoksa sadece overlay göster
    if (!targetRect) {
      return (
        <div
          className={`fixed inset-0 ${className}`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            width: '100vw',
            height: '100vh',
            ...style,
            pointerEvents: 'auto',
          }}
          onClick={onClick}
          role="presentation"
        />
      );
    }
  
    return (
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          ...style,
        }}
        onClick={onClick}
        role="presentation"
      >
        <svg
          className="fixed inset-0"
          width={viewportSize.width}
          height={viewportSize.height}
          style={{ 
            pointerEvents: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
          }}
        >
          <defs>
            <mask id={maskId}>
              <rect 
                x={-scrollPosition.x} 
                y={-scrollPosition.y} 
                width="100%" 
                height="100%" 
                fill="white"
              />
              <rect
                x={maskRect.x}
                y={maskRect.y}
                width={maskRect.width}
                height={maskRect.height}
                rx={maskRect.rx}
                fill="black"
              />
            </mask>
          </defs>
  
          <rect
            x={-scrollPosition.x}
            y={-scrollPosition.y}
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.15)"
            mask={`url(#${maskId})`}
          />
        </svg>
  
        {/* Spotlight efekti */}
        <div
          className="absolute border-2 border-blue-500 rounded-lg pointer-events-none spotlight-glow"
          style={{
            top: maskRect.y,
            left: maskRect.x,
            width: maskRect.width,
            height: maskRect.height,
            transition: 'all 0.3s ease-in-out',
            opacity: maskRect.width === 0 ? 0 : 1,
            ...animation,
          }}
        />
  
        {/* Ekstra overflow overlay */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.35)',
            mask: `url(#${maskId})`,
            WebkitMask: `url(#${maskId})`,
          }}
        />
      </div>
    );
  };