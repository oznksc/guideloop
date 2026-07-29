'use client';

/**
 * Development-only Tour Builder overlay.
 * Imports from guideloop/builder so production bundles can tree-shake it
 * if this file is never used in production builds.
 */
import { TourBuilder } from 'guideloop/builder';

export function DevTourBuilder() {
  // Force-enabled in the demo so the FAB is always available while developing
  // the landing page. In consumer apps, omit `enabled` to auto-hide in production.
  return <TourBuilder enabled={process.env.NODE_ENV === 'development'} />;
}
