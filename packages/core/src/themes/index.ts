import { tailwindTheme } from './tailwind';
import { materialTheme } from './material';
import { antdTheme } from './antd';
import type { Theme, ThemeConfig } from './types';

export const themes: Record<Exclude<Theme, 'custom'>, ThemeConfig> = {
  tailwind: tailwindTheme,
  material: materialTheme,
  antd: antdTheme,
};

export function getTheme(
  theme: Theme,
  customTheme?: Partial<ThemeConfig>
): ThemeConfig {
  const baseKey = theme === 'custom' ? 'tailwind' : theme;
  const baseTheme = themes[baseKey] || themes.tailwind;
  if (!customTheme) return baseTheme;
  return mergeTheme(baseTheme, customTheme);
}

export function mergeTheme(
  base: ThemeConfig,
  override: Partial<ThemeConfig>
): ThemeConfig {
  const merged = structuredClone(base);
  for (const key of Object.keys(override) as (keyof ThemeConfig)[]) {
    const value = override[key];
    if (value && typeof value === 'object') {
      Object.assign(merged[key], value);
    }
  }
  return merged;
}

export type { Theme, ThemeConfig };
