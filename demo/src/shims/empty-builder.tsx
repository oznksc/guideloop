/**
 * Production stub for `@guideloop/react/builder`.
 *
 * next.config aliases the real package entry to this module during
 * production builds so the Tour Builder UI is never shipped.
 */
import type { FC } from 'react';

export const TourBuilder: FC<Record<string, unknown>> = () => null;

export default TourBuilder;
