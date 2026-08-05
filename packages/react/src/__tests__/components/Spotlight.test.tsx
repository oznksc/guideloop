import React from 'react';
import { render } from '@testing-library/react';
import { Spotlight } from '../../components/Spotlight';

describe('Spotlight', () => {
  const defaultPosition = { top: 100, left: 200, width: 300, height: 50 };

  it('renders at correct position with padding', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('92px');
    expect(div.style.left).toBe('192px');
    expect(div.style.width).toBe('316px');
    expect(div.style.height).toBe('66px');
  });

  it('renders with zero position', () => {
    const { container } = render(
      <Spotlight position={{ top: 0, left: 0, width: 0, height: 0 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('-8px');
    expect(div.style.left).toBe('-8px');
    expect(div.style.width).toBe('16px');
    expect(div.style.height).toBe('16px');
  });

  it('handles zero padding', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={0} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('100px');
    expect(div.style.left).toBe('200px');
    expect(div.style.width).toBe('300px');
    expect(div.style.height).toBe('50px');
  });

  it('applies custom style', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} style={{ opacity: 0.5 }} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.opacity).toBe('0.5');
  });

  it('has fixed positioning and pointer-events-none', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.position).toBe('fixed');
    expect(div.style.pointerEvents).toBe('none');
  });

  it('is accessible via guideloop-spotlight class', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toBe('guideloop-spotlight');
  });

  it('renders with negative position values', () => {
    const { container } = render(
      <Spotlight position={{ top: -10, left: -20, width: 100, height: 50 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('-18px');
    expect(div.style.left).toBe('-28px');
  });

  it('renders with large position values', () => {
    const { container } = render(
      <Spotlight position={{ top: 5000, left: 3000, width: 100, height: 50 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('4992px');
    expect(div.style.left).toBe('2992px');
  });

  it('uses theme border color from tailwind theme', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} theme="tailwind" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.border).toContain('2px solid');
    expect(div.style.borderColor).toMatch(/#2563eb|rgb\(37, 99, 235\)/);
  });

  it('renders a circular ring when shape is circle', () => {
    const { container } = render(
      <Spotlight
        position={{ top: 100, left: 100, width: 80, height: 40 }}
        padding={0}
        shape="circle"
      />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.borderRadius).toBe('50%');
    // diameter = max(80, 40) = 80, centered in the bbox
    expect(div.style.width).toBe('80px');
    expect(div.style.height).toBe('80px');
  });

  it('renders pre-padded targets without re-applying padding', () => {
    const { container } = render(
      <Spotlight
        targets={[{ top: 10, left: 20, width: 100, height: 50, shape: 'rect' }]}
        padding={99}
      />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('10px');
    expect(div.style.left).toBe('20px');
    expect(div.style.width).toBe('100px');
    expect(div.style.height).toBe('50px');
  });

  it('renders multi-target rings as SVG', () => {
    const { container } = render(
      <Spotlight
        targets={[
          { top: 10, left: 10, width: 40, height: 40, shape: 'rect' },
          { top: 100, left: 100, width: 50, height: 50, shape: 'circle' },
        ]}
      />
    );
    const svg = container.querySelector('svg.guideloop-spotlight');
    expect(svg).toBeInTheDocument();
    expect(container.querySelectorAll('rect, circle, ellipse, polygon').length).toBeGreaterThanOrEqual(2);
  });

  it('renders polygon spotlight as SVG stroke', () => {
    const { container } = render(
      <Spotlight
        targets={[
          {
            top: 0,
            left: 0,
            width: 100,
            height: 100,
            shape: {
              type: 'polygon',
              points: [
                [0.5, 0],
                [1, 1],
                [0, 1],
              ],
            },
          },
        ]}
      />
    );
    expect(container.querySelector('svg.guideloop-spotlight')).toBeInTheDocument();
    expect(container.querySelector('polygon')).toBeInTheDocument();
  });
});
