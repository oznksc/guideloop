// src/utils/animation.ts
export interface AnimationSettings {
    enter?: string;
    exit?: string;
    duration?: number;
    timing?: string;
  }
  
  export interface AnimationConfig {
    tooltip?: AnimationSettings;
    spotlight?: AnimationSettings;
    overlay?: AnimationSettings;
  }
  
  export const defaultAnimations: AnimationConfig = {
    tooltip: {
      enter: 'fade-in 0.3s ease-out',
      exit: 'fade-out 0.2s ease-in',
      duration: 300,
      timing: 'ease'
    },
    spotlight: {
      enter: 'scale-in 0.3s ease-out',
      exit: 'scale-out 0.2s ease-in',
      duration: 300,
      timing: 'ease'
    },
    overlay: {
      enter: 'fade-in 0.3s ease-out',
      exit: 'fade-out 0.2s ease-in',
      duration: 300,
      timing: 'ease'
    }
  };
  
  export const createAnimation = (
    settings: AnimationSettings | undefined,
    state: 'enter' | 'exit'
  ): string => {
    if (!settings || !settings[state]) {
      return '';
    }
  
    return `
      animation: ${settings[state]};
      animation-duration: ${settings.duration || '300ms'};
      animation-timing-function: ${settings.timing || 'ease'};
    `;
  };
  
  // Component'lerde kullanılacak yardımcı fonksiyon
  export const getAnimationStyle = (
    settings: AnimationSettings | undefined,
    state: 'enter' | 'exit'
  ): React.CSSProperties => {
    if (!settings || !settings[state]) {
      return {};
    }
  
    return {
      animation: settings[state],
      animationDuration: `${settings.duration || 300}ms`,
      animationTimingFunction: settings.timing || 'ease'
    };
  };
  
  export const keyframes = `
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  
    @keyframes fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  
    @keyframes scale-in {
      from { 
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  
    @keyframes scale-out {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.95);
        opacity: 0;
      }
    }
  `;
  
  export const injectKeyframes = (): void => {
    if (typeof document === 'undefined') return;
  
    const styleId = 'guideloop-animations';
    if (document.getElementById(styleId)) return;
  
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = keyframes;
    document.head.appendChild(style);
  };