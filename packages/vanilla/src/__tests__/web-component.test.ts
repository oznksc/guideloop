import { registerElements } from '../web-component';

describe('<guide-loop> web component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="btn">Click</button>
      <button id="other">Other</button>
    `;
    registerElements();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('registers guide-loop and onboarding-checklist', () => {
    expect(customElements.get('guide-loop')).toBeTruthy();
    expect(customElements.get('onboarding-checklist')).toBeTruthy();
  });

  it('opens tour via open() method', async () => {
    const el = document.createElement('guide-loop') as HTMLElement & {
      open: () => void;
      close: () => void;
      tour: { isOpen: boolean; currentStep: number } | null;
    };
    el.setAttribute(
      'steps',
      JSON.stringify([
        { target: '#btn', title: 'WC Title', content: 'WC content' },
        { target: '#other', title: 'Two', content: 'Second' },
      ])
    );
    el.setAttribute('theme', 'tailwind');
    el.setAttribute('debug', 'false');
    document.body.appendChild(el);

    el.open();
    // start is async (enterStep) — wait for microtasks + macrotasks
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(el.tour?.isOpen).toBe(true);
    expect(document.body.textContent).toContain('WC Title');

    el.close();
    expect(el.tour).toBeNull();
  });

  it('dispatches complete event', async () => {
    const el = document.createElement('guide-loop') as HTMLElement & {
      open: () => void;
      next: () => Promise<void> | void;
      tour: { isOpen: boolean } | null;
    };
    el.setAttribute(
      'steps',
      JSON.stringify([{ target: '#btn', title: 'Only', content: 'One' }])
    );
    el.setAttribute('debug', 'false');
    document.body.appendChild(el);

    const complete = jest.fn();
    el.addEventListener('complete', complete);

    el.open();
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    await el.next();
    expect(complete).toHaveBeenCalled();
  });
});
