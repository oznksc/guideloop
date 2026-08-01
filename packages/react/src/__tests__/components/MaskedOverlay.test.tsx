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

  it('renders a circle cutout when shape is circle', () => {
    const { container } = render(
      <MaskedOverlay targetRect={targetRect} shape="circle" />
    );
    const circle = container.querySelector('mask circle');
    expect(circle).toBeInTheDocument();
    expect(circle?.getAttribute('cx')).toBe('350');
    expect(circle?.getAttribute('cy')).toBe('125');
    expect(circle?.getAttribute('r')).toBe('150');
  });

  it('renders an ellipse cutout when shape is ellipse', () => {
    const { container } = render(
      <MaskedOverlay targetRect={targetRect} shape="ellipse" />
    );
    const ellipse = container.querySelector('mask ellipse');
    expect(ellipse).toBeInTheDocument();
    expect(ellipse?.getAttribute('rx')).toBe('150');
    expect(ellipse?.getAttribute('ry')).toBe('25');
  });

  it('renders multiple cutouts for multi-spotlight targets', () => {
    const { container } = render(
      <MaskedOverlay
        targets={[
          { top: 10, left: 20, width: 40, height: 30, shape: 'rect' },
          { top: 100, left: 200, width: 50, height: 50, shape: 'circle' },
        ]}
      />
    );
    expect(container.querySelectorAll('mask rect').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('mask circle')).toBeInTheDocument();
  });

  it('renders polygon cutout from normalized points', () => {
    const { container } = render(
      <MaskedOverlay
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
    const polygon = container.querySelector('mask polygon');
    expect(polygon).toBeInTheDocument();
    expect(polygon?.getAttribute('points')).toBe('50,0 100,100 0,100');
  });

  it('prefers targets over targetRect when both are provided', () => {
    const { container } = render(
      <MaskedOverlay
        targetRect={targetRect}
        targets={[{ top: 1, left: 2, width: 10, height: 10, shape: 'rect' }]}
      />
    );
    const maskRects = container.querySelectorAll('mask rect');
    const cutout = maskRects[1];
    expect(cutout?.getAttribute('x')).toBe('2');
    expect(cutout?.getAttribute('y')).toBe('1');
  });
});
