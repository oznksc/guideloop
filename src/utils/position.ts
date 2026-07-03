// src/utils/position.ts
import { Step } from '../components/GuideLoop/types';

export interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
  x: number;
  y: number;
}

export interface TooltipPosition {
  top: number;
  left: number;
}

// ElementPosition'u DOMRect'e dönüştüren yardımcı fonksiyon
export const createDOMRect = (position: ElementPosition): DOMRect => {
  return {
    top: position.top,
    left: position.left,
    bottom: position.top + position.height,
    right: position.left + position.width,
    width: position.width,
    height: position.height,
    x: position.left,
    y: position.top,
    toJSON: () => JSON.stringify(position)
  };
};

const SPACING = 12; // px

type BasePlacement = 'top' | 'bottom' | 'left' | 'right';

export const calculateTooltipPosition = (
  targetPosition: ElementPosition,
  placement: Step['placement'] = 'bottom',
  tooltipSize = { width: 300, height: 200 }
): TooltipPosition => {
  const target = createDOMRect(targetPosition);

  const getBasePlacement = (p: string): BasePlacement => {
    if (p.startsWith('top')) return 'top';
    if (p.startsWith('bottom')) return 'bottom';
    if (p.startsWith('left')) return 'left';
    return 'right';
  };

  const base = getBasePlacement(placement ?? 'bottom');

  const positions: Record<BasePlacement, TooltipPosition> = {
    top: {
      top: target.top - tooltipSize.height - SPACING,
      left: target.left + (target.width - tooltipSize.width) / 2,
    },
    bottom: {
      top: target.bottom + SPACING,
      left: target.left + (target.width - tooltipSize.width) / 2,
    },
    left: {
      top: target.top + (target.height - tooltipSize.height) / 2,
      left: target.left - tooltipSize.width - SPACING,
    },
    right: {
      top: target.top + (target.height - tooltipSize.height) / 2,
      left: target.right + SPACING,
    },
  };

  const position = positions[base];

  // Viewport boundaries check and adjustment
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scroll: {
      x: window.scrollX,
      y: window.scrollY,
    },
  };

  // Adjust for viewport boundaries
  if (position.left < SPACING) {
    position.left = SPACING;
  } else if (position.left + tooltipSize.width > viewport.width - SPACING) {
    position.left = viewport.width - tooltipSize.width - SPACING;
  }

  if (position.top < SPACING) {
    position.top = SPACING;
  } else if (position.top + tooltipSize.height > viewport.height - SPACING) {
    position.top = viewport.height - tooltipSize.height - SPACING;
  }

  // Add scroll position
  position.top += viewport.scroll.y;
  position.left += viewport.scroll.x;

  return position;
};