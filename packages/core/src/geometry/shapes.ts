export {
  resolveSpotlightShape,
  isValidHole,
  getShapeName,
} from './spotlightShape';

export type {
  SpotlightShapeName,
  SpotlightPolygonShape,
  SpotlightShape,
  AdditionalSpotlightTarget,
  SpotlightRect,
  SpotlightHole,
  ResolvedSpotlightShape,
} from './spotlightShape';

export function calculatePolygonPoints(
  points: Array<[number, number]>,
  width: number,
  height: number
): string {
  return points
    .map(([x, y]) => `${x * width},${y * height}`)
    .join(' ');
}
