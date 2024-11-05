import React from 'react';
import type { OverlayProps } from './types';

export const Overlay: React.FC<OverlayProps> = ({
  onClick,
  className = '',
}) => (
  <div
    className={`fixed inset-0 bg-black/50 pointer-events-auto ${className}`}
    onClick={onClick}
    role="presentation"
  />
);