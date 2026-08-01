import type { SpotlightTarget, SpotlightHole } from '../types/step';
import { querySelectorAsHTMLElement } from './query';
import { applyPadding } from '../geometry/padding';

export function calculateSpotlightHoles(
  targets: SpotlightTarget[]
): SpotlightHole[] {
  return targets.map(target => {
    const element = querySelectorAsHTMLElement(target.selector);
    if (!element) {
      return {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        shape: target.shape || 'rect',
        padding: target.padding || 0,
      };
    }

    const rect = element.getBoundingClientRect();
    const paddedRect = applyPadding(rect, target.padding || 0);

    return {
      top: paddedRect.top,
      left: paddedRect.left,
      width: paddedRect.width,
      height: paddedRect.height,
      shape: target.shape || 'rect',
      padding: target.padding || 0,
    };
  });
}
