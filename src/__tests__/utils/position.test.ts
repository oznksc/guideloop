import { calculateTooltipPosition, createDOMRect } from '../../utils/position';

describe('calculateTooltipPosition', () => {
  const targetPos = { top: 100, left: 200, width: 300, height: 50, bottom: 150, right: 500, x: 200, y: 100 };
  const tooltipSize = { width: 200, height: 100 };

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('places tooltip below by default', () => {
    const pos = calculateTooltipPosition(targetPos, 'bottom', tooltipSize);
    expect(pos.top).toBe(162);
    expect(pos.left).toBe(250);
  });

  it('places tooltip above target', () => {
    const pos = calculateTooltipPosition(targetPos, 'top', tooltipSize);
    expect(pos.top).toBe(12); // clamped to SPACING because -12 < 12
    expect(pos.left).toBe(250);
  });

  it('places tooltip to the left', () => {
    const pos = calculateTooltipPosition(targetPos, 'left', tooltipSize);
    expect(pos.top).toBe(75);
    expect(pos.left).toBe(12); // clamped to SPACING because -12 < 12
  });

  it('places tooltip to the right', () => {
    const pos = calculateTooltipPosition(targetPos, 'right', tooltipSize);
    expect(pos.top).toBe(75);
    expect(pos.left).toBe(512);
  });

  it('handles variations like top-start', () => {
    const pos = calculateTooltipPosition(targetPos, 'top-start', tooltipSize);
    expect(pos.top).toBe(12); // clamped
  });

  it('clamps position to stay within viewport horizontally', () => {
    const farRightTarget = { ...targetPos, left: 900, right: 1200 };
    const pos = calculateTooltipPosition(farRightTarget, 'bottom', tooltipSize);
    expect(pos.left).toBeLessThanOrEqual(window.innerWidth - 12);
  });

  it('adds scroll offset to position', () => {
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 100, configurable: true });
    const pos = calculateTooltipPosition(targetPos, 'bottom', tooltipSize);
    expect(pos.top).toBe(362);
    expect(pos.left).toBe(350);
  });
});

describe('createDOMRect', () => {
  it('creates a DOMRect-like object', () => {
    const pos = { top: 10, left: 20, width: 100, height: 50, bottom: 60, right: 120, x: 20, y: 10 };
    const rect = createDOMRect(pos);
    expect(rect.top).toBe(10);
    expect(rect.left).toBe(20);
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
    expect(rect.bottom).toBe(60);
    expect(rect.right).toBe(120);
    expect(rect.x).toBe(20);
    expect(rect.y).toBe(10);
  });

  it('has toJSON method', () => {
    const pos = { top: 10, left: 20, width: 100, height: 50, bottom: 60, right: 120, x: 20, y: 10 };
    const rect = createDOMRect(pos);
    expect(typeof rect.toJSON).toBe('function');
  });
});
