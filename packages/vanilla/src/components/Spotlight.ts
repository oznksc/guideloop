/**
 * DOM Spotlight component — renders highlight rings around target elements.
 * Supports rect, circle, ellipse, and polygon shapes via SVG.
 */

import {
  getAnimationStyle,
  getShapeName,
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

export interface SpotlightOptions {
  targets?: SpotlightHole[];
  position?: { top: number; left: number; width: number; height: number };
  shape?: SpotlightShape;
  padding?: number;
  theme: Theme;
  customTheme?: Partial<ThemeConfig>;
  animation?: AnimationConfig['spotlight'];
}

export interface SpotlightInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
  /** Reposition rings when target rects change (scroll/resize). */
  updateTargets: (targets: SpotlightHole[]) => void;
}

function buildHoles(
  targets: SpotlightHole[] | undefined,
  position: SpotlightOptions['position'],
  shape: SpotlightShape,
  padding: number
): SpotlightHole[] {
  const holes: SpotlightHole[] = [];
  if (targets && targets.length > 0) {
    for (const h of targets) {
      holes.push({ ...h, shape: h.shape ?? 'rect' });
    }
  } else if (position) {
    const hole: SpotlightHole = {
      top: position.top - padding,
      left: position.left - padding,
      width: position.width + padding * 2,
      height: position.height + padding * 2,
      shape,
    };
    if (isValidHole(hole) || padding > 0 || position.width === 0) {
      holes.push(hole);
    }
  }
  return holes;
}

function buildSpotlightElement(
  holes: SpotlightHole[],
  borderColor: string,
  borderWidth: string,
  borderRadius: string,
  animation: AnimationConfig['spotlight']
): HTMLElement {
  if (holes.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'guideloop-spotlight';
    emptyDiv.style.display = 'none';
    return emptyDiv;
  }

  const needsSvg =
    holes.some((h) => getShapeName(h.shape) === 'polygon') || holes.length > 1;

  if (needsSvg) {
    return createSvgSpotlight(
      holes,
      borderColor,
      borderWidth,
      borderRadius,
      animation
    ) as HTMLElement;
  }
  return createDivSpotlight(
    holes[0],
    borderColor,
    borderWidth,
    borderRadius,
    animation
  );
}

export function createSpotlight(options: SpotlightOptions): SpotlightInstance {
  const {
    targets,
    position,
    shape = 'rect',
    padding = 0,
    theme,
    customTheme,
    animation,
  } = options;

  const themeStyles = getTheme(theme, customTheme);
  const borderColor = themeStyles.spotlight.borderColor;
  const borderWidth = themeStyles.spotlight.borderWidth;
  const borderRadius = themeStyles.spotlight.borderRadius;

  let holes = buildHoles(targets, position, shape, padding);
  let element = buildSpotlightElement(
    holes,
    borderColor,
    borderWidth,
    borderRadius,
    animation
  );
  let parentEl: HTMLElement | null = null;

  function replaceElement(next: HTMLElement) {
    const prev = element;
    const styles = {
      position: prev.style.position,
      zIndex: prev.style.zIndex,
    };
    if (styles.position) next.style.position = styles.position;
    if (styles.zIndex) next.style.zIndex = styles.zIndex;

    if (parentEl && prev.parentNode === parentEl) {
      parentEl.replaceChild(next, prev);
    } else if (prev.isConnected && prev.parentNode) {
      prev.parentNode.replaceChild(next, prev);
    }
    element = next;
  }

  return {
    getElement: () => element,
    mount(parent: HTMLElement) {
      parentEl = parent;
      parent.appendChild(element);
    },
    unmount() {
      if (element.isConnected) {
        element.remove();
      }
      parentEl = null;
    },
    destroy() {
      this.unmount();
    },
    updateTargets(nextTargets: SpotlightHole[]) {
      holes = buildHoles(nextTargets, undefined, shape, padding);
      const next = buildSpotlightElement(
        holes,
        borderColor,
        borderWidth,
        borderRadius,
        undefined // no re-enter animation on scroll updates
      );
      replaceElement(next);
    },
  };
}

