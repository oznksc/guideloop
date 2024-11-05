export interface Theme {
    primary: string;
    background: string;
    text: string;
    overlay: string;
    highlight: string;
  }
  
  export interface Step {
    element: string;
    title: string;
    description: string;
    position?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    icon?: React.ReactNode;
    nextAction?: () => void;
    prevAction?: () => void;
    showButtons?: {
      next?: boolean;
      previous?: boolean;
      close?: boolean;
    };
    scrollOptions?: {
      behavior?: ScrollBehavior;
      block?: ScrollIntoViewOptions['block'];
      offset?: number;
    };
  }
  
  export interface GuideLoopProps {
    steps: Step[];
    isOpen: boolean;
    onClose?: () => void;
    onComplete?: () => void;
    theme?: Partial<Theme>;
    className?: string;
    showProgress?: boolean;
    enableKeyboardNavigation?: boolean;
    labels?: {
      next?: string;
      prev?: string;
      done?: string;
      close?: string;
    };
  }
  