import { CSSProperties } from 'react';
import type { Theme } from '@guideloop/core';

export interface ProgressProps {
  current: number;
  total: number;
  theme: Theme;
  style?: CSSProperties;
}
