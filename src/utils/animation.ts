// src/utils/animation.ts
export interface AnimationConfig {
    enter?: string;
    exit?: string;
    duration?: number;
    timing?: string;
  }
  
  export const defaultAnimations: Record<string, AnimationConfig> = {
    tooltip: {
      enter: 'fade-in 0.3s ease-out',
      exit: 'fade-out 0.2s ease-in',
    },
    spotlight: {
      enter: 'scale-in 0.3s ease-out',
      exit: 'scale-out 0.2s ease-in',
    },
    overlay: {
      enter: 'fade-in 0.3s ease-out',
      exit: 'fade-out 0.2s ease-in',
    },
  };
  
  export const keyframes = `
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  
    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
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
  
    @keyframes slide-in-top {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  
    @keyframes slide-out-top {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-20px);
        opacity: 0;
      }
    }
  
    @keyframes slide-in-bottom {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  
    @keyframes slide-out-bottom {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(20px);
        opacity: 0;
      }
    }
  
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  
    @keyframes spotlight-pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
      }
    }
  `;
  
  export const createAnimation = (
    type: string,
    config?: Partial<AnimationConfig>
  ): string => {
    const defaultConfig = defaultAnimations[type];
    const finalConfig = {
      ...defaultConfig,
      ...config,
    };
  
    if (!finalConfig.enter && !finalConfig.exit) {
      return '';
    }
  
    return `
      ${finalConfig.enter ? `animation-enter: ${finalConfig.enter};` : ''}
      ${finalConfig.exit ? `animation-exit: ${finalConfig.exit};` : ''}
      animation-duration: ${finalConfig.duration || '300ms'};
      animation-timing-function: ${finalConfig.timing || 'ease'};
    `;
  };
  
  export const injectKeyframes = (): void => {
    if (typeof document === 'undefined') return;
  
    const styleId = 'guideloop-animations';
    if (document.getElementById(styleId)) return;
  
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = keyframes;
    document.head.appendChild(style);
  };
  
  export const removeKeyframes = (): void => {
    if (typeof document === 'undefined') return;
  
    const style = document.getElementById('guideloop-animations');
    if (style) {
      document.head.removeChild(style);
    }
  };
  
  export const getAnimationClass = (
    type: string,
    state: 'enter' | 'exit',
    config?: Partial<AnimationConfig>
  ): string => {
    const defaultConfig = defaultAnimations[type];
    const finalConfig = {
      ...defaultConfig,
      ...config,
    };
  
    return finalConfig[state] || '';
  };