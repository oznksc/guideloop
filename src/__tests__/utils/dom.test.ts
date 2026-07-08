import { getElementPosition } from '../../utils/dom';

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
