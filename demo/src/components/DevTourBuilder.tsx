'use client';

/**
 * Development-only Tour Builder overlay.
 *
 * In production, `next.config.mjs` aliases `guideloop/builder` to a no-op
 * shim, and layout skips mounting this component entirely.
 */
import { TourBuilder } from 'guideloop/builder';

export function DevTourBuilder() {
  return <TourBuilder enabled />;
}
