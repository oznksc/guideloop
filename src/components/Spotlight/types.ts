import { AnimationConfig } from '../../utils/animation';

export interface SpotlightProps {
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  padding: number;
  animation?: AnimationConfig;
}