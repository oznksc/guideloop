import React from 'react';
import { render } from '@testing-library/react';
import { Progress } from '../../components/Progress';

describe('Progress', () => {
  it('renders correct number of dots', () => {
    const { container } = render(<Progress current={1} total={5} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dotContainer = outer.querySelector('[class*="flex"]');
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(5);
  });

  it('fills correct dots based on current step', () => {
    const { container } = render(<Progress current={3} total={5} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dotContainer = outer.querySelector('[class*="flex"]');
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(5);
    for (let i = 0; i < 3; i++) {
      expect(dots[i].className).toContain('bg-blue-600');
    }
    for (let i = 3; i < 5; i++) {
      expect(dots[i].className).toContain('bg-gray-200');
    }
  });

  it('fills all dots when current equals total', () => {
    const { container } = render(<Progress current={5} total={5} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dotContainer = outer.querySelector('[class*="flex"]');
    const dots = dotContainer?.children || [];
    Array.from(dots).forEach(dot => {
      expect(dot.className).toContain('bg-blue-600');
    });
  });

  it('renders 0 dots when total is 0', () => {
    const { container } = render(<Progress current={0} total={0} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dotContainer = outer.querySelector('[class*="flex"]');
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(0);
  });

  it('handles single step', () => {
    const { container } = render(<Progress current={1} total={1} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dotContainer = outer.querySelector('[class*="flex"]');
    const dots = dotContainer?.children || [];
    expect(dots.length).toBe(1);
    expect(dots[0].className).toContain('bg-blue-600');
  });

  it('applies custom style', () => {
    const { container } = render(<Progress current={1} total={3} theme="tailwind" style={{ color: 'red' }} />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.style.color).toBe('red');
  });

  it('renders with different themes', () => {
    const { rerender, container } = render(<Progress current={1} total={3} theme="tailwind" />);
    const outer = container.firstChild as HTMLElement;
    const dots = outer.querySelector('[class*="flex"]')?.children || [];
    expect(dots.length).toBe(3);

    rerender(<Progress current={1} total={3} theme="material" />);
    const outer2 = container.firstChild as HTMLElement;
    const dots2 = outer2.querySelector('[class*="flex"]')?.children || [];
    expect(dots2.length).toBe(3);

    rerender(<Progress current={1} total={3} theme="antd" />);
    const outer3 = container.firstChild as HTMLElement;
    const dots3 = outer3.querySelector('[class*="flex"]')?.children || [];
    expect(dots3.length).toBe(3);
  });
});
