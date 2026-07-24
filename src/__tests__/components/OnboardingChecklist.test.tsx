import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OnboardingChecklist } from '../../components/OnboardingChecklist';
import type {
  OnboardingActionContext,
  OnboardingItem,
} from '../../components/OnboardingChecklist';
import {
  loadOnboardingState,
  saveOnboardingState,
} from '../../utils/onboardingState';

jest.mock('../../components/GuideLoop', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');

  return {
    __esModule: true,
    GuideLoop: ({
      onClose,
      onComplete,
      onSkip,
    }: {
      onClose: () => void;
      onComplete?: () => void;
      onSkip?: () => void;
    }) => ReactModule.createElement(
      'div',
      { role: 'dialog', 'aria-label': 'Mock guided tour' },
      ReactModule.createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            onSkip?.();
            onClose();
          },
        },
        'Skip tour'
      ),
      ReactModule.createElement(
        'button',
        {
          type: 'button',
          onClick: () => {
            onComplete?.();
            onClose();
          },
        },
        'Finish tour'
      )
    ),
  };
});

const baseItems: OnboardingItem[] = [
  {
    id: 'profile',
    title: 'Create your profile',
    description: 'Add your name and photo.',
  },
  {
    id: 'security',
    title: 'Secure your account',
    description: 'Enable two-factor authentication.',
  },
];

