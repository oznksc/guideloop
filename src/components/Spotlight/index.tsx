import React from 'react';
import type { SpotlightProps } from './types';
import { getAnimationStyle } from '../../utils/animation';

export const Spotlight: React.FC<SpotlightProps> = ({
  position,
  animation,
  style = {},
}) => (
  <div
    className="fixed border-2 border-blue-500 rounded-md pointer-events-none"
    style={{
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
      ...getAnimationStyle(animation, 'enter'),
      ...style
    }}
  />
);