function createDivSpotlight(
  hole: SpotlightHole,
  borderColor: string,
  borderWidth: string,
  borderRadius: string,
  animation: AnimationConfig['spotlight']
): HTMLElement {
  const name = getShapeName(hole.shape);
  const isRound = name === 'circle' || name === 'ellipse';
  let { top, left, width, height } = hole;

  if (name === 'circle') {
    const size = Math.max(width, height);
    left = left + width / 2 - size / 2;
    top = top + height / 2 - size / 2;
    width = size;
    height = size;
  }

  const el = document.createElement('div');
  el.className = 'guideloop-spotlight';
  Object.assign(el.style, {
    position: 'fixed',
    pointerEvents: 'none',
    border: `${borderWidth} solid ${borderColor}`,
    borderRadius: isRound ? '50%' : borderRadius,
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    boxSizing: 'border-box',
    ...getAnimationStyle(animation, 'enter'),
  });

  return el;
}

function createSvgSpotlight(
  holes: SpotlightHole[],
  borderColor: string,
  borderWidth: string,
  borderRadius: string,
  animation: AnimationConfig['spotlight']
): HTMLElement | SVGElement {
  const stroke = parseFloat(borderWidth) || 2;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const resolved = holes.map((hole) => {
    const r = resolveSpotlightShape(hole, hole.shape, borderRadius);
    if (r.type === 'rect') {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    } else if (r.type === 'circle') {
      minX = Math.min(minX, r.cx - r.r);
      minY = Math.min(minY, r.cy - r.r);
      maxX = Math.max(maxX, r.cx + r.r);
      maxY = Math.max(maxY, r.cy + r.r);
    } else if (r.type === 'ellipse') {
      minX = Math.min(minX, r.cx - r.rx);
      minY = Math.min(minY, r.cy - r.ry);
      maxX = Math.max(maxX, r.cx + r.rx);
      maxY = Math.max(maxY, r.cy + r.ry);
    } else {
      // polygon
      r.points.split(' ').forEach((pair) => {
        const [x, y] = pair.split(',').map(Number);
        if (!Number.isNaN(x) && !Number.isNaN(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      });
    }
    return r;
  });

  if (!Number.isFinite(minX)) {
    const empty: HTMLElement = document.createElement('div');
    empty.style.display = 'none';
    return empty;
  }

  const pad = stroke + 2;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const svgW = Math.max(maxX - minX, 0);
  const svgH = Math.max(maxY - minY, 0);

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'guideloop-spotlight');
  svg.setAttribute('width', String(svgW));
  svg.setAttribute('height', String(svgH));
  svg.style.position = 'fixed';
  svg.style.pointerEvents = 'none';
  svg.style.top = `${minY}px`;
  svg.style.left = `${minX}px`;
  svg.style.overflow = 'visible';

  const animStyle = getAnimationStyle(animation, 'enter');
  if (animStyle.animation) svg.style.animation = animStyle.animation as string;
  if (animStyle.opacity) svg.style.opacity = String(animStyle.opacity);

  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('transform', `translate(${-minX}, ${-minY})`);

  for (const r of resolved) {
    const el = createSvgRing(r, borderColor, stroke);
    g.appendChild(el);
  }

  svg.appendChild(g);
  return svg;
}

function createSvgRing(
  resolved: ResolvedSpotlightShape,
  borderColor: string,
  strokeWidth: number
): SVGElement {
  const svgNS = 'http://www.w3.org/2000/svg';
  const attrs = {
    fill: 'none',
    stroke: borderColor,
    'stroke-width': String(strokeWidth),
  };

  let el: SVGElement;

  switch (resolved.type) {
    case 'circle':
      el = document.createElementNS(svgNS, 'circle');
      el.setAttribute('cx', String(resolved.cx));
      el.setAttribute('cy', String(resolved.cy));
      el.setAttribute('r', String(resolved.r));
      break;
    case 'ellipse':
      el = document.createElementNS(svgNS, 'ellipse');
      el.setAttribute('cx', String(resolved.cx));
      el.setAttribute('cy', String(resolved.cy));
      el.setAttribute('rx', String(resolved.rx));
      el.setAttribute('ry', String(resolved.ry));
      break;
    case 'polygon':
      el = document.createElementNS(svgNS, 'polygon');
      el.setAttribute('points', resolved.points);
      break;
    case 'rect':
    default:
      el = document.createElementNS(svgNS, 'rect');
      el.setAttribute('x', String(resolved.x));
      el.setAttribute('y', String(resolved.y));
      el.setAttribute('width', String(resolved.width));
      el.setAttribute('height', String(resolved.height));
      if (resolved.rx) el.setAttribute('rx', String(resolved.rx));
      break;
  }

  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }

  return el;
}
