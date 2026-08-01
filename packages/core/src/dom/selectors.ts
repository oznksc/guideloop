/**
 * Selector helpers for full-page TourBuilder (any live app DOM).
 */

export function buildSelector(el: Element): string {
  if (!(el instanceof HTMLElement)) return '';

  if (el.id && !el.id.startsWith('guideloop')) {
    return `#${cssEscape(el.id)}`;
  }

  const dataId = el.getAttribute('data-tour-id');
  if (dataId) {
    return `[data-tour-id="${cssAttr(dataId)}"]`;
  }

  const name = el.getAttribute('name');
  if (
    name &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'SELECT' ||
      el.tagName === 'TEXTAREA')
  ) {
    return `${el.tagName.toLowerCase()}[name="${cssAttr(name)}"]`;
  }

  const aria = el.getAttribute('aria-label');
  if (aria && (el.tagName === 'BUTTON' || el.tagName === 'A')) {
    const selector = `${el.tagName.toLowerCase()}[aria-label="${cssAttr(aria)}"]`;
    if (isUnique(selector)) return selector;
  }

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
    const parentEl: HTMLElement | null = node.parentElement;
    if (!parentEl) break;
    const current: Element = node;
    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parentEl.children).filter(
      (c: Element) => c.tagName === current.tagName
    );
    if (siblings.length === 1) {
      parts.unshift(tag);
    } else {
      const index = siblings.indexOf(current) + 1;
      parts.unshift(`${tag}:nth-of-type(${index})`);
    }
    node = parentEl;
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

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

/** Skip GuideLoop UI + TourBuilder chrome. */
export function isBuilderChrome(el: Element | null): boolean {
  if (!el || !(el instanceof Element)) return true;
  if (el.classList?.contains('guideloop-pick-ring')) return true;
  return Boolean(
    el.closest('[data-guideloop-builder]') ||
      el.closest('#guideloop-portal') ||
      el.closest('.guideloop-container') ||
      el.closest('.guideloop-tooltip') ||
      el.closest('.guideloop-spotlight') ||
      el.closest('.guideloop-debug-hud') ||
      el.closest('.guideloop-pick-ring') ||
      el.closest('.guideloop-pick-label')
  );
}

export function resolvePickTarget(
  clientX: number,
  clientY: number
): HTMLElement | null {
  const stack =
    typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(clientX, clientY)
      : ([document.elementFromPoint(clientX, clientY)].filter(
          Boolean
        ) as Element[]);

  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue;
    if (isBuilderChrome(el)) continue;

    const target =
      el.closest<HTMLElement>(
        'button, a, input, select, textarea, [data-tour-id], [id]'
      ) ?? el;

    if (isBuilderChrome(target)) continue;
    if (target === document.body || target === document.documentElement) {
      continue;
    }

    return target;
  }
  return null;
}

export type SelectorStatus =
  | 'empty'
  | 'valid'
  | 'missing'
  | 'invalid'
  | 'ambiguous';

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
      return { status: 'missing', count: 0, message: 'Not found' };
    }
    if (matches.length > 1) {
      return {
        status: 'ambiguous',
        count: matches.length,
        message: `${matches.length} matches`,
      };
    }
    return { status: 'valid', count: 1, message: 'Found' };
  } catch {
    return { status: 'invalid', count: 0, message: 'Invalid CSS' };
  }
}
