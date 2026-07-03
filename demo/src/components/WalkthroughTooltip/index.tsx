"use client"
import React from 'react';
import type { BaseTooltipProps, TooltipVariant } from './types';
import { TailwindTooltip } from './TailwindTooltip';
import { CustomTooltip } from './CustomTooltip';
import dynamic from 'next/dynamic';

interface WalkthroughTooltipProps extends BaseTooltipProps {
  variant?: TooltipVariant;
  customProps?: Omit<React.ComponentProps<typeof CustomTooltip>, keyof BaseTooltipProps>;
}

const AntDesignTooltip = dynamic(() => import('./AntDesignTooltip').then(mod => mod.AntDesignTooltip));

export const WalkthroughTooltip: React.FC<WalkthroughTooltipProps> = ({
  variant = 'tailwind',
  customProps,  
  ...props
}) => {
  switch (variant) {
    case 'antDesign':
      return <AntDesignTooltip {...props} />;
    case 'custom':
      return <CustomTooltip {...props} {...customProps} />;
    default:
      return <TailwindTooltip {...props} />;
  }
};

export * from './types';
export { getTooltipPosition } from './utils';