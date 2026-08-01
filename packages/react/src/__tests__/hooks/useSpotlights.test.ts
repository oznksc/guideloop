import { renderHook, act } from '@testing-library/react';
import { useSpotlights } from '../../hooks/useSpotlight';

function mockRect(el: HTMLElement, rect: Partial<DOMRect>) {
  el.getBoundingClientRect = jest.fn(() => ({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
    ...rect,
  }));
}

describe('useSpotlights', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns empty array when no targets', () => {
    const { result } = renderHook(() => useSpotlights([]));
    expect(result.current).toEqual([]);
  });

  it('measures multiple targets with padding and shapes', () => {
    const a = document.createElement('div');
    a.id = 'a';
    mockRect(a, { top: 10, left: 20, width: 100, height: 40 });
    document.body.appendChild(a);

    const b = document.createElement('div');
    b.id = 'b';
    mockRect(b, { top: 200, left: 50, width: 80, height: 80 });
    document.body.appendChild(b);

    const { result } = renderHook(() =>
      useSpotlights([
        { selector: '#a', padding: 4, shape: 'rect' },
        { selector: '#b', padding: 0, shape: 'circle' },
      ])
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({
      top: 6,
      left: 16,
      width: 108,
      height: 48,
      shape: 'rect',
    });
    expect(result.current[1]).toMatchObject({
      top: 200,
      left: 50,
      width: 80,
      height: 80,
      shape: 'circle',
    });
  });

  it('updates all holes on scroll', () => {
    const a = document.createElement('div');
    a.id = 'scroll-a';
    mockRect(a, { top: 100, left: 10, width: 50, height: 20 });
    document.body.appendChild(a);

    const { result } = renderHook(() =>
      useSpotlights([{ selector: '#scroll-a', padding: 0 }])
    );

    expect(result.current[0].top).toBe(100);

    mockRect(a, { top: 40, left: 10, width: 50, height: 20 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current[0].top).toBe(40);
  });
});
