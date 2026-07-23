import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GuideLoop from '../components/GuideLoop';

jest.mock('@popperjs/core', () => ({
  createPopper: () => ({
    state: {},
    destroy: jest.fn(),
    forceUpdate: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    setOptions: jest.fn(),
  }),
}));

const STORAGE_PREFIX = 'guideloop_';

describe('GuideLoop', () => {
  const mockSteps = [
    { target: '#step1', title: 'Step 1', content: 'Content 1' },
    { target: '#step2', title: 'Step 2', content: 'Content 2' },
    { target: '#step3', title: 'Step 3', content: 'Content 3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    const portalRoot = document.createElement('div');
    portalRoot.id = 'guideloop-portal';
    document.body.appendChild(portalRoot);
  });

  it('renders nothing when isOpen is false', () => {
    render(<GuideLoop steps={mockSteps} isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders first step content', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('shows overlay by default', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('renders progress indicator', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('calls onClose when skip is clicked', async () => {
    const onClose = jest.fn();
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={onClose} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Skip'));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onStepChange when navigating next', async () => {
    const onStepChange = jest.fn();
    render(
      <GuideLoop
        steps={mockSteps}
        isOpen={true}
        onClose={jest.fn()}
        onStepChange={onStepChange}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });
    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith(1);
    });
  });

  it('calls onStepChange when a step action advances the tour', async () => {
    const onStepChange = jest.fn();
    const nextButtonOnClick = jest.fn();
    const stepsWithAction = [
      {
        ...mockSteps[0],
        nextButtonOnClick,
      },
      mockSteps[1],
    ];

    render(
      <GuideLoop
        steps={stepsWithAction}
        isOpen={true}
        onClose={jest.fn()}
        onStepChange={onStepChange}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => {
      expect(nextButtonOnClick).toHaveBeenCalledTimes(1);
      expect(onStepChange).toHaveBeenCalledWith(1);
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  it('navigates to next step content', async () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  it('navigates back with Previous button', async () => {
    render(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} initialStep={1} />
    );
    expect(screen.getByText('Step 2')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Previous'));
    });

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  it('calls onClose on Finish button for single-step tour', async () => {
    const onClose = jest.fn();
    render(
      <GuideLoop
        steps={[{ target: '#s1', title: 'S1', content: 'C1' }]}
        isOpen={true}
        onClose={onClose}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Finish'));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom zIndex', () => {
    render(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} zIndex={5000} />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.zIndex).toBe('5000');
  });

  it('uses custom initial step', () => {
    render(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} initialStep={1} />
    );
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('blocks body scroll when open', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<GuideLoop steps={mockSteps} isOpen={false} onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('sets aria-modal on dialog', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders portal container in the DOM', () => {
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} />);
    expect(document.getElementById('guideloop-portal')).toBeInTheDocument();
  });

  it('renders with different themes without error', () => {
    const { rerender } = render(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} theme="tailwind" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} theme="material" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <GuideLoop steps={mockSteps} isOpen={true} onClose={jest.fn()} theme="antd" />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters out steps with false conditions', () => {
    const stepsWithCondition = [
      { target: '#s1', title: 'Visible', content: 'C1' },
      { target: '#s2', title: 'Hidden', content: 'C2', condition: () => false },
      { target: '#s3', title: 'Step 3', content: 'C3' },
    ];
    render(
      <GuideLoop steps={stepsWithCondition} isOpen={true} onClose={jest.fn()} />
    );
    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('supports keyboard Escape to close', async () => {
    const onClose = jest.fn();
    render(<GuideLoop steps={mockSteps} isOpen={true} onClose={onClose} />);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('saves tour state on step navigation', async () => {
      render(
        <GuideLoop
          steps={mockSteps}
          isOpen={true}
          onClose={jest.fn()}
          persist={{ key: 'test-step-save' }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}test-step-save`);
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.currentStepIndex).toBe(1);
        expect(parsed.isActive).toBe(true);
      });
    });

    it('saves inactive state on close', async () => {
      const onClose = jest.fn();
      render(
        <GuideLoop
          steps={mockSteps}
          isOpen={true}
          onClose={onClose}
          persist={{ key: 'test-close' }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Skip'));
      });

      await waitFor(() => {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}test-close`);
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.currentStepIndex).toBe(0);
        expect(parsed.isActive).toBe(false);
      });
    });

    it('clears tour state on completion', async () => {
      const singleStep = [{ target: '#s1', title: 'S1', content: 'C1' }];
      render(
        <GuideLoop
          steps={singleStep}
          isOpen={true}
          onClose={jest.fn()}
          persist={{ key: 'test-complete' }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Finish'));
      });

      await waitFor(() => {
        expect(localStorage.getItem(`${STORAGE_PREFIX}test-complete`)).toBeNull();
      });
    });

    it('uses sessionStorage when configured', async () => {
      render(
        <GuideLoop
          steps={mockSteps}
          isOpen={true}
          onClose={jest.fn()}
          persist={{ key: 'test-session', type: 'sessionStorage' }}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const saved = sessionStorage.getItem(`${STORAGE_PREFIX}test-session`);
        expect(saved).not.toBeNull();
      });
    });
  });

  describe('trigger', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const portalRoot = document.createElement('div');
      portalRoot.id = 'guideloop-portal';
      document.body.appendChild(portalRoot);
    });

    it('advances step on trigger click event', async () => {
      const target = document.createElement('button');
      target.id = 'trigger-btn';
      target.textContent = 'Trigger';
      document.body.appendChild(target);

      const steps = [
        { target: '#trigger-btn', title: 'Step 1', content: 'Click the button', trigger: 'click' as const },
        { target: '#step2', title: 'Step 2', content: 'Done' },
      ];

      render(
        <GuideLoop steps={steps} isOpen={true} onClose={jest.fn()} />
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();

      await act(async () => {
        target.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
    });
  });

  describe('waitForTarget', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      const portalRoot = document.createElement('div');
      portalRoot.id = 'guideloop-portal';
      document.body.appendChild(portalRoot);
    });

    it('renders when target exists immediately', () => {
      const target = document.createElement('div');
      target.id = 'existing-target';
      document.body.appendChild(target);

      render(
        <GuideLoop
          steps={[{ target: '#existing-target', title: 'T', content: 'C', waitForTarget: true }]}
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText('T')).toBeInTheDocument();
    });
  });
});
