import { AnimationConfig } from '../../utils/animation';
import { CSSProperties } from 'react';

export interface OverlayProps {
  onClick?: () => void;
  className?: string;
  animation?: AnimationConfig['overlay'];
  style?: CSSProperties;
}