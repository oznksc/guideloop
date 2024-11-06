import React from 'react';
import type { OverlayProps } from './types';
import { getAnimationStyle } from '../../utils/animation';

export const Overlay: React.FC<OverlayProps> = ({
  onClick,
  className = '',
  animation
}) => (
  <div
    className={`fixed inset-0 bg-black/50 pointer-events-auto ${className}`}
    style={getAnimationStyle(animation, 'enter')}
    onClick={onClick}
    role="presentation"
  />
);