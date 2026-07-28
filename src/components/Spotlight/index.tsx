import React from 'react';
import type { SpotlightProps } from './types';
import { getAnimationStyle } from '../../utils/animation';

export const Spotlight: React.FC<SpotlightProps> = ({
  position,
  animation,
  style = {},
}) => (
  <div
    className="guideloop-spotlight"
    style={{
      position: 'fixed',
      pointerEvents: 'none',
      border: '2px solid #3b82f6',
      borderRadius: '0.375rem',
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
      ...getAnimationStyle(animation, 'enter'),
      ...style
    }}
  />
);