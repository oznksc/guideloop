import { useMemo } from 'react';
import { getTheme, type Theme, type ThemeConfig } from '@guideloop/core';

export const useTheme = (theme: Theme, customTheme?: Partial<ThemeConfig>): ThemeConfig => {
  return useMemo(() => {
    return getTheme(theme, customTheme);
  }, [theme, customTheme]);
};
