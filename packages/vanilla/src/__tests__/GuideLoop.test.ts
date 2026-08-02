/**
 * @guideloop/vanilla — GuideLoop integration tests
 */

import { GuideLoop } from '../core/GuideLoop';
import type { Step } from '../core/types';

function mountTargets(): void {
  document.body.innerHTML = `
    <button id="a">A</button>
    <button id="b">B</button>
    <button id="c">C</button>
  `;
}

function steps(overrides: Partial<Step>[] = []): Step[] {
  const base: Step[] = [
    { target: '#a', title: 'Step A', content: 'Content A', placement: 'bottom' },
    { target: '#b', title: 'Step B', content: 'Content B', placement: 'right' },
    { target: '#c', title: 'Step C', content: 'Content C', placement: 'top' },
  ];
  return base.map((s, i) => ({ ...s, ...overrides[i] }));
}

describe('GuideLoop', () => {
  beforeEach(() => {
    mountTargets();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts closed and opens on start()', async () => {
    const tour = new GuideLoop({ steps: steps(), debug: false });
    expect(tour.isOpen).toBe(false);

    await tour.start();
    expect(tour.isOpen).toBe(true);
    expect(tour.currentStep).toBe(0);
    expect(document.querySelector('.guideloop-tooltip')).toBeTruthy();
    expect(document.querySelector('.guideloop-tooltip')?.textContent).toContain(
      'Step A'
    );

    tour.destroy();
  });

  it('advances with next() and closes on last step finish', async () => {
    const onComplete = jest.fn();
    const onStepChange = jest.fn();
    const tour = new GuideLoop({
      steps: steps(),
      debug: false,
      onComplete,
      onStepChange,
    });

    await tour.start();
    expect(tour.currentStep).toBe(0);

    await tour.next();
    expect(tour.currentStep).toBe(1);
    expect(document.body.textContent).toContain('Step B');

    await tour.next();
    expect(tour.currentStep).toBe(2);

    await tour.next();
    expect(tour.isOpen).toBe(false);
    expect(onComplete).toHaveBeenCalled();

    tour.destroy();
  });

  it('goes back with prev()', async () => {
    const tour = new GuideLoop({ steps: steps(), debug: false });
    await tour.start();
    await tour.next();
    expect(tour.currentStep).toBe(1);

    await tour.prev();
    expect(tour.currentStep).toBe(0);
    expect(document.body.textContent).toContain('Step A');

    tour.destroy();
  });

  it('goTo jumps to a step', async () => {
    const tour = new GuideLoop({ steps: steps(), debug: false });
    await tour.start();
    await tour.goTo(2);
    expect(tour.currentStep).toBe(2);
    expect(document.body.textContent).toContain('Step C');
    tour.destroy();
  });

  it('close() fires onClose and removes portal UI', async () => {
    const onClose = jest.fn();
    const tour = new GuideLoop({ steps: steps(), debug: false, onClose });
    await tour.start();
    expect(document.getElementById('guideloop-portal')).toBeTruthy();

    tour.close();
    expect(tour.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalled();
    expect(document.querySelector('.guideloop-tooltip')).toBeNull();

    tour.destroy();
  });

  it('skip() fires onSkip when not on last step', async () => {
    const onSkip = jest.fn();
    const onClose = jest.fn();
    const tour = new GuideLoop({
      steps: steps(),
      debug: false,
      onSkip,
      onClose,
    });
    await tour.start();
    tour.skip();
    expect(onSkip).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
    expect(tour.isOpen).toBe(false);
    tour.destroy();
  });

  it('runs beforeStep / afterStep lifecycle hooks', async () => {
    const before = jest.fn();
    const after = jest.fn();
    const tour = new GuideLoop({
      steps: steps([
        { beforeStep: before, afterStep: after },
        { beforeStep: before },
      ]),
      debug: false,
    });

    await tour.start();
    expect(before).toHaveBeenCalledTimes(1);

    await tour.next();
    expect(after).toHaveBeenCalledTimes(1);
    expect(before).toHaveBeenCalledTimes(2);

    tour.destroy();
  });

  it('supports HTMLElement step content', async () => {
    const el = document.createElement('div');
    el.textContent = 'Rich content';
    el.id = 'rich';

    const tour = new GuideLoop({
      steps: [{ target: '#a', title: 'Rich', content: el }],
      debug: false,
    });
    await tour.start();

    expect(document.getElementById('rich')).toBeTruthy();
    expect(document.body.textContent).toContain('Rich content');
    tour.destroy();
  });

  it('respects condition() when filtering steps', async () => {
    const tour = new GuideLoop({
      steps: [
        { target: '#a', title: 'A', content: 'A' },
        {
          target: '#b',
          title: 'Hidden',
          content: 'nope',
          condition: () => false,
        },
        { target: '#c', title: 'C', content: 'C' },
      ],
      debug: false,
    });
    await tour.start();
    expect(tour.currentStep).toBe(0);
    await tour.next();
    expect(document.body.textContent).toContain('C');
    expect(document.body.textContent).not.toContain('Hidden');
    tour.destroy();
  });

  it('persists active step when persist is configured', async () => {
    const key = 'gl-test-persist';
    localStorage.clear();

    const tour = new GuideLoop({
      steps: steps(),
      debug: false,
      persist: { key, type: 'localStorage' },
    });
    await tour.start();
    await tour.next();
    expect(tour.currentStep).toBe(1);

    const raw = localStorage.getItem(`guideloop_${key}`);
    expect(raw).toBeTruthy();
    expect(raw).toContain('"currentStepIndex":1');
    expect(raw).toContain('"isActive":true');

    tour.destroy();
    localStorage.clear();
  });

  it('waitForTarget skips waiting when target already exists', async () => {
    document.body.innerHTML = `<button id="ready">R</button>`;
    const tour = new GuideLoop({
      steps: [
        {
          target: '#ready',
          title: 'Ready',
          content: 'ok',
          waitForTarget: true,
        },
      ],
      debug: false,
    });
    await tour.start();
    expect(document.body.textContent).toContain('Ready');
    expect(document.body.textContent).not.toContain('Waiting for target');
    tour.destroy();
  });

  it('waitForTarget shows waiting UI when target is missing', async () => {
    document.body.innerHTML = `<button id="a">A</button>`;
    const tour = new GuideLoop({
      steps: [
        {
          target: '#late',
          title: 'Late',
          content: 'appeared',
          waitForTarget: { timeout: 50 },
        },
      ],
      debug: false,
    });

    await tour.start();
    expect(document.body.textContent).toContain('Waiting for target element');
    tour.destroy();
  });

  it('keyboard Escape skips the tour', async () => {
    const onSkip = jest.fn();
    const tour = new GuideLoop({
      steps: steps(),
      debug: false,
      keyboard: true,
      onSkip,
    });
    await tour.start();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onSkip).toHaveBeenCalled();
    expect(tour.isOpen).toBe(false);
    tour.destroy();
  });

  it('destroy cleans up completely', async () => {
    const tour = new GuideLoop({ steps: steps(), debug: false });
    await tour.start();
    tour.destroy();
    expect(tour.isOpen).toBe(false);
    expect(document.querySelector('.guideloop-tooltip')).toBeNull();
  });

  it('tooltip next button advances the tour', async () => {
    const tour = new GuideLoop({ steps: steps(), debug: false });
    await tour.start();

    const nextBtn = document.querySelector(
      '[data-guideloop-action="next"]'
    ) as HTMLButtonElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();

    await Promise.resolve();
    await Promise.resolve();
    expect(tour.currentStep).toBe(1);
    tour.destroy();
  });
});
