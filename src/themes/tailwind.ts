import { ThemeConfig } from './types';

export const tailwindTheme: ThemeConfig = {
  tooltip: {
    background: 'white',
    textColor: '#1F2937',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    background: '#000000',
    opacity: 0.5,
  },
  spotlight: {
    borderColor: '#2563EB',
    borderWidth: '2px',
    borderRadius: '0.375rem',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  buttons: {
    primary: {
      background: '#2563EB',
      textColor: 'white',
      hoverBackground: '#1D4ED8',
      padding: '0.5rem 1rem',
    },
    secondary: {
      background: 'transparent',
      textColor: '#4B5563',
      hoverBackground: '#F3F4F6',
      padding: '0.5rem 1rem',
    },
  },
};