const DEFAULT_TIMEOUT = 10000;

export interface WaitForElementOptions {
  timeout?: number;
  root?: HTMLElement;
}

export function waitForElement(
  selector: string,
  options: WaitForElementOptions = {}
): Promise<Element> {
  if (typeof document === 'undefined') {
    return Promise.reject(
      new Error('GuideLoop: waitForElement requires a DOM environment')
    );
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const root = options.root ?? document.body;

  if (!root) {
    return Promise.reject(
      new Error('GuideLoop: waitForElement requires a document body')
    );
  }

  const query = (): Element | null => {
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  };

  try {
    document.querySelector(selector);
  } catch {
    return Promise.reject(
      new Error(`GuideLoop: Invalid selector '${selector}'`)
    );
  }

  return new Promise((resolve, reject) => {
    const existing = query();
    if (existing) {
      resolve(existing);
      return;
    }

    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      observer.disconnect();
      reject(
        new Error(
          `GuideLoop: Target element '${selector}' not found within ${timeout}ms`
        )
      );
    }, timeout);

    const observer = new MutationObserver(() => {
      if (timedOut) return;

      const element = query();
      if (element) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  });
}
