/**
 * Portal utility — mounts content into a dedicated body-level container.
 * Equivalent of React Portal, but framework-agnostic.
 */

const PORTAL_ID = 'guideloop-portal';
let portalRoot: HTMLElement | null = null;

export type PortalContainer = HTMLElement | string;

export function getOrCreatePortalRoot(): HTMLElement {
  if (portalRoot && portalRoot.isConnected) {
    return portalRoot;
  }

  portalRoot = document.getElementById(PORTAL_ID);
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = PORTAL_ID;
    portalRoot.setAttribute('data-guideloop', 'portal');
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}

/** Resolve a host-provided node/selector, or the default `#guideloop-portal`. */
export function resolvePortalRoot(
  container?: PortalContainer | null
): HTMLElement {
  if (container instanceof HTMLElement) {
    return container;
  }
  if (typeof container === 'string' && container) {
    try {
      const found = document.querySelector(container);
      if (found instanceof HTMLElement) return found;
      console.warn(
        `GuideLoop: portalContainer selector "${container}" did not match an HTMLElement; using #guideloop-portal`
      );
    } catch {
      console.warn(
        `GuideLoop: Invalid portalContainer selector "${container}"; using #guideloop-portal`
      );
    }
  }
  return getOrCreatePortalRoot();
}

/** Remove the shared portal root (tests / full teardown). */
export function removePortalRoot(): void {
  if (portalRoot && portalRoot.isConnected) {
    portalRoot.remove();
  }
  portalRoot = null;
}

export function createPortalElement(
  parent?: PortalContainer | null
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'guideloop-portal-content';
  container.style.position = 'relative';
  container.style.zIndex = '0';
  resolvePortalRoot(parent).appendChild(container);
  return container;
}

export function destroyPortalElement(container: HTMLElement): void {
  if (container.isConnected) {
    container.remove();
  }
}
