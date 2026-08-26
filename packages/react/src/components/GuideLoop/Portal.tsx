'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isBrowser } from '../../utils/env';
import type { PortalContainer } from './types';

export type { PortalContainer };

interface PortalProps {
  children: React.ReactNode;
  /**
   * Mount node for overlay + tooltip. Defaults to `#guideloop-portal` on
   * `document.body`. Pass an element (or selector) to escape transformed
   * ancestors / embed the tour in a specific webview layer.
   */
  container?: PortalContainer | null;
}

function getOrCreatePortalRoot(): HTMLElement {
  let portalRoot = document.getElementById('guideloop-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'guideloop-portal';
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
}

function resolvePortalContainer(
  container?: PortalContainer | null
): HTMLElement | null {
  if (!isBrowser()) return null;
  if (container instanceof HTMLElement) return container;
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

/**
 * Renders children into a document-level portal (`#guideloop-portal` by default).
 * Mount is deferred to the client so SSR / RSC pre-render never touches `document`.
 */
export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMountNode(resolvePortalContainer(container));
  }, [container]);

  if (!mountNode) {
    return null;
  }

  return createPortal(children, mountNode);
};

export default Portal;
