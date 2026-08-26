export const isHTMLElement = (element: Element | null): element is HTMLElement => {
  return element instanceof HTMLElement;
};

/** `document.querySelector` that never throws (SSR, invalid selectors). */
export const safeQuerySelector = (selector: string): Element | null => {
  if (typeof document === 'undefined' || !selector) return null;
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`GuideLoop: Invalid selector "${selector}"`, error);
    return null;
  }
};

export const querySelectorAsHTMLElement = (selector: string): HTMLElement | null => {
  const element = safeQuerySelector(selector);
  return isHTMLElement(element) ? element : null;
};

const CHROME_SELECTOR =
  '#guideloop-portal, [data-guideloop], .guideloop-container, .guideloop-portal-content';

/** True when a mutation target is GuideLoop overlay/tooltip chrome (not the host app). */
export function isGuideLoopChrome(node: Node | null): boolean {
  if (!node || typeof Element === 'undefined') return false;
  const el = node instanceof Element ? node : node.parentElement;
  if (!el || typeof el.closest !== 'function') return false;
  return !!el.closest(CHROME_SELECTOR);
}

export const getElementRect = (element: Element): DOMRect => {
  return element.getBoundingClientRect();
};

export const getElementPosition = (element: Element) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      margin: {
        top: parseInt(computedStyle.marginTop),
        right: parseInt(computedStyle.marginRight),
        bottom: parseInt(computedStyle.marginBottom),
        left: parseInt(computedStyle.marginLeft),
      },
      padding: {
        top: parseInt(computedStyle.paddingTop),
        right: parseInt(computedStyle.paddingRight),
        bottom: parseInt(computedStyle.paddingBottom),
        left: parseInt(computedStyle.paddingLeft),
      },
    };
  };