import { getAnimationStyle, createAnimation, injectKeyframes, defaultAnimations } from '../../utils/animation';

describe('animation utils', () => {
  describe('defaultAnimations', () => {
    it('has tooltip, spotlight, and overlay configs', () => {
      expect(defaultAnimations.tooltip).toBeDefined();
      expect(defaultAnimations.spotlight).toBeDefined();
      expect(defaultAnimations.overlay).toBeDefined();
    });
  });

  describe('getAnimationStyle', () => {
    it('returns empty object when no settings provided', () => {
      expect(getAnimationStyle(undefined, 'enter')).toEqual({});
    });

    it('returns empty object when settings has no enter state', () => {
      expect(getAnimationStyle({ exit: 'fade-out' }, 'enter')).toEqual({});
    });

    it('returns style with animation properties for enter state', () => {
      const result = getAnimationStyle({ enter: 'fade-in 0.3s ease-out', duration: 300, timing: 'ease' }, 'enter');
      expect(result.animation).toBe('fade-in 0.3s ease-out');
      expect(result.animationDuration).toBe('300ms');
      expect(result.animationTimingFunction).toBe('ease');
    });

    it('uses defaults when duration and timing are missing', () => {
      const result = getAnimationStyle({ enter: 'fade-in' }, 'enter');
      expect(result.animationDuration).toBe('300ms');
      expect(result.animationTimingFunction).toBe('ease');
    });
  });

  describe('createAnimation', () => {
    it('returns empty string when no settings', () => {
      expect(createAnimation(undefined, 'enter')).toBe('');
    });

    it('returns empty string when state is missing', () => {
      expect(createAnimation({ exit: 'fade-out' }, 'enter')).toBe('');
    });

    it('returns CSS animation string', () => {
      const result = createAnimation({ enter: 'fade-in 0.3s', duration: 300, timing: 'ease' }, 'enter');
      expect(result).toContain('animation: fade-in 0.3s');
      expect(result).toContain('animation-duration: 300');
      expect(result).toContain('animation-timing-function: ease');
    });
  });

  describe('injectKeyframes', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
    });

    it('injects style element with keyframes', () => {
      injectKeyframes();
      const style = document.getElementById('guideloop-animations');
      expect(style).toBeInTheDocument();
      expect(style?.textContent).toContain('@keyframes fade-in');
      expect(style?.textContent).toContain('@keyframes fade-out');
      expect(style?.textContent).toContain('@keyframes scale-in');
      expect(style?.textContent).toContain('@keyframes scale-out');
    });

    it('does not inject duplicate style element', () => {
      injectKeyframes();
      injectKeyframes();
      const styles = document.querySelectorAll('#guideloop-animations');
      expect(styles.length).toBe(1);
    });

    it('does nothing if document is undefined', () => {
      const origDoc = global.document;
      (global as { document: typeof document | undefined }).document = undefined;
      expect(() => injectKeyframes()).not.toThrow();
      global.document = origDoc;
    });
  });
});
