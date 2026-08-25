import {
  createPortalElement,
  destroyPortalElement,
  getOrCreatePortalRoot,
  removePortalRoot,
  resolvePortalRoot,
} from '../core/Portal';

describe('Portal', () => {
  afterEach(() => {
    removePortalRoot();
    document.body.innerHTML = '';
  });

  it('creates a single #guideloop-portal root', () => {
    const root = getOrCreatePortalRoot();
    expect(root.id).toBe('guideloop-portal');
    expect(document.getElementById('guideloop-portal')).toBe(root);
    expect(getOrCreatePortalRoot()).toBe(root);
  });

  it('mounts and destroys portal content containers', () => {
    const el = createPortalElement();
    expect(el.className).toBe('guideloop-portal-content');
    expect(el.parentElement?.id).toBe('guideloop-portal');

    destroyPortalElement(el);
    expect(el.isConnected).toBe(false);
  });

  it('resolves a custom HTMLElement portal root', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    expect(resolvePortalRoot(host)).toBe(host);
  });

  it('mounts portal content into a custom parent', () => {
    const host = document.createElement('div');
    host.id = 'host';
    document.body.appendChild(host);
    const el = createPortalElement(host);
    expect(el.parentElement).toBe(host);
    destroyPortalElement(el);
  });
});
