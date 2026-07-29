import { CSSProperties } from 'react';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';
import type { SpotlightHole, SpotlightShape } from '../../utils/spotlightShape';

export interface SpotlightProps {
  /**
   * Single target position (legacy). Padding is applied on top of this rect.
   * Prefer `targets` for multi-spotlight / pre-padded holes.
   */
  position?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /**
   * One or more pre-padded holes. When provided, `position` / `padding` are ignored.
   */
  targets?: SpotlightHole[];
  /**
   * Shape for the legacy single-`position` path.
   * @default 'rect'
   */
  shape?: SpotlightShape;
  /**
   * Extra padding applied only when using `position` (legacy).
   * Not applied when `targets` is provided (padding should already be baked in).
   */
  padding?: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['spotlight'];
  style?: CSSProperties;
}
