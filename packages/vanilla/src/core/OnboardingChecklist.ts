/**
 * OnboardingChecklist — non-linear task list component.
 * Pure DOM, no framework dependency.
 * Mirrors the React OnboardingChecklist component.
 */

import {
  loadOnboardingState,
  saveOnboardingState,
  injectOnboardingStyles,
} from '@guideloop/core';
import { getTheme } from '@guideloop/core';
import { createPortalElement, destroyPortalElement } from '../core/Portal';

import type {
  OnboardingItem,
  OnboardingActionContext,
  OnboardingProgress,
  OnboardingLabels,
  OnboardingChecklistOptions,
  OnboardingTourAction,
  OnboardingModalAction,
} from './types';
import { GuideLoop } from './GuideLoop';

const DEFAULT_LABELS: OnboardingLabels = {
  progress: (completed, total) => `${completed}/${total} steps completed`,
  completed: 'Completed',
  loading: 'Loading…',
  error: 'Something went wrong. Please try again.',
  done: 'Done',
  close: 'Close',
  collapse: 'Collapse checklist',
  expand: 'Expand checklist',
};

function uniqueIds(ids: string[]): string[] {
  return ids.reduce<string[]>((result, id) => {
    if (!result.includes(id)) result.push(id);
    return result;
  }, []);
}

function setInlineStyles(el: HTMLElement, styles: Record<string, string>) {
  for (const [key, value] of Object.entries(styles)) {
    (el.style as any)[key] = value;
  }
}

export interface OnboardingChecklistInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
  completeItem: (itemId: string) => void;
  uncompleteItem: (itemId: string) => void;
  getProgress: () => OnboardingProgress;
}

