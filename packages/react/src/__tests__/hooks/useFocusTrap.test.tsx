import React, { useRef } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const TrapHarness: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap({ enabled, containerRef, focusKey: enabled ? 'on' : 'off' });

  if (!enabled) {
    return <button type="button">Outside</button>;
  }

  return (
    <div ref={containerRef} tabIndex={-1} data-testid="trap">
      <button type="button" data-guideloop-action="next">
        Next
      </button>
      <button type="button" data-guideloop-action="close">
        Skip
      </button>
    </div>
  );
};

describe('useFocusTrap', () => {
  it('focuses the preferred next control when enabled', async () => {
    render(<TrapHarness enabled={true} />);
    const next = screen.getByRole('button', { name: 'Next' });
    await waitFor(() => expect(next).toHaveFocus());
  });

  it('wraps Tab from the last control back to the first', async () => {
    render(<TrapHarness enabled={true} />);
    const next = screen.getByRole('button', { name: 'Next' });
    const skip = screen.getByRole('button', { name: 'Skip' });

    await waitFor(() => expect(next).toHaveFocus());

    // jsdom does not move focus on Tab; place focus on the last control then wrap.
    skip.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(next).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(skip).toHaveFocus();
  });

  it('pulls focus back when Tab is pressed outside the container', async () => {
    render(
      <>
        <button type="button">Background</button>
        <TrapHarness enabled={true} />
      </>
    );

    const next = screen.getByRole('button', { name: 'Next' });
    const background = screen.getByRole('button', { name: 'Background' });

    await waitFor(() => expect(next).toHaveFocus());

    background.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    // Outside focus + Tab should land on first control (not shift) → Next
    expect(next).toHaveFocus();
  });

  it('restores focus to the opener when disabled', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Opener';
    document.body.appendChild(opener);
    opener.focus();

    const { rerender } = render(<TrapHarness enabled={true} />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    );

    await act(async () => {
      rerender(<TrapHarness enabled={false} />);
    });

    await waitFor(() => expect(opener).toHaveFocus());
    opener.remove();
  });
});
