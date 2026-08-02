'use client';

/**
 * Development-only Tour Builder overlay.
 *
 * In production, `next.config.mjs` aliases `@guideloop/react/builder` to a
 * no-op shim, and layout skips mounting this component entirely.
 */
import { TourBuilder } from '@guideloop/react/builder';

export function DevTourBuilder() {
  return <TourBuilder enabled />;
}
