import { ThemeConfig } from './types';

export const antdTheme: ThemeConfig = {
  tooltip: {
    background: 'white',
    textColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: '2px',
    padding: '24px',
    boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12)',
  },
  overlay: {
    background: '#000000',
    opacity: 0.45,
  },
  spotlight: {
    borderColor: '#1890ff',
    borderWidth: '2px',
    borderRadius: '2px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  buttons: {
    primary: {
      background: '#1890ff',
      textColor: 'white',
      hoverBackground: '#40a9ff',
      padding: '4px 15px',
    },
    secondary: {
      background: 'white',
      textColor: 'rgba(0, 0, 0, 0.85)',
      hoverBackground: '#fafafa',
      padding: '4px 15px',
    },
  },
};