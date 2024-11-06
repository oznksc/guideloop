import React from 'react';
import type { OverlayProps } from './types';
import { getAnimationStyle } from '../../utils/animation';

export const Overlay: React.FC<OverlayProps> = ({
  onClick,
  className = '',
  animation,
  style = {},
}) => (
  <div
    className={`guideloop-overlay ${className}`}
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      pointerEvents: 'auto',
      ...getAnimationStyle(animation, 'enter'),
      ...style,
    }}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    role="presentation"
  />
);