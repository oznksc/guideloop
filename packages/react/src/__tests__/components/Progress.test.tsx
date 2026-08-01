import React from 'react';
import { render } from '@testing-library/react';
import { Progress } from '../../components/Progress';

function getDotContainer(container: HTMLElement) {
  const outer = container.firstChild as HTMLElement;
  const inner = outer?.firstChild as HTMLElement;
  return inner?.firstChild as HTMLElement;
}

describe('Progress', () => {
  it('renders correct number of dots', () => {
    const { container } = render(<Progress current={1} total={5} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(5);
  });

  it('fills correct dots based on current step', () => {
    const { container } = render(<Progress current={3} total={5} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(5);
    for (let i = 0; i < 3; i++) {
      expect((dots[i] as HTMLElement).style.backgroundColor).toBe('rgb(37, 99, 235)');
    }
    for (let i = 3; i < 5; i++) {
      expect((dots[i] as HTMLElement).style.backgroundColor).toBe('rgb(75, 85, 99)');
    }
  });

  it('fills all dots when current equals total', () => {
    const { container } = render(<Progress current={5} total={5} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    Array.from(dots).forEach(dot => {
      expect((dot as HTMLElement).style.backgroundColor).toBe('rgb(37, 99, 235)');
    });
  });

  it('renders 0 dots when total is 0', () => {
    const { container } = render(<Progress current={0} total={0} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(0);
  });

  it('handles single step', () => {
    const { container } = render(<Progress current={1} total={1} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(1);
    expect((dots[0] as HTMLElement).style.backgroundColor).toBe('rgb(37, 99, 235)');
  });

  it('applies custom style', () => {
    const { container } = render(<Progress current={1} total={3} theme="tailwind" style={{ color: 'red' }} />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.color).toBe('red');
  });

  it('handles current > total gracefully', () => {
    const { container } = render(<Progress current={10} total={3} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    for (let i = 0; i < 3; i++) {
      expect((dots[i] as HTMLElement).style.backgroundColor).toBe('rgb(37, 99, 235)');
    }
  });

  it('handles negative current value', () => {
    const { container } = render(<Progress current={-1} total={3} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    for (let i = 0; i < 3; i++) {
      expect((dots[i] as HTMLElement).style.backgroundColor).not.toBe('rgb(37, 99, 235)');
    }
  });

  it('renders with different themes', () => {
    const { rerender, container } = render(<Progress current={1} total={3} theme="tailwind" />);
    const dotContainer = getDotContainer(container);
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(3);

    rerender(<Progress current={1} total={3} theme="material" />);
    const dotContainer2 = getDotContainer(container);
    const dots2 = dotContainer2?.children || [];
    expect(dots2.length).toBe(3);

    rerender(<Progress current={1} total={3} theme="antd" />);
    const dotContainer3 = getDotContainer(container);
    const dots3 = dotContainer3?.children || [];
    expect(dots3.length).toBe(3);
  });
});
