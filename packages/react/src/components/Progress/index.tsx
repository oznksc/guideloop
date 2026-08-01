'use client';

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import type { ProgressProps } from './types';

export const Progress: React.FC<ProgressProps> = ({
  current,
  total,
  theme,
  style = {},
}) => {
  const themeStyles = useTheme(theme);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor: themeStyles.tooltip.background,
          borderRadius: '9999px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
          padding: '0.5rem 1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {Array.from({ length: total }).map((_, i) => {
            const isActive = i < current;
            return (
              <div
                key={i}
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: isActive
                    ? themeStyles.buttons.primary.background
                    : themeStyles.buttons.secondary.textColor,
                  opacity: isActive ? 1 : 0.3,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
