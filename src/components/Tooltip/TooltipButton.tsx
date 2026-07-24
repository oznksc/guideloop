import React from 'react';
import type { ReactNode } from 'react';

type ActionKind = 'prev' | 'next' | 'close';

interface TooltipButtonProps {
  kind: ActionKind;
  visible: boolean;
  label: string;
  handler: () => void;
  variant: 'secondary' | 'primary';
  defaultContent: ReactNode;
  themeStyles: {
    primary: React.CSSProperties;
    secondary: React.CSSProperties;
  };
  customButton?: ReactNode;
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  kind,
  visible,
  label,
  handler,
  variant,
  defaultContent,
  themeStyles,
  customButton,
}) => {
  if (!visible) return null;

  if (customButton) {
    return (
      <button
        key={kind}
        type="button"
        data-guideloop-action={kind}
        onClick={handler}
        aria-label={label}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        {customButton}
      </button>
    );
  }

  return (
    <button
      key={kind}
      type="button"
      data-guideloop-action={kind}
      onClick={handler}
      className={variant === 'primary' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}
      style={variant === 'primary' ? themeStyles.primary : themeStyles.secondary}
      aria-label={label}
    >
      {defaultContent}
    </button>
  );
};
