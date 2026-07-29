'use client';

import React from 'react';
import type { SpotlightProps } from './types';
import { useTheme } from '../../hooks/useTheme';
import { getAnimationStyle } from '../../utils/animation';
import {
  getShapeName,
  isValidHole,
  resolveSpotlightShape,
  type SpotlightHole,
  type ResolvedSpotlightShape,
} from '../../utils/spotlightShape';

function SpotlightSvgRing({
  resolved,
  borderColor,
  borderWidth,
}: {
  resolved: ResolvedSpotlightShape;
  borderColor: string;
  borderWidth: string;
}) {
  const strokeWidth = parseFloat(borderWidth) || 2;
  const common = {
    fill: 'none' as const,
    stroke: borderColor,
    strokeWidth,
  };

  switch (resolved.type) {
    case 'circle':
      return <circle cx={resolved.cx} cy={resolved.cy} r={resolved.r} {...common} />;
    case 'ellipse':
      return (
        <ellipse
          cx={resolved.cx}
          cy={resolved.cy}
          rx={resolved.rx}
          ry={resolved.ry}
          {...common}
        />
      );
    case 'polygon':
      return <polygon points={resolved.points} {...common} />;
    case 'rect':
    default:
      return (
        <rect
          x={resolved.x}
          y={resolved.y}
          width={resolved.width}
          height={resolved.height}
          rx={resolved.rx}
          {...common}
        />
      );
  }
}

function RectSpotlight({
  hole,
  borderColor,
  borderWidth,
  borderRadius,
  animation,
  style,
}: {
  hole: SpotlightHole;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  animation: SpotlightProps['animation'];
  style: React.CSSProperties;
}) {
  const name = getShapeName(hole.shape);
  const isRound = name === 'circle' || name === 'ellipse';
  let top = hole.top;
  let left = hole.left;
  let width = hole.width;
  let height = hole.height;

  if (name === 'circle') {
    const size = Math.max(width, height);
    left = left + width / 2 - size / 2;
    top = top + height / 2 - size / 2;
    width = size;
    height = size;
  }

  return (
    <div
      className="guideloop-spotlight"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: isRound ? '50%' : borderRadius,
        top,
        left,
        width,
        height,
        boxSizing: 'border-box',
        ...getAnimationStyle(animation, 'enter'),
        ...style,
      }}
    />
  );
}

export const Spotlight: React.FC<SpotlightProps> = ({
  position,
  targets,
  shape = 'rect',
  padding = 0,
  theme = 'tailwind',
  customTheme,
  animation,
  style = {},
}) => {
  const themeStyles = useTheme(theme, customTheme);
  const borderColor = themeStyles.spotlight.borderColor;
  const borderWidth = themeStyles.spotlight.borderWidth;
  const borderRadius = themeStyles.spotlight.borderRadius;

  const holes = React.useMemo((): SpotlightHole[] => {
    if (targets && targets.length > 0) {
      // Keep zero-size holes so a missing target still mounts a ring (legacy behavior).
      return targets.map((h) => ({
        ...h,
        shape: h.shape ?? 'rect',
      }));
    }
    if (position) {
      const hole: SpotlightHole = {
        top: position.top - padding,
        left: position.left - padding,
        width: position.width + padding * 2,
        height: position.height + padding * 2,
        shape,
      };
      return isValidHole(hole) || padding > 0 || position.width === 0
        ? [hole]
        : [];
    }
    return [];
  }, [targets, position, padding, shape]);

  if (holes.length === 0) {
    return null;
  }

  const needsSvg =
    holes.some((h) => getShapeName(h.shape) === 'polygon') || holes.length > 1;

  if (needsSvg) {
    const stroke = parseFloat(borderWidth) || 2;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const resolved = holes.map((hole) => {
      const r = resolveSpotlightShape(hole, hole.shape, borderRadius);
      if (r.type === 'rect') {
        minX = Math.min(minX, r.x);
        minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + r.width);
        maxY = Math.max(maxY, r.y + r.height);
      } else if (r.type === 'circle') {
        minX = Math.min(minX, r.cx - r.r);
        minY = Math.min(minY, r.cy - r.r);
        maxX = Math.max(maxX, r.cx + r.r);
        maxY = Math.max(maxY, r.cy + r.r);
      } else if (r.type === 'ellipse') {
        minX = Math.min(minX, r.cx - r.rx);
        minY = Math.min(minY, r.cy - r.ry);
        maxX = Math.max(maxX, r.cx + r.rx);
        maxY = Math.max(maxY, r.cy + r.ry);
      } else {
        r.points.split(' ').forEach((pair) => {
          const [x, y] = pair.split(',').map(Number);
          if (!Number.isNaN(x) && !Number.isNaN(y)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        });
      }
      return r;
    });

    if (!Number.isFinite(minX)) {
      return null;
    }

    const pad = stroke + 2;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
    const svgW = Math.max(maxX - minX, 0);
    const svgH = Math.max(maxY - minY, 0);

    return (
      <svg
        className="guideloop-spotlight"
        width={svgW}
        height={svgH}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          top: minY,
          left: minX,
          overflow: 'visible',
          ...getAnimationStyle(animation, 'enter'),
          ...style,
        }}
      >
        <g transform={`translate(${-minX}, ${-minY})`}>
          {resolved.map((r, i) => (
            <SpotlightSvgRing
              key={i}
              resolved={r}
              borderColor={borderColor}
              borderWidth={borderWidth}
            />
          ))}
        </g>
      </svg>
    );
  }

  const hole = holes[0];
  return (
    <RectSpotlight
      hole={hole}
      borderColor={borderColor}
      borderWidth={borderWidth}
      borderRadius={borderRadius}
      animation={animation}
      style={style}
    />
  );
};
