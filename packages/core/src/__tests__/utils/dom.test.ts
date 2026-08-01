import { isHTMLElement, querySelectorAsHTMLElement, getElementPosition } from '../../dom/query';

describe('isHTMLElement', () => {
  it('returns true for HTMLElement', () => {
    const div = document.createElement('div');
    expect(isHTMLElement(div)).toBe(true);
  });

  it('returns false for SVGElement', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    expect(isHTMLElement(svg)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isHTMLElement(null)).toBe(false);
  });
});

describe('querySelectorAsHTMLElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns HTMLElement for valid selector', () => {
    const div = document.createElement('div');
    div.id = 'test';
    document.body.appendChild(div);
    expect(querySelectorAsHTMLElement('#test')).toBe(div);
  });

  it('returns null for non-HTMLElement (SVG)', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'svg-el';
    document.body.appendChild(svg);
    expect(querySelectorAsHTMLElement('#svg-el')).toBeNull();
  });

  it('returns null for non-existent element', () => {
    expect(querySelectorAsHTMLElement('#nonexistent')).toBeNull();
  });

  it('handles invalid selector without throwing', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const result = querySelectorAsHTMLElement('???invalid');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('getElementPosition', () => {
  it('returns element position with getBoundingClientRect', () => {
    const el = document.createElement('div');
    el.style.marginTop = '10px';
    el.style.marginLeft = '5px';
    el.style.paddingTop = '8px';
    el.style.paddingLeft = '4px';
    el.getBoundingClientRect = jest.fn(() => ({
      top: 100, left: 200, width: 300, height: 50,
      bottom: 150, right: 500, x: 200, y: 100,
      toJSON: jest.fn(),
    }));
    document.body.appendChild(el);

    const pos = getElementPosition(el);
    expect(pos.top).toBe(100);
    expect(pos.left).toBe(200);
    expect(pos.width).toBe(300);
    expect(pos.height).toBe(50);
    expect(pos.margin.top).toBe(10);
    expect(pos.margin.left).toBe(5);
    expect(pos.padding.top).toBe(8);
    expect(pos.padding.left).toBe(4);
  });
});
