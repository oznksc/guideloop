import { ThemeConfig } from './types';

export const materialTheme: ThemeConfig = {
  tooltip: {
    background: 'white',
    textColor: 'rgba(0, 0, 0, 0.87)',
    borderRadius: '4px',
    padding: '16px',
    boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2)',
  },
  overlay: {
    background: '#000000',
    opacity: 0.5,
  },
  spotlight: {
    borderColor: '#1976D2',
    borderWidth: '2px',
    borderRadius: '4px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  buttons: {
    primary: {
      background: '#1976D2',
      textColor: 'white',
      hoverBackground: '#1565C0',
      padding: '6px 16px',
    },
    secondary: {
      background: 'transparent',
      textColor: 'rgba(0, 0, 0, 0.87)',
      hoverBackground: 'rgba(0, 0, 0, 0.04)',
      padding: '6px 16px',
    },
  },
};