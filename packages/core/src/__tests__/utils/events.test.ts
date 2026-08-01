import { createRestartEvent, GUIDE_RESTART_EVENT, RESTART_DELAY } from '../../dom/events';

describe('events', () => {
  it('exports GUIDE_RESTART_EVENT constant', () => {
    expect(GUIDE_RESTART_EVENT).toBe('guideRestart');
  });

  it('exports RESTART_DELAY constant', () => {
    expect(RESTART_DELAY).toBe(100);
  });

  it('creates a CustomEvent with correct type', () => {
    const event = createRestartEvent(3);
    expect(event.type).toBe('guideRestart');
    expect(event.detail).toEqual({ nextStep: 3 });
  });

  it('created event can be dispatched and listened to', () => {
    const handler = jest.fn();
    document.addEventListener('guideRestart', handler);

    const event = createRestartEvent(5);
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { nextStep: 5 },
      })
    );
  });

  it('creates event with different step values', () => {
    const event0 = createRestartEvent(0);
    expect(event0.detail.nextStep).toBe(0);

    const eventNeg = createRestartEvent(-1);
    expect(eventNeg.detail.nextStep).toBe(-1);
  });
});
