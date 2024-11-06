import { CSSProperties } from 'react';
import { Theme } from '../../themes';

export interface ProgressProps {
  current: number;
  total: number;
  theme: Theme;
  style?: CSSProperties;
}