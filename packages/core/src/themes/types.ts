export type Theme = 'tailwind' | 'material' | 'antd' | 'custom';

export interface ThemeConfig {
  tooltip: {
    background: string;
    textColor: string;
    borderRadius: string;
    padding: string;
    boxShadow: string;
  };
  overlay: {
    background: string;
    opacity: number;
  };
  spotlight: {
    borderColor: string;
    borderWidth: string;
    borderRadius: string;
    animation: string;
  };
  buttons: {
    primary: {
      background: string;
      textColor: string;
      hoverBackground: string;
      padding: string;
    };
    secondary: {
      background: string;
      textColor: string;
      hoverBackground: string;
      padding: string;
    };
  };
}