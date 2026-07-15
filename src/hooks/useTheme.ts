import { useMemo } from 'react';
import { Theme, ThemeConfig } from '../themes/types';
import { themes } from '../themes';

export const useTheme = (theme: Theme, customTheme?: Partial<ThemeConfig>): ThemeConfig => {
  return useMemo(() => {
    const baseTheme = themes[theme] || themes.tailwind;
    if (!customTheme) return baseTheme;

    const merged: ThemeConfig = JSON.parse(JSON.stringify(baseTheme));
    for (const key of Object.keys(customTheme) as (keyof ThemeConfig)[]) {
      const override = customTheme[key];
      if (override && typeof override === 'object') {
        Object.assign(merged[key], override);
      }
    }
    return merged;
  }, [theme, customTheme]);
};