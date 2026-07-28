import { CSSProperties } from 'react';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface MaskedOverlayProps {
  targetRect: TargetRect | null;
  padding?: number;
  onClick?: () => void;
  className?: string;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['overlay'];
  style?: CSSProperties;
}
