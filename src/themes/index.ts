import { tailwindTheme } from './tailwind';
import { materialTheme } from './material';
import { antdTheme } from './antd';
import type { Theme, ThemeConfig } from './types';

export const themes: Record<Exclude<Theme, 'custom'>, ThemeConfig> = {
  tailwind: tailwindTheme,
  material: materialTheme,
  antd: antdTheme,
};

export type { Theme, ThemeConfig };
