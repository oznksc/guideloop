/**
 * Portal utility — mounts content into a dedicated body-level container.
 * Equivalent of React Portal, but framework-agnostic.
 */

const PORTAL_ID = 'guideloop-portal';
let portalRoot: HTMLElement | null = null;

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

/** Remove the shared portal root (tests / full teardown). */
export function removePortalRoot(): void {
  if (portalRoot && portalRoot.isConnected) {
    portalRoot.remove();
  }
  portalRoot = null;
}

export function createPortalElement(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'guideloop-portal-content';
  container.style.position = 'relative';
  container.style.zIndex = '0';
  getOrCreatePortalRoot().appendChild(container);
  return container;
}

export function destroyPortalElement(container: HTMLElement): void {
  if (container.isConnected) {
    container.remove();
  }
}
