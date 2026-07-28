import React from 'react';
import type { SpotlightProps } from './types';
import { useTheme } from '../../hooks/useTheme';
import { getAnimationStyle } from '../../utils/animation';

export const Spotlight: React.FC<SpotlightProps> = ({
  position,
  padding,
  theme = 'tailwind',
  customTheme,
  animation,
  style = {},
}) => {
  const themeStyles = useTheme(theme, customTheme);

  return (
    <div
      className="guideloop-spotlight"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        border: `${themeStyles.spotlight.borderWidth} solid ${themeStyles.spotlight.borderColor}`,
        borderRadius: themeStyles.spotlight.borderRadius,
        top: position.top - padding,
        left: position.left - padding,
        width: position.width + padding * 2,
        height: position.height + padding * 2,
        ...getAnimationStyle(animation, 'enter'),
        ...style
      }}
    />
  );
};
