import type { SpotlightHole } from './spotlightShape';
import type { AdditionalSpotlightTarget, SpotlightShape } from './spotlightShape';
import type { TargetDebugInfo } from '../components/DebugHUD/types';
import { getShapeName } from './spotlightShape';

function shapeLabel(shape?: SpotlightShape): string {
  return getShapeName(shape);
}

function elementExists(selector: string): boolean {
  try {
    return !!document.querySelector(selector);
  } catch {
    return false;
  }
}

/**
 * Build target debug rows from primary selector + additionalTargets + measured holes.
 */
export function buildTargetDebugInfo(options: {
  primarySelector: string;
  primaryShape?: SpotlightShape;
  additionalTargets?: Array<string | AdditionalSpotlightTarget>;
  holes: SpotlightHole[];
}): TargetDebugInfo[] {
  const { primarySelector, primaryShape, additionalTargets = [], holes } = options;
  const rows: TargetDebugInfo[] = [];

  const primaryHole = holes[0];
  rows.push({
    selector: primarySelector || '(none)',
    found: primarySelector ? elementExists(primarySelector) : false,
    role: 'primary',
    shape: shapeLabel(primaryShape ?? primaryHole?.shape),
    rect: primaryHole
      ? {
          top: primaryHole.top,
          left: primaryHole.left,
          width: primaryHole.width,
          height: primaryHole.height,
        }
      : undefined,
  });

  additionalTargets.forEach((entry, index) => {
    const selector = typeof entry === 'string' ? entry : entry.selector;
    const shape =
      typeof entry === 'string' ? primaryShape : entry.shape ?? primaryShape;
    const hole = holes[index + 1];
    rows.push({
      selector,
      found: elementExists(selector),
      role: 'additional',
      shape: shapeLabel(shape ?? hole?.shape),
      rect: hole
        ? {
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }
        : undefined,
    });
  });

  return rows;
}
