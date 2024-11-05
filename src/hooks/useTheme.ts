import { useMemo } from 'react';
import { Theme, ThemeConfig } from '../themes/types';
import { themes } from '../themes';

export const useTheme = (theme: Theme, customTheme?: Partial<ThemeConfig>) => {
  return useMemo(() => {
    const baseTheme = themes[theme] || themes.tailwind;
    return {
      ...baseTheme,
      ...customTheme,
    };
  }, [theme, customTheme]);
};