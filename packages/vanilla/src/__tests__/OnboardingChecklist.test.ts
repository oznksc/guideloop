import { createOnboardingChecklist } from '../core/OnboardingChecklist';

describe('createOnboardingChecklist', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('renders items and tracks completion', () => {
    const onComplete = jest.fn();
    const checklist = createOnboardingChecklist({
      items: [
        { id: 'one', title: 'Task one' },
        { id: 'two', title: 'Task two' },
      ],
      title: 'Getting Started',
      onComplete,
    });

    checklist.mount(document.body);
    expect(document.body.textContent).toContain('Getting Started');
    expect(document.body.textContent).toContain('Task one');

    expect(checklist.getProgress()).toEqual({
      completed: 0,
      total: 2,
      percentage: 0,
      completedIds: [],
    });

    checklist.completeItem('one');
    expect(checklist.getProgress().completed).toBe(1);
    expect(checklist.getProgress().completedIds).toEqual(['one']);

    checklist.completeItem('two');
    expect(checklist.getProgress().percentage).toBe(100);
    expect(onComplete).toHaveBeenCalled();

    checklist.destroy();
  });

  it('handles link actions with completeOnClick', () => {
    const checklist = createOnboardingChecklist({
      items: [
        {
          id: 'docs',
          title: 'Read docs',
          action: {
            type: 'link',
            href: '#docs',
            completeOnClick: true,
          },
        },
      ],
    });
    checklist.mount(document.body);

    const link = document.querySelector(
      'a.guideloop-onboarding__item-control'
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    link.click();

    expect(checklist.getProgress().completedIds).toContain('docs');
    checklist.destroy();
  });
});
