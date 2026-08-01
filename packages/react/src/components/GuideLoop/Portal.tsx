'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isBrowser } from '../../utils/env';

interface PortalProps {
  children: React.ReactNode;
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

/**
 * Renders children into `#guideloop-portal`.
 * Mount is deferred to the client so SSR / RSC pre-render never touches `document`
 * (avoids hydration mismatches under React 18/19).
 */
export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;
    setContainer(getOrCreatePortalRoot());
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export default Portal;