export function createOnboardingChecklist(
  options: OnboardingChecklistOptions
): OnboardingChecklistInstance {
  const {
    items,
    title = 'Getting Started',
    description,
    completedIds: controlledCompletedIds,
    defaultCompletedIds = [],
    onCompletedIdsChange,
    onProgressChange,
    onComplete,
    onItemAction,
    onActionError,
    persist,
    theme = 'tailwind',
    customTheme,
    labels: customLabels,
    collapsible = true,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    showProgressBar = true,
    emptyState = 'No onboarding steps yet.',
    ariaLabel = 'Getting started checklist',
    className,
    zIndex = 3000,
  } = options;

  const isCompletionControlled = controlledCompletedIds !== undefined;
  const isCollapseControlled = controlledCollapsed !== undefined;
  const persistKey = persist?.key;
  const persistType = persist?.type;
  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const validItemIds = items.map((item) => item.id);
  const themeStyles = getTheme(theme, customTheme);

  injectOnboardingStyles();

  // State
  let internalCompletedIds = uniqueIds(defaultCompletedIds);
  let internalCollapsed = defaultCollapsed;
  let busyItemId: string | null = null;
  let errorItemId: string | null = null;
  let completionNotified = false;
  let activeGuideLoop: GuideLoop | null = null;

  // Hydrate from persistence
  if (persistKey) {
    const saved = loadOnboardingState(persistKey, persistType);
    if (saved?.completedIds && !isCompletionControlled) {
      internalCompletedIds = saved.completedIds;
    }
  }

  function getCompletedIds(): string[] {
    const source = isCompletionControlled ? controlledCompletedIds! : internalCompletedIds;
    return uniqueIds(source).filter((id) => validItemIds.includes(id));
  }

  function commitCompletedIds(nextIds: string[]) {
    const normalized = uniqueIds(nextIds).filter((id) => validItemIds.includes(id));
    if (!isCompletionControlled) {
      internalCompletedIds = normalized;
      if (persistKey) {
        saveOnboardingState(persistKey, normalized, persistType);
      }
    }
    onCompletedIdsChange?.(normalized);
    render();
  }

  function getProgress(): OnboardingProgress {
    const completedIds = getCompletedIds();
    const completed = completedIds.length;
    const total = items.length;
    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      completedIds,
    };
  }

  function createContext(itemId: string): OnboardingActionContext {
    return {
      itemId,
      isComplete: getCompletedIds().includes(itemId),
      setCompleted: (completed) => {
        if (completed) commitCompletedIds([...getCompletedIds(), itemId]);
        else commitCompletedIds(getCompletedIds().filter((id) => id !== itemId));
      },
      complete: () => commitCompletedIds([...getCompletedIds(), itemId]),
      uncomplete: () =>
        commitCompletedIds(getCompletedIds().filter((id) => id !== itemId)),
      close: () => {
        render();
      },
    };
  }

  // Root element
  const root = document.createElement('section');
  root.className = ['guideloop-onboarding', className].filter(Boolean).join(' ');
  root.setAttribute('aria-label', ariaLabel);

  const styleVars: Record<string, string> = {
    '--gl-onboarding-background': themeStyles.tooltip.background,
    '--gl-onboarding-text': themeStyles.tooltip.textColor,
    '--gl-onboarding-accent': themeStyles.buttons.primary.background,
    '--gl-onboarding-accent-text':
      theme === 'antd' ? themeStyles.tooltip.textColor : themeStyles.buttons.primary.textColor,
    '--gl-onboarding-radius': themeStyles.tooltip.borderRadius,
    '--gl-onboarding-shadow': themeStyles.tooltip.boxShadow,
  };
  for (const [key, value] of Object.entries(styleVars)) {
    root.style.setProperty(key, value);
  }

  // Header
  const header = document.createElement('div');
  header.className = 'guideloop-onboarding__header';

  const heading = document.createElement('div');
  heading.className = 'guideloop-onboarding__heading';

  const titleEl = document.createElement('h2');
  titleEl.className = 'guideloop-onboarding__title';
  titleEl.textContent = title;
  heading.appendChild(titleEl);

  if (description) {
    const descEl = document.createElement('p');
    descEl.className = 'guideloop-onboarding__description';
    descEl.textContent = description;
    heading.appendChild(descEl);
  }

  const progressCopy = document.createElement('div');
  progressCopy.className = 'guideloop-onboarding__progress-copy';
  progressCopy.setAttribute('aria-live', 'polite');
  heading.appendChild(progressCopy);

  header.appendChild(heading);

  // Collapse toggle
  if (collapsible) {
    const collapseBtn = document.createElement('button');
    collapseBtn.type = 'button';
    collapseBtn.className = 'guideloop-onboarding__collapse';
    collapseBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
    collapseBtn.addEventListener('click', () => {
      const nextCollapsed = !getCurrentCollapsed();
      if (!isCollapseControlled) internalCollapsed = nextCollapsed;
      onCollapsedChange?.(nextCollapsed);
      render();
    });
    header.appendChild(collapseBtn);
  }

  root.appendChild(header);

  // Progress bar
  const progressBarTrack = document.createElement('div');
  progressBarTrack.className = 'guideloop-onboarding__progress-track';
  progressBarTrack.setAttribute('role', 'progressbar');
  root.appendChild(progressBarTrack);

  const progressBarValue = document.createElement('div');
  progressBarValue.className = 'guideloop-onboarding__progress-value';
  progressBarTrack.appendChild(progressBarValue);

  // Items container
  const itemsContainer = document.createElement('ul');
  itemsContainer.className = 'guideloop-onboarding__items';
  root.appendChild(itemsContainer);

  // Empty state
  const emptyEl = document.createElement('p');
  emptyEl.className = 'guideloop-onboarding__empty';
  emptyEl.textContent = emptyState;

  function getCurrentCollapsed(): boolean {
    return isCollapseControlled ? controlledCollapsed! : internalCollapsed;
  }

  function render() {
    const progress = getProgress();
    const currentCollapsed = getCurrentCollapsed();
    const completedIds = getCompletedIds();

    root.dataset.collapsed = String(currentCollapsed);
    root.dataset.complete = String(progress.total > 0 && progress.completed === progress.total);

    // Update progress copy
    progressCopy.textContent = labels.progress(progress.completed, progress.total);

    // Update collapse button
    const collapseBtn = header.querySelector('.guideloop-onboarding__collapse') as HTMLButtonElement | null;
    if (collapseBtn) {
      collapseBtn.setAttribute('aria-expanded', String(!currentCollapsed));
      collapseBtn.setAttribute('aria-label', currentCollapsed ? labels.expand : labels.collapse);
    }

    // Progress bar
    if (showProgressBar) {
      progressBarTrack.style.display = '';
      progressBarTrack.setAttribute('aria-valuemin', '0');
      progressBarTrack.setAttribute('aria-valuemax', String(progress.total));
      progressBarTrack.setAttribute('aria-valuenow', String(progress.completed));
      progressBarTrack.setAttribute('aria-label', `${title} progress`);
      progressBarValue.style.setProperty('--gl-onboarding-progress', String(progress.percentage / 100));
    } else {
      progressBarTrack.style.display = 'none';
    }

    // Items
    itemsContainer.innerHTML = '';
    if (currentCollapsed) return;

    if (items.length === 0) {
      itemsContainer.appendChild(emptyEl);
      return;
    }

    for (const item of items) {
      const isComplete = completedIds.includes(item.id);
      const isBusy = busyItemId === item.id;
      const hasError = errorItemId === item.id;
      const state = isBusy ? 'loading' : hasError ? 'error' : isComplete ? 'success' : 'default';

      const li = document.createElement('li');

      if (item.action?.type === 'link') {
        const a = document.createElement('a');
        a.className = 'guideloop-onboarding__item-control';
        a.dataset.state = state;
        a.href = item.action.href;
        if (item.action.target) a.target = item.action.target;
        if (item.action.rel) a.rel = item.action.rel;
        if (item.disabled) a.tabIndex = -1;
        a.innerHTML = buildItemContent(item, isComplete, isBusy, hasError, labels);
        a.addEventListener('click', (e) => {
          if (item.disabled || isBusy) {
            e.preventDefault();
            return;
          }
          onItemAction?.(item);
          const ctx = createContext(item.id);
          if (item.action?.type === 'link') {
            if (item.action.completeOnClick !== false) ctx.complete();
            item.action.onNavigate?.(ctx);
          }
        });
        li.appendChild(a);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'guideloop-onboarding__item-control';
        btn.dataset.state = state;
        btn.disabled = item.disabled || isBusy;
        btn.setAttribute('aria-disabled', String(item.disabled || isBusy));
        btn.setAttribute('aria-busy', String(isBusy));
        btn.innerHTML = buildItemContent(item, isComplete, isBusy, hasError, labels);
        btn.addEventListener('click', () => handleItemAction(item));
        li.appendChild(btn);
      }

      itemsContainer.appendChild(li);
    }

    // Notify progress
    onProgressChange?.(progress);

    // Check completion
    const isFinished = progress.total > 0 && progress.completed === progress.total;
    if (isFinished && !completionNotified) {
      completionNotified = true;
      onComplete?.(progress);
    } else if (!isFinished) {
      completionNotified = false;
    }
  }

  function handleItemAction(item: OnboardingItem) {
    if (item.disabled || busyItemId === item.id) return;

    errorItemId = null;
    onItemAction?.(item);

    if (!item.action) {
      commitCompletedIds([...getCompletedIds(), item.id]);
      return;
    }

    if (item.action.type === 'tour') {
      startTour(item, item.action);
    } else if (item.action.type === 'modal') {
      showModal(item, item.action);
    } else if (item.action.type === 'custom') {
      void handleCustomAction(item);
    }
  }

  async function handleCustomAction(item: OnboardingItem) {
    if (!item.action || item.action.type !== 'custom') return;
    busyItemId = item.id;
    errorItemId = null;
    render();
    try {
      await item.action.onAction(createContext(item.id));
      if (item.action.completeOnResolve) {
        commitCompletedIds([...getCompletedIds(), item.id]);
      }
    } catch (error) {
      errorItemId = item.id;
      onActionError?.(error, item);
    } finally {
      busyItemId = null;
      render();
    }
  }

  function startTour(item: OnboardingItem, action: OnboardingTourAction) {
    const portalContainer = createPortalElement();

    activeGuideLoop = new GuideLoop({
      ...action.guideOptions,
      steps: action.steps,
      theme: action.guideOptions?.theme ?? theme,
      customTheme: action.guideOptions?.customTheme ?? customTheme,
      zIndex: action.guideOptions?.zIndex ?? zIndex,
      onClose: () => {
        action.onClose?.(createContext(item.id));
        activeGuideLoop?.destroy();
        activeGuideLoop = null;
        destroyPortalElement(portalContainer);
        render();
      },
      onSkip: () => {
        const ctx = createContext(item.id);
        if (action.completeOnSkip) ctx.complete();
        action.onSkip?.(ctx);
      },
      onComplete: () => {
        const ctx = createContext(item.id);
        ctx.complete();
        action.onComplete?.(ctx);
      },
    });
    activeGuideLoop.start();
  }

  function showModal(item: OnboardingItem, action: OnboardingModalAction) {
    const portalContainer = createPortalElement();
    const ctx = createContext(item.id);

    const overlay = document.createElement('div');
    setInlineStyles(overlay, {
      position: 'fixed', inset: '0', zIndex: String(zIndex),
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    });

    const dialog = document.createElement('div');
    dialog.className = 'guideloop-onboarding-modal';
    setInlineStyles(dialog, {
      background: themeStyles.tooltip.background, borderRadius: themeStyles.tooltip.borderRadius,
      boxShadow: themeStyles.tooltip.boxShadow, padding: '24px', maxWidth: '480px', width: '90%',
      color: themeStyles.tooltip.textColor,
    });

    if (action.title) {
      const h3 = document.createElement('h3');
      h3.textContent = typeof action.title === 'string' ? action.title : '';
      setInlineStyles(h3, { margin: '0 0 12px', fontSize: '1.125rem', fontWeight: '600' });
      dialog.appendChild(h3);
    }

    const contentEl = document.createElement('div');
    setInlineStyles(contentEl, { marginBottom: '16px' });
    const resolvedContent =
      typeof action.content === 'function' ? action.content(ctx) : action.content;
    if (typeof resolvedContent === 'string') {
      contentEl.textContent = resolvedContent;
    } else if (resolvedContent instanceof HTMLElement) {
      contentEl.appendChild(resolvedContent);
    }
    dialog.appendChild(contentEl);

    const btnRow = document.createElement('div');
    setInlineStyles(btnRow, { display: 'flex', justifyContent: 'flex-end', gap: '8px' });

    if (action.secondaryLabel) {
      const secBtn = document.createElement('button');
      secBtn.type = 'button';
      secBtn.textContent = action.secondaryLabel;
      setInlineStyles(secBtn, { ...themeStyles.buttons.secondary as any });
      secBtn.addEventListener('click', () => {
        action.onSecondary?.(ctx);
        cleanup();
      });
      btnRow.appendChild(secBtn);
    }

    if (action.primaryLabel) {
      const priBtn = document.createElement('button');
      priBtn.type = 'button';
      priBtn.textContent = action.primaryLabel;
      setInlineStyles(priBtn, { ...themeStyles.buttons.primary as any });
      priBtn.addEventListener('click', async () => {
        try {
          const result = await action.onPrimary?.(ctx);
          // Match React: complete on primary unless explicitly disabled; false keeps open
          if (result === false) return;
          if (action.completeOnPrimary !== false) ctx.complete();
          if (action.closeOnPrimary !== false) cleanup();
        } catch (err) {
          onActionError?.(err, item);
          cleanup();
        }
      });
      btnRow.appendChild(priBtn);
    }

    dialog.appendChild(btnRow);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup();
    });
    portalContainer.appendChild(overlay);

    function cleanup() {
      action.onClose?.(ctx);
      destroyPortalElement(portalContainer);
    }
  }

  render();

  return {
    getElement: () => root,
    mount(parent: HTMLElement) {
      parent.appendChild(root);
    },
    unmount() {
      if (root.isConnected) root.remove();
    },
    destroy() {
      activeGuideLoop?.destroy();
      this.unmount();
    },
    completeItem: (itemId: string) => commitCompletedIds([...getCompletedIds(), itemId]),
    uncompleteItem: (itemId: string) =>
      commitCompletedIds(getCompletedIds().filter((id) => id !== itemId)),
    getProgress,
  };
}

function buildItemContent(
  item: OnboardingItem,
  isComplete: boolean,
  isBusy: boolean,
  hasError: boolean,
  labels: OnboardingLabels
): string {
  const statusHtml = isComplete && !isBusy
    ? '<svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    : hasError && !isBusy
      ? '<span>!</span>'
      : !isComplete && !isBusy && !hasError && item.icon
        ? `<span class="guideloop-onboarding__item-icon">${typeof item.icon === 'string' ? item.icon : ''}</span>`
        : '';

  const descText = hasError ? labels.error : item.description;
  const descHtml = descText
    ? `<span class="guideloop-onboarding__item-description">${typeof descText === 'string' ? descText : ''}</span>`
    : '';

  const titleText = typeof item.title === 'string' ? item.title : '';

  return `
    <span class="guideloop-onboarding__status" aria-hidden="true">${statusHtml}</span>
    <span class="guideloop-onboarding__item-copy">
      <span class="guideloop-onboarding__item-title">${titleText}</span>
      ${descHtml}
    </span>
    <span class="guideloop-onboarding__chevron" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
    </span>
  `;
}
