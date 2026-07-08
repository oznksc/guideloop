import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../../components/Tooltip';

const baseStep = {
  target: '#test',
  title: 'Test Title',
  content: 'Test Content',
};

const defaultProps = {
  step: baseStep,
  theme: 'tailwind' as const,
  onNext: jest.fn(),
  onPrev: jest.fn(),
  onClose: jest.fn(),
  isFirst: false,
  isLast: false,
  currentStep: 0,
  totalSteps: 3,
};

describe('Tooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('renders step title and content', () => {
    render(<Tooltip {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows step counter', () => {
    render(<Tooltip {...defaultProps} currentStep={1} totalSteps={5} />);
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('shows Previous button when not first step', () => {
    render(<Tooltip {...defaultProps} isFirst={false} />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('hides Previous button on first step', () => {
    render(<Tooltip {...defaultProps} isFirst={true} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('shows Next button when not last step', () => {
    render(<Tooltip {...defaultProps} isLast={false} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('hides Next button on last step', () => {
    render(<Tooltip {...defaultProps} isLast={true} />);
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('shows Finish instead of Skip on last step', () => {
    render(<Tooltip {...defaultProps} isLast={true} />);
    expect(screen.getByText('Finish')).toBeInTheDocument();
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('shows Skip when not last step', () => {
    render(<Tooltip {...defaultProps} isLast={false} />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('calls onNext when Next is clicked', () => {
    render(<Tooltip {...defaultProps} />);
    fireEvent.click(screen.getByText('Next'));
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrev when Previous is clicked', () => {
    render(<Tooltip {...defaultProps} />);
    fireEvent.click(screen.getByText('Previous'));
    expect(defaultProps.onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Skip is clicked', () => {
    render(<Tooltip {...defaultProps} />);
    fireEvent.click(screen.getByText('Skip'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom button labels', () => {
    render(
      <Tooltip
        {...defaultProps}
        defaultButtonLabels={{ next: 'Ileri', prev: 'Geri', skip: 'Atla', finish: 'Bitir' }}
      />
    );
    expect(screen.getByText('Ileri')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('uses per-step custom button labels', () => {
    const stepWithLabels = {
      ...baseStep,
      buttonLabels: { next: 'NEXT_STEP', skip: 'END' },
    };
    render(<Tooltip {...defaultProps} step={stepWithLabels} />);
    expect(screen.getByText('NEXT_STEP')).toBeInTheDocument();
  });

  it('hides Close button when showButtons.close is false', () => {
    const stepNoClose = {
      ...baseStep,
      showButtons: { close: false },
    };
    render(<Tooltip {...defaultProps} step={stepNoClose} />);
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('hides Next button when showButtons.next is false', () => {
    const stepNoNext = {
      ...baseStep,
      showButtons: { next: false },
    };
    render(<Tooltip {...defaultProps} step={stepNoNext} />);
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('hides Previous button when showButtons.previous is false', () => {
    const stepNoPrev = {
      ...baseStep,
      showButtons: { previous: false },
    };
    render(<Tooltip {...defaultProps} step={stepNoPrev} isFirst={false} />);
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('renders image content', () => {
    const stepWithImage = {
      ...baseStep,
      image: { type: 'image' as const, src: 'test.jpg', alt: 'Test Image' },
    };
    render(<Tooltip {...defaultProps} step={stepWithImage} />);
    const img = screen.getByAltText('Test Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'test.jpg');
  });

  it('renders SVG content', () => {
    const stepWithSvg = {
      ...baseStep,
      image: { type: 'svg' as const, component: <svg data-testid="custom-svg" /> },
    };
    render(<Tooltip {...defaultProps} step={stepWithSvg} />);
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
  });

  it('handles missing target element gracefully', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    render(<Tooltip {...defaultProps} />);
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('No HTMLElement found'),
      expect.any(Number)
    );
    consoleWarn.mockRestore();
  });

  it('renders custom ReactNode content', () => {
    const stepWithReactContent = {
      ...baseStep,
      content: <span data-testid="custom-content">Custom JSX</span>,
    };
    render(<Tooltip {...defaultProps} step={stepWithReactContent} />);
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('has role="tooltip" and correct aria-label', () => {
    render(<Tooltip {...defaultProps} />);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('aria-label', 'Test Title');
  });

  it('uses per-step button labels with fallback to defaults', () => {
    const stepWithPartialLabels = {
      ...baseStep,
      buttonLabels: { finish: 'Bitti' },
    };
    render(<Tooltip {...defaultProps} step={stepWithPartialLabels} isLast={true} />);
    expect(screen.getByText('Bitti')).toBeInTheDocument();
  });
});
