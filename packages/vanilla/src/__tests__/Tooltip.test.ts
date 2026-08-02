import { createTooltip } from '../components/Tooltip';

describe('createTooltip', () => {
  beforeEach(() => {
    document.body.innerHTML = `<button id="t">Target</button>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders title, content, and step counter', () => {
    const onNext = jest.fn();
    const onPrev = jest.fn();
    const onClose = jest.fn();

    const tooltip = createTooltip({
      step: {
        target: '#t',
        title: 'Hello',
        content: 'World',
        placement: 'bottom',
      },
      theme: 'tailwind',
      currentStep: 0,
      totalSteps: 3,
      isFirst: true,
      isLast: false,
      onNext,
      onPrev,
      onClose,
    });

    tooltip.mount(document.body);
    expect(document.body.textContent).toContain('Hello');
    expect(document.body.textContent).toContain('World');
    expect(document.body.textContent).toContain('Step 1 of 3');

    const next = document.querySelector(
      '[data-guideloop-action="next"]'
    ) as HTMLButtonElement;
    next.click();
    expect(onNext).toHaveBeenCalled();

    tooltip.destroy();
  });

  it('shows Finish label on last step', () => {
    const tooltip = createTooltip({
      step: { target: '#t', title: 'Last', content: 'Done' },
      theme: 'material',
      currentStep: 2,
      totalSteps: 3,
      isFirst: false,
      isLast: true,
      onNext: jest.fn(),
      onPrev: jest.fn(),
      onClose: jest.fn(),
    });
    tooltip.mount(document.body);
    const next = document.querySelector(
      '[data-guideloop-action="next"]'
    ) as HTMLButtonElement;
    expect(next.textContent).toBe('Finish');
    tooltip.destroy();
  });
});
