import { CSSProperties } from 'react';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';

export interface SpotlightProps {
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  padding: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['spotlight'];
  style?: CSSProperties;
}
