import { CSSProperties } from 'react';
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
  animation?: AnimationConfig['overlay'];
  style?: CSSProperties;
}