describe('OnboardingChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('renders accessible progress and preserves it while collapsing', () => {
    render(
      <OnboardingChecklist
        items={baseItems}
        defaultCompletedIds={['profile']}
      />
    );

    expect(
      screen.getByRole('region', { name: 'Getting started checklist' })
    ).toBeInTheDocument();
    expect(screen.getByText('1/2 steps completed')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(
      screen.getByRole('button', { name: /Create your profile/ })
    ).toHaveAttribute('data-state', 'success');

    fireEvent.click(screen.getByRole('button', { name: 'Collapse checklist' }));

    expect(
      screen.queryByRole('button', { name: /Create your profile/ })
    ).not.toBeInTheDocument();
    expect(screen.getByText('1/2 steps completed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Expand checklist' })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('updates uncontrolled progress and emits completion once', async () => {
    const onCompletedIdsChange = jest.fn();
    const onProgressChange = jest.fn();
    const onComplete = jest.fn();

    render(
      <OnboardingChecklist
        items={[baseItems[0]]}
        onCompletedIdsChange={onCompletedIdsChange}
        onProgressChange={onProgressChange}
        onComplete={onComplete}
      />
    );

    const itemButton = screen.getByRole('button', {
      name: /Create your profile/,
    });
    fireEvent.click(itemButton);

    await waitFor(() => {
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(onCompletedIdsChange).toHaveBeenCalledWith(['profile']);
    expect(onProgressChange).toHaveBeenLastCalledWith({
      completed: 1,
      total: 1,
      percentage: 100,
      completedIds: ['profile'],
    });

    fireEvent.click(itemButton);
    expect(onCompletedIdsChange).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps completedIds controlled and mirrors the canonical prop to storage', async () => {
    saveOnboardingState('controlled', ['stale']);
    const onCompletedIdsChange = jest.fn();

    const { rerender } = render(
      <OnboardingChecklist
        items={[baseItems[0]]}
        completedIds={[]}
        onCompletedIdsChange={onCompletedIdsChange}
        persist={{ key: 'controlled' }}
      />
    );

    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();
    await waitFor(() => {
      expect(loadOnboardingState('controlled')?.completedIds).toEqual([]);
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Create your profile/ })
    );

    expect(onCompletedIdsChange).toHaveBeenCalledWith(['profile']);
    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();
    expect(loadOnboardingState('controlled')?.completedIds).toEqual([]);

    fireEvent.click(
      screen.getByRole('button', { name: /Create your profile/ })
    );
    expect(onCompletedIdsChange).toHaveBeenCalledTimes(2);

    rerender(
      <OnboardingChecklist
        items={[baseItems[0]]}
        completedIds={['profile']}
        onCompletedIdsChange={onCompletedIdsChange}
        persist={{ key: 'controlled' }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
      expect(loadOnboardingState('controlled')?.completedIds).toEqual([
        'profile',
      ]);
    });
  });

  it('hydrates uncontrolled progress, filters unknown ids, and restores updates', async () => {
    saveOnboardingState('restore', ['profile', 'removed']);

    const firstRender = render(
      <OnboardingChecklist
        items={baseItems}
        defaultCompletedIds={['security']}
        persist={{ key: 'restore' }}
      />
    );

    expect(screen.getByText('1/2 steps completed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create your profile/ })
    ).toHaveAttribute('data-state', 'success');
    expect(
      screen.getByRole('button', { name: /Secure your account/ })
    ).toHaveAttribute('data-state', 'default');

    fireEvent.click(
      screen.getByRole('button', { name: /Secure your account/ })
    );
    await waitFor(() => {
      expect(loadOnboardingState('restore')?.completedIds).toEqual([
        'profile',
        'security',
      ]);
    });

    firstRender.unmount();
    render(
      <OnboardingChecklist
        items={baseItems}
        persist={{ key: 'restore' }}
      />
    );

    expect(screen.getByText('2/2 steps completed')).toBeInTheDocument();
  });

  it('completes a modal item only through its primary action by default', async () => {
    const items: OnboardingItem[] = [
      {
        id: 'welcome',
        title: 'Read the welcome guide',
        action: {
          type: 'modal',
          title: 'Welcome',
          content: 'Everything you need to get started.',
          primaryLabel: 'Got it',
          secondaryLabel: 'Later',
        },
      },
    ];

    render(<OnboardingChecklist items={items} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Read the welcome guide/ })
    );
    expect(screen.getByRole('dialog', { name: 'Welcome' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Read the welcome guide/ })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
    });
  });

  it('clears a modal action error after a successful retry', async () => {
    const onPrimary = jest
      .fn()
      .mockRejectedValueOnce(new Error('Name is required'))
      .mockResolvedValueOnce(undefined);
    const items: OnboardingItem[] = [
      {
        id: 'milestone',
        title: 'Create a milestone',
        action: {
          type: 'modal',
          content: 'Milestone form',
          primaryLabel: 'Create',
          onPrimary,
        },
      },
    ];

    render(<OnboardingChecklist items={items} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Create a milestone/ })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong. Please try again.'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Create a milestone/ })
    ).toHaveAttribute('data-state', 'success');
    expect(
      screen.queryByText('Something went wrong. Please try again.')
    ).not.toBeInTheDocument();
  });

  it('does not complete a skipped tour but completes a finished tour', async () => {
    const onSkip = jest.fn();
    const onComplete = jest.fn();
    const items: OnboardingItem[] = [
      {
        id: 'tour',
        title: 'Take the product tour',
        action: {
          type: 'tour',
          steps: [{ target: '#target', title: 'Tour step', content: 'Content' }],
          onSkip,
          onComplete,
        },
      },
    ];

    render(<OnboardingChecklist items={items} />);

    fireEvent.click(
      screen.getByRole('button', { name: /Take the product tour/ })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Skip tour' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', { name: 'Mock guided tour' })).not.toBeInTheDocument();
    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Take the product tour/ })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Finish tour' }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
    });
  });

  it('renders semantic links and honors completeOnClick', () => {
    const onCompletedIdsChange = jest.fn();
    const items: OnboardingItem[] = [
      {
        id: 'docs',
        title: 'Read the docs',
        action: {
          type: 'link',
          href: '/docs',
          target: '_blank',
        },
      },
      {
        id: 'support',
        title: 'Visit support',
        action: {
          type: 'link',
          href: '/support',
          completeOnClick: false,
        },
      },
    ];

    render(
      <OnboardingChecklist
        items={items}
        onCompletedIdsChange={onCompletedIdsChange}
      />
    );

    const docsLink = screen.getByRole('link', { name: /Read the docs/ });
    expect(docsLink).toHaveAttribute('href', '/docs');
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
    docsLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(docsLink);

    const supportLink = screen.getByRole('link', { name: /Visit support/ });
    supportLink.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(supportLink);

    expect(screen.getByText('1/2 steps completed')).toBeInTheDocument();
    expect(onCompletedIdsChange).toHaveBeenCalledTimes(1);
    expect(onCompletedIdsChange).toHaveBeenCalledWith(['docs']);
  });

  it('lets a custom action complete and uncomplete through its context', async () => {
    let actionContext: OnboardingActionContext | undefined;
    const onCompletedIdsChange = jest.fn();
    const items: OnboardingItem[] = [
      {
        id: 'custom',
        title: 'Configure workspace',
        action: {
          type: 'custom',
          onAction: (context) => {
            actionContext = context;
            context.complete();
          },
        },
      },
    ];

    render(
      <OnboardingChecklist
        items={items}
        onCompletedIdsChange={onCompletedIdsChange}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Configure workspace/ })
    );
    await waitFor(() => {
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
    });
    expect(actionContext).toMatchObject({
      itemId: 'custom',
      isComplete: false,
    });

    act(() => {
      actionContext?.uncomplete();
    });

    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();
    expect(onCompletedIdsChange).toHaveBeenNthCalledWith(1, ['custom']);
    expect(onCompletedIdsChange).toHaveBeenNthCalledWith(2, []);
  });

  it('shows loading and completes an async custom action on resolve', async () => {
    let resolveAction!: () => void;
    const actionPromise = new Promise<void>((resolve) => {
      resolveAction = resolve;
    });
    const onAction = jest.fn(() => actionPromise);
    const items: OnboardingItem[] = [
      {
        id: 'import',
        title: 'Import your data',
        action: {
          type: 'custom',
          onAction,
          completeOnResolve: true,
        },
      },
    ];

    render(<OnboardingChecklist items={items} />);

    const itemButton = screen.getByRole('button', { name: /Import your data/ });
    fireEvent.click(itemButton);

    expect(itemButton).toBeDisabled();
    expect(itemButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    fireEvent.click(itemButton);
    expect(onAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAction();
      await actionPromise;
    });

    await waitFor(() => {
      expect(screen.getByText('1/1 steps completed')).toBeInTheDocument();
      expect(itemButton).not.toBeDisabled();
    });
  });

  it('reports a rejected custom action and leaves it incomplete', async () => {
    const error = new Error('Import failed');
    const onActionError = jest.fn();
    const item: OnboardingItem = {
      id: 'import',
      title: 'Import your data',
      action: {
        type: 'custom',
        onAction: jest.fn().mockRejectedValue(error),
        completeOnResolve: true,
      },
    };

    render(
      <OnboardingChecklist
        items={[item]}
        onActionError={onActionError}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Import your data/ })
    );

    await waitFor(() => {
      expect(onActionError).toHaveBeenCalledWith(error, item);
      expect(
        screen.getByText('Something went wrong. Please try again.')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('0/1 steps completed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Import your data/ })
    ).toHaveAttribute('data-state', 'error');
  });
});
