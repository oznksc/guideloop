import React from 'react';
import { useViewportSize } from '../../hooks/useViewportSize';
import { useTheme } from '../../hooks/useTheme';
import { getAnimationStyle } from '../../utils/animation';
import type { MaskedOverlayProps } from './types';

export const MaskedOverlay: React.FC<MaskedOverlayProps> = ({
  targetRect,
  onClick,
  className = '',
  theme = 'tailwind',
  customTheme,
  animation,
  style = {},
}) => {
  const maskId = React.useId();
  const viewportSize = useViewportSize();
  const themeStyles = useTheme(theme, customTheme);

  const overlayColor = themeStyles.overlay.background;
  const overlayOpacity = themeStyles.overlay.opacity;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity);

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
        className={className}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayRgba,
          width: '100vw',
          height: '100vh',
          ...getAnimationStyle(animation, 'enter'),
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
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'auto',
        ...getAnimationStyle(animation, 'enter'),
        ...style,
      }}
      onClick={onClick}
      role="presentation"
    >
      <svg
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
          fill={overlayRgba}
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Spotlight glow border */}
      <div
        className="spotlight-glow"
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          top: maskRect.y,
          left: maskRect.x,
          width: maskRect.width,
          height: maskRect.height,
          borderRadius: maskRect.rx,
          transition: 'all 0.15s ease-out',
          opacity: maskRect.width === 0 ? 0 : 1,
          ...getAnimationStyle(animation, 'enter'),
        }}
      />
    </div>
  );
};

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
