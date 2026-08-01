const DEFAULT_TIMEOUT = 10000;

export interface WaitForElementOptions {
  timeout?: number;
  root?: HTMLElement;
}

export function waitForElement(
  selector: string,
  options: WaitForElementOptions = {}
): Promise<Element> {
  const { timeout = DEFAULT_TIMEOUT, root = document.body } = options;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      observer.disconnect();
      reject(new Error(`GuideLoop: Target element '${selector}' not found within ${timeout}ms`));
    }, timeout);

    const observer = new MutationObserver(() => {
      if (timedOut) return;

      const element = document.querySelector(selector);
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
