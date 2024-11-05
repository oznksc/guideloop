// utils.ts
import type { Step } from '../Walkthrough';

const TOOLTIP_WIDTH = 300;  // Tooltip genişliği
const TOOLTIP_HEIGHT = 120; // Tooltip yüksekliği
const SPACING = 8;         // Hedef element ile tooltip arasındaki boşluk

export const getTooltipPosition = (targetRect: DOMRect | undefined, placement: Step['placement'] = 'bottom') => {
  if (!targetRect) return {};
  
  // Viewport boyutlarını al
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // İlk pozisyonu hesapla
  let position: { top: number; left: number } = { top: 0, left: 0 };

  switch (placement) {
    case 'top':
      position = {
        top: targetRect.top - SPACING - TOOLTIP_HEIGHT,
        left: targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2),
      };
      break;
    case 'bottom':
      position = {
        top: targetRect.bottom + SPACING,
        left: targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2),
      };
      break;
    case 'left':
      position = {
        top: targetRect.top + (targetRect.height / 2) - (TOOLTIP_HEIGHT / 2),
        left: targetRect.left - SPACING - TOOLTIP_WIDTH,
      };
      break;
    case 'right':
      position = {
        top: targetRect.top + (targetRect.height / 2) - (TOOLTIP_HEIGHT / 2),
        left: targetRect.right + SPACING,
      };
      break;
  }

  // Ekran sınırlarına göre pozisyonu ayarla
  return {
    top: Math.min(
      Math.max(SPACING, position.top), // En az üst kenardan SPACING kadar uzakta
      viewportHeight - TOOLTIP_HEIGHT - SPACING // En fazla alt kenardan SPACING kadar uzakta
    ),
    left: Math.min(
      Math.max(SPACING, position.left), // En az sol kenardan SPACING kadar uzakta
      viewportWidth - TOOLTIP_WIDTH - SPACING // En fazla sağ kenardan SPACING kadar uzakta
    ),
  };
};

// Tooltip pozisyonunu ve boyutunu izlemek için tip
export interface TooltipMetrics {
  width: number;
  height: number;
  placement: Step['placement'];
}

// Tooltip'in mevcut pozisyonuna göre en uygun yerleşimi hesapla
export const getBestPlacement = (
  targetRect: DOMRect,
  tooltipMetrics: TooltipMetrics
): Step['placement'] => {
  const { width, height, placement } = tooltipMetrics;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Her yerleşim için available space hesapla
  const spaces = {
    top: targetRect.top - SPACING,
    bottom: viewportHeight - (targetRect.bottom + SPACING),
    left: targetRect.left - SPACING,
    right: viewportWidth - (targetRect.right + SPACING),
  };

  // Mevcut yerleşimde yeterli alan yoksa alternatif bul
  if (placement === 'top' && spaces.top < height) {
    return spaces.bottom >= height ? 'bottom' : 
           spaces.right >= width ? 'right' : 
           spaces.left >= width ? 'left' : 'bottom';
  }
  if (placement === 'bottom' && spaces.bottom < height) {
    return spaces.top >= height ? 'top' : 
           spaces.right >= width ? 'right' : 
           spaces.left >= width ? 'left' : 'top';
  }
  if (placement === 'left' && spaces.left < width) {
    return spaces.right >= width ? 'right' : 
           spaces.top >= height ? 'top' : 
           spaces.bottom >= height ? 'bottom' : 'right';
  }
  if (placement === 'right' && spaces.right < width) {
    return spaces.left >= width ? 'left' : 
           spaces.top >= height ? 'top' : 
           spaces.bottom >= height ? 'bottom' : 'left';
  }

  return placement;
};