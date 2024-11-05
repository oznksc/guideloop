import { tailwindTheme } from './tailwind';
import { materialTheme } from './material';
import { antdTheme } from './antd';
import type { Theme, ThemeConfig } from './types';

export const themes: Record<Theme, ThemeConfig> = {
  tailwind: tailwindTheme,
  material: materialTheme,
  antd: antdTheme,
  custom: tailwindTheme, // fallback to tailwind if custom theme is not provided
};

export type { Theme, ThemeConfig };