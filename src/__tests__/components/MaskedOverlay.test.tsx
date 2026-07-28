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
    expect(overlayDiv).toBeInTheDocument();
    expect(overlayDiv.style.position).toBe('fixed');
    expect(overlayDiv.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('calls onClick when overlay is clicked', () => {
    const onClick = jest.fn();
    render(<MaskedOverlay targetRect={targetRect} onClick={onClick} />);
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders cutout rect with correct coordinates from targetRect', () => {
    const { container } = render(<MaskedOverlay targetRect={targetRect} />);
    const maskRects = container.querySelectorAll('mask rect');
    const cutout = maskRects[1];
    expect(cutout).toBeDefined();
    expect(cutout?.getAttribute('x')).toBe('200');
    expect(cutout?.getAttribute('y')).toBe('100');
    expect(cutout?.getAttribute('width')).toBe('300');
    expect(cutout?.getAttribute('height')).toBe('50');
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

  it('renders empty mask when targetRect has 0 dimensions', () => {
    const emptyRect = { top: 0, left: 0, width: 0, height: 0 };
    const { container } = render(<MaskedOverlay targetRect={emptyRect} />);
    const overlayDiv = container.firstChild as HTMLElement;
    expect(overlayDiv.style.backgroundColor).toBe('rgba(0, 0, 0, 0.5)');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders SVG with correct viewport dimensions', () => {
    const { container } = render(<MaskedOverlay targetRect={targetRect} />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('1024');
    expect(svg?.getAttribute('height')).toBe('768');
  });

  it('does not re-render when targetRect reference changes but values are same', () => {
    const { rerender, container } = render(
      <MaskedOverlay targetRect={{ top: 100, left: 200, width: 300, height: 50 }} />
    );
    const svg1 = container.querySelector('svg');
    rerender(<MaskedOverlay targetRect={{ top: 100, left: 200, width: 300, height: 50 }} />);
    const svg2 = container.querySelector('svg');
    expect(svg1).toBe(svg2);
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
