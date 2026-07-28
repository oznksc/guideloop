import React from 'react';
import { render } from '@testing-library/react';
import { Spotlight } from '../../components/Spotlight';

describe('Spotlight', () => {
  const defaultPosition = { top: 100, left: 200, width: 300, height: 50 };

  it('renders at correct position', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('100px');
    expect(div.style.left).toBe('200px');
    expect(div.style.width).toBe('300px');
    expect(div.style.height).toBe('50px');
  });

  it('renders with zero position', () => {
    const { container } = render(
      <Spotlight position={{ top: 0, left: 0, width: 0, height: 0 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('0px');
    expect(div.style.left).toBe('0px');
    expect(div.style.width).toBe('0px');
    expect(div.style.height).toBe('0px');
  });

  it('handles zero padding (pre-padded position)', () => {
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
    expect(div.style.top).toBe('-10px');
    expect(div.style.left).toBe('-20px');
  });

  it('renders with large position values', () => {
    const { container } = render(
      <Spotlight position={{ top: 5000, left: 3000, width: 100, height: 50 }} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.top).toBe('5000px');
    expect(div.style.left).toBe('3000px');
  });

  it('has correct border styling', () => {
    const { container } = render(
      <Spotlight position={defaultPosition} padding={8} />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.border).toContain('2px solid');
    expect(div.style.borderWidth).toBe('2px');
  });
});
