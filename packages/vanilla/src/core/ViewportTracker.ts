/**
 * Viewport tracker — provides current viewport dimensions and
 * a subscribe mechanism for resize events.
 */

export interface ViewportSize {
  width: number;
  height: number;
}

export type ViewportListener = (size: ViewportSize) => void;

let cachedSize: ViewportSize = readViewport();
const listeners = new Set<ViewportListener>();
let listening = false;

function readViewport(): ViewportSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function onResize(): void {
  cachedSize = readViewport();
  for (const listener of listeners) {
    listener(cachedSize);
  }
}

function ensureListening(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('resize', onResize, { passive: true });
}

export function getViewportSize(): ViewportSize {
  return cachedSize;
}

export function subscribeViewport(listener: ViewportListener): () => void {
  ensureListening();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && listening) {
      listening = false;
      window.removeEventListener('resize', onResize);
    }
  };
}
