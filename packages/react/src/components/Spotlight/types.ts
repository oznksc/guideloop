import { CSSProperties } from 'react';
import type { Theme, ThemeConfig, AnimationConfig, SpotlightHole, SpotlightShape } from '@guideloop/core';

export interface SpotlightProps {
  position?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  targets?: SpotlightHole[];
  shape?: SpotlightShape;
  padding?: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['spotlight'];
  style?: CSSProperties;
}
