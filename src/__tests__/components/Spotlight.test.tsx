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

  it('renders with zero padding', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={0} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('100px');
    expect(div.style.left).toBe('200px');
    expect(div.style.width).toBe('300px');
    expect(div.style.height).toBe('50px');
  });

  it('handles zero position', () => {
    const { container } = render(
      <Spotlight position={{ top: 0, left: 0, width: 0, height: 0 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('-8px');
    expect(div.style.left).toBe('-8px');
    expect(div.style.width).toBe('16px');
    expect(div.style.height).toBe('16px');
  });

  it('applies custom style', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} style={{ opacity: 0.5 }} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.opacity).toBe('0.5');
  });

  it('has pointer-events-none class', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('pointer-events-none');
  });
});
