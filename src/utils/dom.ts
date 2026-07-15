export const isHTMLElement = (element: Element | null): element is HTMLElement => {
  return element instanceof HTMLElement;
};

export const querySelectorAsHTMLElement = (selector: string): HTMLElement | null => {
  try {
    const element = document.querySelector(selector);
    return isHTMLElement(element) ? element : null;
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
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