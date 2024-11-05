import { Step } from '../components/GuideLoop/types';

interface Position {
  top: number;
  left: number;
}

const SPACING = 12; // px

export const calculateTooltipPosition = (
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  placement: Step['placement'] = 'bottom'
): Position => {
  const positions: Record<NonNullable<Step['placement']>, Position> = {
    top: {
      top: targetRect.top - tooltipRect.height - SPACING,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    },
    bottom: {
      top: targetRect.bottom + SPACING,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
    },
    left: {
      top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
      left: targetRect.left - tooltipRect.width - SPACING,
    },
    right: {
      top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
      left: targetRect.right + SPACING,
    },
  };

  const position = positions[placement];

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
  } else if (position.left + tooltipRect.width > viewport.width - SPACING) {
    position.left = viewport.width - tooltipRect.width - SPACING;
  }

  if (position.top < SPACING) {
    position.top = SPACING;
  } else if (position.top + tooltipRect.height > viewport.height - SPACING) {
    position.top = viewport.height - tooltipRect.height - SPACING;
  }

  // Add scroll position
  position.top += viewport.scroll.y;
  position.left += viewport.scroll.x;

  return position;
};