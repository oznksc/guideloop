import React from 'react';
import type { SpotlightProps } from './types';
import { getAnimationStyle } from '../../utils/animation';

export const Spotlight: React.FC<SpotlightProps> = ({
  position,
  padding,
  animation,
  style = {},
}) => (
  <div
    className="absolute border-2 border-blue-500 rounded-md pointer-events-none"
    style={{
      top: position.top - padding,
      left: position.left - padding,
      width: position.width + (padding * 2),
      height: position.height + (padding * 2),
      ...getAnimationStyle(animation, 'enter'),
      ...style
    }}
  />
);