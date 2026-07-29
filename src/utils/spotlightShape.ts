/**
 * Spotlight cutout geometry helpers.
 *
 * Shapes are resolved from a padded bounding box into SVG-friendly descriptors
 * used by MaskedOverlay (mask holes) and Spotlight (border rings).
 */

export type SpotlightShapeName = 'rect' | 'circle' | 'ellipse';

/** Polygon points are normalized to the padded bounding box (0–1 range). */
export type SpotlightPolygonShape = {
  type: 'polygon';
  points: Array<[number, number]>;
};

export type SpotlightShape = SpotlightShapeName | SpotlightPolygonShape;

/** Extra element to highlight alongside the step's primary `target`. */
export interface AdditionalSpotlightTarget {
  /** CSS selector for the element to highlight. */
  selector: string;
  /** Cutout shape for this target. Defaults to the step's `spotlightShape` or `'rect'`. */
  shape?: SpotlightShape;
  /** Padding override for this target only. */
  padding?: number;
}

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SpotlightHole extends SpotlightRect {
  shape: SpotlightShape;
}

export type ResolvedSpotlightShape =
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx: number }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'polygon'; points: string };

function parseBorderRadiusPx(borderRadius: string | undefined, fallback = 8): number {
  if (!borderRadius) return fallback;
  const match = /^([\d.]+)px$/.exec(borderRadius.trim());
  if (match) return Number(match[1]);
  // percentage / other units: keep a sensible default for SVG rx
  return fallback;
}

function normalizeShape(shape?: SpotlightShape): SpotlightShape {
  if (!shape) return 'rect';
  if (typeof shape === 'string') return shape;
  if (shape.type === 'polygon' && Array.isArray(shape.points) && shape.points.length >= 3) {
    return shape;
  }
  return 'rect';
}

/**
 * Resolve a padded hole into concrete SVG geometry for masking / stroking.
 */
export function resolveSpotlightShape(
  hole: SpotlightRect,
  shape?: SpotlightShape,
  borderRadius = '8px'
): ResolvedSpotlightShape {
  const { top, left, width, height } = hole;
  const cx = left + width / 2;
  const cy = top + height / 2;
  const resolved = normalizeShape(shape);

  if (resolved === 'circle') {
    const r = Math.max(width, height) / 2;
    return { type: 'circle', cx, cy, r };
  }

  if (resolved === 'ellipse') {
    return {
      type: 'ellipse',
      cx,
      cy,
      rx: Math.max(width / 2, 0),
      ry: Math.max(height / 2, 0),
    };
  }

  if (typeof resolved === 'object' && resolved.type === 'polygon') {
    const points = resolved.points
      .map(([nx, ny]) => {
        const x = left + nx * width;
        const y = top + ny * height;
        return `${x},${y}`;
      })
      .join(' ');
    return { type: 'polygon', points };
  }

  return {
    type: 'rect',
    x: left,
    y: top,
    width,
    height,
    rx: parseBorderRadiusPx(borderRadius),
  };
}

/** True when a hole has a drawable area. */
export function isValidHole(hole: SpotlightRect | null | undefined): hole is SpotlightRect {
  return !!hole && hole.width > 0 && hole.height > 0;
}

export function getShapeName(shape?: SpotlightShape): SpotlightShapeName | 'polygon' {
  if (!shape) return 'rect';
  if (typeof shape === 'string') return shape;
  return 'polygon';
}
