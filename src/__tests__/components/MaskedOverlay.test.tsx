import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MaskedOverlay } from '../../components/MaskedOverlay';

describe('MaskedOverlay', () => {
  const targetRect = { top: 100, left: 200, width: 300, height: 50 };

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders SVG mask when targetRect is provided', () => {
    const { container } = render(<MaskedOverlay targetRect={targetRect} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('mask')).toBeInTheDocument();
  });

  it('renders simple overlay when targetRect is null', () => {
    const { container } = render(<MaskedOverlay targetRect={null} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    const overlayDiv = container.firstChild as HTMLElement;
    expect(overlayDiv.className).toContain('fixed');
  });

  it('calls onClick when overlay is clicked', () => {
    const onClick = jest.fn();
    render(<MaskedOverlay targetRect={targetRect} onClick={onClick} />);
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies padding to mask rect', () => {
    const { container } = render(<MaskedOverlay targetRect={targetRect} padding={16} />);
    const maskRects = container.querySelectorAll('mask rect');
    const cutout = maskRects[1];
    expect(cutout).toBeDefined();
    expect(cutout?.getAttribute('x')).toBe('184');
    expect(cutout?.getAttribute('y')).toBe('84');
  });

  it('applies custom className', () => {
    const { container } = render(
      <MaskedOverlay targetRect={targetRect} className="custom-class" />
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('custom-class');
  });

  it('applies custom style', () => {
    const { container } = render(
      <MaskedOverlay targetRect={targetRect} style={{ zIndex: 100 }} />
    );
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.zIndex).toBe('100');
  });

  it('updates on window resize', () => {
    const { container } = render(<MaskedOverlay targetRect={targetRect} />);
    const svgBefore = container.querySelector('svg');
    expect(svgBefore?.getAttribute('width')).toBe('1024');
    expect(svgBefore?.getAttribute('height')).toBe('768');

    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const svgAfter = container.querySelector('svg');
    expect(svgAfter?.getAttribute('width')).toBe('800');
    expect(svgAfter?.getAttribute('height')).toBe('600');
  });
});
