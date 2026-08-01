import { CSSProperties } from 'react';
import type { Theme, ThemeConfig, AnimationConfig, SpotlightHole, SpotlightShape } from '@guideloop/core';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface MaskedOverlayProps {
  targetRect?: TargetRect | null;
  targets?: SpotlightHole[];
  shape?: SpotlightShape;
  padding?: number;
  onClick?: () => void;
  className?: string;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['overlay'];
  style?: CSSProperties;
}
