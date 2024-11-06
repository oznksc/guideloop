import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({ children }) => {
  // Create portal container if it doesn't exist
  let portalRoot = document.getElementById('guideloop-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'guideloop-portal';
    document.body.appendChild(portalRoot);
  }

  return createPortal(children, portalRoot);
};