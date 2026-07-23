export const scrollIntoView = (
  element: Element,
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
): Promise<void> => {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      element.scrollIntoView?.(options);
      resolve();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      observer.disconnect();
      if (entries[0].isIntersecting) {
        resolve();
      } else {
        element.scrollIntoView(options);
        setTimeout(resolve, 100); // Small delay to ensure scroll completes
      }
    });

    observer.observe(element);
  });
};
