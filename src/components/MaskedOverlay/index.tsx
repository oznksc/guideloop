'use client';

import React from 'react';
import { useViewportSize } from '../../hooks/useViewportSize';
import { useTheme } from '../../hooks/useTheme';
import { getAnimationStyle } from '../../utils/animation';
import {
  isValidHole,
  resolveSpotlightShape,
  type SpotlightHole,
  type ResolvedSpotlightShape,
} from '../../utils/spotlightShape';
import type { MaskedOverlayProps } from './types';

function MaskCutout({ shape }: { shape: ResolvedSpotlightShape }) {
  switch (shape.type) {
    case 'circle':
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill="black" />;
    case 'ellipse':
      return (
        <ellipse
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill="black"
        />
      );
    case 'polygon':
      return <polygon points={shape.points} fill="black" />;
    case 'rect':
    default:
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx}
          fill="black"
        />
      );
  }
}

export const MaskedOverlay: React.FC<MaskedOverlayProps> = ({
  targetRect,
  targets,
  shape = 'rect',
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
  const borderRadius = themeStyles.spotlight.borderRadius;

  const holes = React.useMemo((): SpotlightHole[] => {
    if (targets && targets.length > 0) {
      return targets.filter(isValidHole).map((h) => ({
        ...h,
        shape: h.shape ?? 'rect',
      }));
    }
    if (targetRect && isValidHole(targetRect)) {
      return [{ ...targetRect, shape }];
    }
    return [];
  }, [targets, targetRect, shape]);

  const resolvedShapes = React.useMemo(
    () => holes.map((hole) => resolveSpotlightShape(hole, hole.shape, borderRadius)),
    [holes, borderRadius]
  );

  if (holes.length === 0) {
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
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {resolvedShapes.map((resolved, index) => (
              <MaskCutout key={index} shape={resolved} />
            ))}
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
