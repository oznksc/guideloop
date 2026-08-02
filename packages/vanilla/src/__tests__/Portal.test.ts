import {
  createPortalElement,
  destroyPortalElement,
  getOrCreatePortalRoot,
  removePortalRoot,
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
});
