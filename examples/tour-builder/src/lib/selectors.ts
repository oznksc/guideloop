const CANVAS_ROOT = '#builder-canvas';

/**
 * Build a stable CSS selector for an element on the canvas.
 * Prefers #id, then data-tour-id, then a short unique path.
 */
export function buildSelector(el: Element): string {
  if (!(el instanceof HTMLElement)) {
    return '';
  }

  if (el.id && !el.id.startsWith('guideloop')) {
    const escaped = cssEscape(el.id);
    return `#${escaped}`;
  }

  const dataId = el.getAttribute('data-tour-id');
  if (dataId) {
    return `[data-tour-id="${cssAttr(dataId)}"]`;
  }

  const name = el.getAttribute('name');
  if (name && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) {
    return `${el.tagName.toLowerCase()}[name="${cssAttr(name)}"]`;
  }

  const aria = el.getAttribute('aria-label');
  if (aria && (el.tagName === 'BUTTON' || el.tagName === 'A')) {
    const selector = `${el.tagName.toLowerCase()}[aria-label="${cssAttr(aria)}"]`;
    if (isUniqueInCanvas(selector)) return selector;
  }

  // Build a short nth-of-type path from a stable ancestor with an id
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    if (
      node instanceof HTMLElement &&
      node.id &&
      !node.id.startsWith('guideloop')
    ) {
      parts.unshift(`#${cssEscape(node.id)}`);
      break;
    }
    const parent = node.parentElement;
    if (!parent) break;
    const tag = node.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(
      (c) => c.tagName === node!.tagName
    );
    if (siblings.length === 1) {
      parts.unshift(tag);
    } else {
      const index = siblings.indexOf(node) + 1;
      parts.unshift(`${tag}:nth-of-type(${index})`);
    }
    node = parent;
    if (parts.length > 6) break;
  }

  return parts.join(' > ') || el.tagName.toLowerCase();
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
}

function cssAttr(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isUniqueInCanvas(selector: string): boolean {
  try {
    const root = document.querySelector(CANVAS_ROOT) ?? document;
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

/** True if the element is part of the builder chrome (not the canvas). */
export function isBuilderChrome(el: Element | null): boolean {
  if (!el || !(el instanceof Element)) return true;
  if (el.classList?.contains('pick-ring')) return true;
  return Boolean(
    el.closest('[data-builder-chrome]') ||
      el.closest('#guideloop-portal') ||
      el.closest('.guideloop-container') ||
      el.closest('.guideloop-tooltip') ||
      el.closest('.guideloop-spotlight') ||
      el.closest('.guideloop-debug-hud') ||
      el.closest('.pick-ring')
  );
}

/** Only allow picks inside the demo canvas. */
export function isInsideCanvas(el: Element | null): boolean {
  if (!el) return false;
  return Boolean(el.closest(CANVAS_ROOT));
}

/**
 * Resolve the best pick target under the pointer, skipping chrome / pick ring.
 */
export function resolvePickTarget(clientX: number, clientY: number): HTMLElement | null {
  const stack =
    typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(clientX, clientY)
      : ([document.elementFromPoint(clientX, clientY)].filter(Boolean) as Element[]);

  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (isBuilderChrome(el)) continue;
    if (!isInsideCanvas(el)) continue;

    const target =
      el.closest<HTMLElement>(
        'button, a, input, select, textarea, [data-tour-id], [id]'
      ) ?? el;

    if (isBuilderChrome(target) || !isInsideCanvas(target)) continue;

    // Prefer leaf interactive / identified nodes over huge containers
    if (target.id === 'builder-canvas' || target.getAttribute('data-tour-id') === 'canvas-root') {
      continue;
    }

    return target;
  }
  return null;
}

export type SelectorStatus = 'empty' | 'valid' | 'missing' | 'invalid' | 'ambiguous';

export function validateSelector(selector: string): {
  status: SelectorStatus;
  count: number;
  message: string;
} {
  const trimmed = selector.trim();
  if (!trimmed) {
    return { status: 'empty', count: 0, message: 'No selector' };
  }
  try {
    const matches = document.querySelectorAll(trimmed);
    if (matches.length === 0) {
      return { status: 'missing', count: 0, message: 'Not found in document' };
    }
    if (matches.length > 1) {
      return {
        status: 'ambiguous',
        count: matches.length,
        message: `${matches.length} matches (prefer a unique selector)`,
      };
    }
    return { status: 'valid', count: 1, message: 'Found' };
  } catch {
    return { status: 'invalid', count: 0, message: 'Invalid CSS selector' };
  }
}
