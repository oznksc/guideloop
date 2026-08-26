import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { GuideLoop, refreshTargets, GUIDE_REFRESH_EVENT } from '../../index';
import type { Step } from '../../components/GuideLoop/types';

function mockRect(el: HTMLElement, rect: Partial<DOMRect> = {}) {
  el.getBoundingClientRect = jest.fn(
    () =>
      ({
        top: 10,
        left: 20,
        width: 100,
        height: 40,
        bottom: 50,
        right: 120,
        x: 20,
        y: 10,
        toJSON: jest.fn(),
        ...rect,
      }) as DOMRect
  );
}

function mountTarget(id: string, rect?: Partial<DOMRect>): HTMLElement {
  const el = document.createElement('div');
  el.id = id;
  mockRect(el, rect);
  document.body.appendChild(el);
  return el;
}

const steps: Step[] = [
  { target: '#tour-anchor', title: 'Step one', content: 'Hello' },
  { target: '#tour-next', title: 'Step two', content: 'World' },
];

describe('GuideLoop', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  beforeEach(() => {
    document.body.innerHTML = '';
    warn.mockClear();
  });

  afterAll(() => {
    warn.mockRestore();
  });

  it('renders no tour UI when closed', async () => {
    mountTarget('tour-anchor');
    render(
      <GuideLoop steps={steps} isOpen={false} onClose={jest.fn()} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders without throwing when the primary target exists', async () => {
    mountTarget('tour-anchor');
    render(
      <GuideLoop steps={[steps[0]]} isOpen onClose={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Step one');
    });
  });

  it('handles a missing primary target without crashing', async () => {
    const onTargetMissing = jest.fn();
    const onClose = jest.fn();

    render(
      <GuideLoop
        steps={[
          {
            target: '#tour-canvas-tour-anchor',
            title: 'Missing',
            content: 'Still shown',
          },
        ]}
        isOpen
        onClose={onClose}
        onTargetMissing={onTargetMissing}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Missing');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => {
      expect(onTargetMissing).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: '#tour-canvas-tour-anchor',
          role: 'primary',
          stepIndex: 0,
        })
      );
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores a missing additionalTargets selector', async () => {
    mountTarget('tour-anchor');
    const onTargetMissing = jest.fn();

    render(
      <GuideLoop
        steps={[
          {
            target: '#tour-anchor',
            title: 'Multi',
            content: 'Extras optional',
            additionalTargets: ['#gone-extra'],
          },
        ]}
        isOpen
        onClose={jest.fn()}
        onTargetMissing={onTargetMissing}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Multi');
    });
    await waitFor(() => {
      expect(onTargetMissing).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: '#gone-extra',
          role: 'additional',
        })
      );
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Skip fires onSkip and onClose("skip"), not onComplete', async () => {
    mountTarget('tour-anchor');
    const onSkip = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();

    render(
      <GuideLoop
        steps={steps}
        isOpen
        onClose={onClose}
        onSkip={onSkip}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Skip')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Skip'));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('skip');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('overlay click fires onClose("close"), not onSkip', async () => {
    mountTarget('tour-anchor');
    const onSkip = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();

    render(
      <GuideLoop
        steps={steps}
        isOpen
        onClose={onClose}
        onSkip={onSkip}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('presentation'));

    expect(onClose).toHaveBeenCalledWith('close');
    expect(onSkip).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('Finish on the last step fires onComplete and onClose("complete")', async () => {
    mountTarget('tour-anchor');
    const onSkip = jest.fn();
    const onClose = jest.fn();
    const onComplete = jest.fn();

    render(
      <GuideLoop
        steps={[steps[0]]}
        isOpen
        onClose={onClose}
        onSkip={onSkip}
        onComplete={onComplete}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Finish'));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('complete');
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('Escape dismisses with onClose("close")', async () => {
    mountTarget('tour-anchor');
    const onSkip = jest.fn();
    const onClose = jest.fn();

    render(
      <GuideLoop
        steps={steps}
        isOpen
        keyboard
        onClose={onClose}
        onSkip={onSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(onClose).toHaveBeenCalledWith('close');
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('mounts into a custom portalContainer', async () => {
    mountTarget('tour-anchor');
    const host = document.createElement('div');
    host.id = 'webview-layer';
    document.body.appendChild(host);

    render(
      <GuideLoop
        steps={[steps[0]]}
        isOpen
        onClose={jest.fn()}
        portalContainer={host}
      />
    );

    await waitFor(() => {
      expect(host.querySelector('.guideloop-tooltip')).toBeTruthy();
    });
    expect(document.getElementById('guideloop-portal')).toBeNull();
  });

  it('refreshTargets dispatches GUIDE_REFRESH_EVENT', () => {
    const handler = jest.fn();
    window.addEventListener(GUIDE_REFRESH_EVENT, handler);
    refreshTargets();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(GUIDE_REFRESH_EVENT, handler);
  });
});
