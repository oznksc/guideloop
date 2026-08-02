/**
 * DOM MaskedOverlay component — full-page dim overlay with SVG cutout mask
 * that exposes the spotlight target(s).
 */

import {
  getAnimationStyle,
  isValidHole,
  resolveSpotlightShape,
} from '@guideloop/core';
import type {
  SpotlightHole,
  ResolvedSpotlightShape,
  SpotlightShape,
  ThemeConfig,
  AnimationConfig,
} from '@guideloop/core';
import { getTheme } from '@guideloop/core';
import type { Theme } from '@guideloop/core';
import { getViewportSize } from '../core/ViewportTracker';

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface MaskedOverlayOptions {
  targetRect?: TargetRect | null;
  targets?: SpotlightHole[];
  shape?: SpotlightShape;
  onClick?: () => void;
  theme: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['overlay'];
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export interface MaskedOverlayInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
  /** Rebuild cutouts when target rects change (scroll/resize). */
  updateTargets: (targets: SpotlightHole[]) => void;
}

function normalizeHoles(
  targets: SpotlightHole[] | undefined,
  targetRect: TargetRect | null | undefined,
  shape: SpotlightShape
): SpotlightHole[] {
  const holes: SpotlightHole[] = [];
  if (targets && targets.length > 0) {
    for (const h of targets.filter(isValidHole)) {
      holes.push({ ...h, shape: h.shape ?? 'rect' });
    }
  } else if (targetRect && isValidHole(targetRect)) {
    holes.push({ ...targetRect, shape });
  }
  return holes;
}

function paintOverlay(
  container: HTMLElement,
  holes: SpotlightHole[],
  overlayRgba: string,
  borderRadius: string
): void {
  container.innerHTML = '';
  container.style.backgroundColor = '';

  if (holes.length === 0) {
    container.style.backgroundColor = overlayRgba;
    container.style.overflow = '';
    return;
  }

  container.style.overflow = 'hidden';

  const { width: vpW, height: vpH } = getViewportSize();
  const maskId = `gl-mask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', String(vpW));
  svg.setAttribute('height', String(vpH));
  svg.style.pointerEvents = 'none';
  svg.style.position = 'fixed';
  svg.style.top = '0';
  svg.style.left = '0';

  const defs = document.createElementNS(svgNS, 'defs');
  const mask = document.createElementNS(svgNS, 'mask');
  mask.setAttribute('id', maskId);

  const maskBg = document.createElementNS(svgNS, 'rect');
  maskBg.setAttribute('x', '0');
  maskBg.setAttribute('y', '0');
  maskBg.setAttribute('width', '100%');
  maskBg.setAttribute('height', '100%');
  maskBg.setAttribute('fill', 'white');
  mask.appendChild(maskBg);

  for (const hole of holes) {
    const resolved = resolveSpotlightShape(hole, hole.shape, borderRadius);
    mask.appendChild(createMaskCutout(resolved));
  }

  defs.appendChild(mask);
  svg.appendChild(defs);

  const maskedRect = document.createElementNS(svgNS, 'rect');
  maskedRect.setAttribute('x', '0');
  maskedRect.setAttribute('y', '0');
  maskedRect.setAttribute('width', '100%');
  maskedRect.setAttribute('height', '100%');
  maskedRect.setAttribute('fill', overlayRgba);
  maskedRect.setAttribute('mask', `url(#${maskId})`);
  svg.appendChild(maskedRect);

  container.appendChild(svg);
}

export function createMaskedOverlay(options: MaskedOverlayOptions): MaskedOverlayInstance {
  const {
    targetRect,
    targets,
    shape = 'rect',
    onClick,
    theme,
    customTheme,
    animation,
  } = options;

  const themeStyles = getTheme(theme, customTheme);
  const overlayColor = themeStyles.overlay.background;
  const overlayOpacity = themeStyles.overlay.opacity;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity);
  const borderRadius = themeStyles.spotlight.borderRadius;

  let holes = normalizeHoles(targets, targetRect, shape);

  const container = document.createElement('div');
  container.className = 'guideloop-overlay';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'auto';

  const animStyle = getAnimationStyle(animation, 'enter');
  if (animStyle.animation) container.style.animation = animStyle.animation as string;
  if (animStyle.opacity) container.style.opacity = String(animStyle.opacity);

  if (onClick) {
    container.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });
  }

  paintOverlay(container, holes, overlayRgba, borderRadius);

  return {
    getElement: () => container,
    mount(parent: HTMLElement) {
      parent.appendChild(container);
    },
    unmount() {
      if (container.isConnected) {
        container.remove();
      }
    },
    destroy() {
      this.unmount();
    },
    updateTargets(nextTargets: SpotlightHole[]) {
      holes = normalizeHoles(nextTargets, null, shape);
      paintOverlay(container, holes, overlayRgba, borderRadius);
    },
  };
}

function createMaskCutout(shape: ResolvedSpotlightShape): SVGElement {
  const svgNS = 'http://www.w3.org/2000/svg';
  let el: SVGElement;

  switch (shape.type) {
    case 'circle':
      el = document.createElementNS(svgNS, 'circle');
      el.setAttribute('cx', String(shape.cx));
      el.setAttribute('cy', String(shape.cy));
      el.setAttribute('r', String(shape.r));
      el.setAttribute('fill', 'black');
      break;
    case 'ellipse':
      el = document.createElementNS(svgNS, 'ellipse');
      el.setAttribute('cx', String(shape.cx));
      el.setAttribute('cy', String(shape.cy));
      el.setAttribute('rx', String(shape.rx));
      el.setAttribute('ry', String(shape.ry));
      el.setAttribute('fill', 'black');
      break;
    case 'polygon':
      el = document.createElementNS(svgNS, 'polygon');
      el.setAttribute('points', shape.points);
      el.setAttribute('fill', 'black');
      break;
    case 'rect':
    default:
      el = document.createElementNS(svgNS, 'rect');
      el.setAttribute('x', String(shape.x));
      el.setAttribute('y', String(shape.y));
      el.setAttribute('width', String(shape.width));
      el.setAttribute('height', String(shape.height));
      if (shape.rx) el.setAttribute('rx', String(shape.rx));
      el.setAttribute('fill', 'black');
      break;
  }

  return el;
}
