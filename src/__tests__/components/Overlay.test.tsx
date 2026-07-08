import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Overlay } from '../../components/Overlay';

describe('Overlay', () => {
  it('renders with fixed positioning', () => {
    const { container } = render(<Overlay />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('guideloop-overlay');
    expect(overlay.style.position).toBe('fixed');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Overlay onClick={onClick} />);
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Overlay className="custom-overlay" />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('custom-overlay');
  });

  it('applies custom style', () => {
    const { container } = render(<Overlay style={{ zIndex: 100 }} />);
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.style.zIndex).toBe('100');
  });

  it('has role presentation', () => {
    render(<Overlay />);
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
});
