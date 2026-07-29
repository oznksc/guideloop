import { CSSProperties } from 'react';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';
import type { SpotlightHole, SpotlightShape } from '../../utils/spotlightShape';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface MaskedOverlayProps {
  /**
   * Single cutout (legacy). Prefer `targets` for multi-spotlight / shapes.
   * When both are provided, `targets` wins.
   */
  targetRect?: TargetRect | null;
  /**
   * One or more padded spotlight holes (multi-spotlight).
   * Each hole may specify its own `shape`.
   */
  targets?: SpotlightHole[];
  /**
   * Shape applied when only `targetRect` is provided.
   * @default 'rect'
   */
  shape?: SpotlightShape;
  /** @deprecated Padding is expected to already be baked into target geometry. */
  padding?: number;
  onClick?: () => void;
  className?: string;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['overlay'];
  style?: CSSProperties;
}
