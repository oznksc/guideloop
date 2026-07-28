import React, { useState } from 'react';
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

const baseStyle: React.CSSProperties = {
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'background-color 150ms, color 150ms',
};

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
  const [hovered, setHovered] = useState(false);

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

  const isPrimary = variant === 'primary';
  const defaultStyle: React.CSSProperties = isPrimary
    ? { backgroundColor: '#2563eb', color: '#ffffff' }
    : { backgroundColor: 'transparent', color: '#4b5563' };
  const hoverStyle: React.CSSProperties = isPrimary
    ? { backgroundColor: '#1d4ed8' }
    : { backgroundColor: '#f3f4f6', color: '#111827' };

  return (
    <button
      key={kind}
      type="button"
      data-guideloop-action={kind}
      onClick={handler}
      style={{
        ...baseStyle,
        ...defaultStyle,
        ...themeStyles[variant],
        ...(hovered ? hoverStyle : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
    >
      {defaultContent}
    </button>
  );
};
