import React from 'react';
import { useViewportSize } from '../../hooks/useViewportSize';
import type { MaskedOverlayProps } from './types';

export const MaskedOverlay: React.FC<MaskedOverlayProps> = ({
  targetRect,
  onClick,
  className = '',
  animation,
  style = {},
}) => {
  const maskId = React.useId();
  const viewportSize = useViewportSize();

  const maskRect = React.useMemo(() => {
    if (!targetRect || targetRect.width === 0 || targetRect.height === 0) {
      return { x: 0, y: 0, width: 0, height: 0, rx: 8 };
    }
    return {
      x: targetRect.left,
      y: targetRect.top,
      width: targetRect.width,
      height: targetRect.height,
      rx: 8,
    };
  }, [targetRect]);

  if (!targetRect || targetRect.width === 0 || targetRect.height === 0) {
    return (
      <div
        className={`fixed inset-0 ${className}`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
        pointerEvents: 'auto',
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
              x="0"
              y="0"
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
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Spotlight glow border */}
      <div
        className="fixed pointer-events-none spotlight-glow"
        style={{
          top: maskRect.y,
          left: maskRect.x,
          width: maskRect.width,
          height: maskRect.height,
          borderRadius: maskRect.rx,
          transition: 'all 0.15s ease-out',
          opacity: maskRect.width === 0 ? 0 : 1,
          ...animation,
        }}
      />
    </div>
  );
};