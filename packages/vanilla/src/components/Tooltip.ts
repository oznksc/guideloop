/**
 * DOM Tooltip component — renders a positioned tooltip with navigation buttons.
 * Pure DOM manipulation, no framework dependency.
 */

import {
  getAnimationStyle,
  querySelectorAsHTMLElement,
} from '@guideloop/core';
import type { ThemeConfig, AnimationConfig } from '@guideloop/core';
import { createPopperManager, type PopperManagerInstance } from '../core/PopperManager';
import { getTheme } from '@guideloop/core';
import type { Theme } from '@guideloop/core';

export interface ButtonLabels {
  next?: string;
  prev?: string;
  skip?: string;
  finish?: string;
}

export interface TooltipOptions {
  step: {
    target: string;
    title?: string;
    content?: string | HTMLElement;
    placement?: string;
    buttonLabels?: ButtonLabels;
    showButtons?: { next?: boolean; previous?: boolean; close?: boolean };
    icon?: string | HTMLElement;
    image?: { type: 'image'; src: string; alt?: string; width?: number; height?: number } | { type: 'svg'; component: string | HTMLElement; width?: number; height?: number };
    buttons?: { next?: string | HTMLElement; prev?: string | HTMLElement; close?: string | HTMLElement };
  };
  theme: Theme;
  customTheme?: Partial<ThemeConfig>;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  animation?: AnimationConfig['tooltip'];
  defaultButtonLabels?: ButtonLabels;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const DEFAULT_LABELS: ButtonLabels = {
  next: 'Next',
  prev: 'Previous',
  skip: 'Skip',
  finish: 'Finish',
};

export interface TooltipInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
}

export function createTooltip(options: TooltipOptions): TooltipInstance {
  const {
    step,
    theme,
    customTheme,
    currentStep,
    totalSteps,
    isFirst,
    isLast,
    animation,
    defaultButtonLabels = DEFAULT_LABELS,
    onNext,
    onPrev,
    onClose,
  } = options;

  const themeStyles = getTheme(theme, customTheme);
  const buttonLabels = {
    ...DEFAULT_LABELS,
    ...defaultButtonLabels,
    ...step.buttonLabels,
  };

  const showButtons = {
    next: step.showButtons?.next !== false,
    previous: step.showButtons?.previous !== false && !isFirst,
    close: step.showButtons?.close !== false && !isLast,
  };

  // Create tooltip element
  const tooltipEl = document.createElement('div');
  tooltipEl.className = 'guideloop-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-label', step.title ?? '');

  const targetElement = step.target ? querySelectorAsHTMLElement(step.target) : null;

  const fallbackStyle: Partial<CSSStyleDeclaration> = !targetElement
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    : {};

  Object.assign(tooltipEl.style, {
    position: 'fixed',
    pointerEvents: 'auto',
    maxWidth: '480px',
    overflowY: 'auto',
    ...themeStyles.tooltip,
    ...getAnimationStyle(animation, 'enter'),
    ...fallbackStyle,
  });

  // Progress indicator
  const progressEl = document.createElement('div');
  progressEl.setAttribute('role', 'status');
  Object.assign(progressEl.style, {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  });
  progressEl.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
  tooltipEl.appendChild(progressEl);

  // Image content
  if (step.image) {
    const imageContainer = document.createElement('div');
    Object.assign(imageContainer.style, {
      display: 'flex',
      justifyContent: 'center',
    });

    if (step.image.type === 'image') {
      const img = document.createElement('img');
      img.src = step.image.src;
      if (step.image.alt) img.alt = step.image.alt;
      if (step.image.width) img.width = step.image.width;
      if (step.image.height) img.height = step.image.height;
      imageContainer.appendChild(img);
    } else if (step.image.type === 'svg') {
      if (typeof step.image.component === 'string') {
        imageContainer.innerHTML = step.image.component;
      } else {
        imageContainer.appendChild(step.image.component);
      }
    }

    tooltipEl.appendChild(imageContainer);
  }

  // Content container
  const contentContainer = document.createElement('div');
  Object.assign(contentContainer.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  });

  // Title row
  const titleRow = document.createElement('div');
  Object.assign(titleRow.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  if (step.icon) {
    const iconEl = document.createElement('span');
    Object.assign(iconEl.style, { flexShrink: '0', color: '#2563eb' });
    iconEl.setAttribute('aria-hidden', 'true');
    if (typeof step.icon === 'string') {
      iconEl.innerHTML = step.icon;
    } else {
      iconEl.appendChild(step.icon);
    }
    titleRow.appendChild(iconEl);
  }

  const titleEl = document.createElement('h3');
  Object.assign(titleEl.style, { fontSize: '1.125rem', fontWeight: '600' });
  titleEl.textContent = step.title ?? '';
  titleRow.appendChild(titleEl);
  contentContainer.appendChild(titleRow);

  // Content
  const contentEl = document.createElement('div');
  Object.assign(contentEl.style, { color: '#4b5563' });
  if (!step.content) {
    // no content
  } else if (typeof step.content === 'string') {
    contentEl.textContent = step.content;
  } else {
    contentEl.appendChild(step.content);
  }
  contentContainer.appendChild(contentEl);
  tooltipEl.appendChild(contentContainer);

  // Navigation buttons
  const navContainer = document.createElement('div');
  Object.assign(navContainer.style, {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f3f4f6',
  });

  // Previous button
  const prevContainer = document.createElement('div');
  const prevBtn = createButton(
    'prev',
    buttonLabels.prev!,
    showButtons.previous,
    'secondary',
    themeStyles.buttons,
    step.buttons?.prev,
    onPrev
  );
  prevContainer.appendChild(prevBtn);
  navContainer.appendChild(prevContainer);

  // Right side: skip + next
  const rightContainer = document.createElement('div');
  Object.assign(rightContainer.style, { display: 'flex', gap: '0.5rem' });

  const skipBtn = createButton(
    'close',
    buttonLabels.skip!,
    showButtons.close,
    'secondary',
    themeStyles.buttons,
    step.buttons?.close,
    onClose
  );
  rightContainer.appendChild(skipBtn);

  const nextLabel = isLast ? buttonLabels.finish : buttonLabels.next;
  const nextBtn = createButton(
    'next',
    nextLabel!,
    showButtons.next,
    'primary',
    themeStyles.buttons,
    step.buttons?.next,
    onNext
  );
  rightContainer.appendChild(nextBtn);

  navContainer.appendChild(rightContainer);
  tooltipEl.appendChild(navContainer);

  // Popper instance
  let popper: PopperManagerInstance | null = null;

  if (targetElement) {
    popper = createPopperManager(targetElement, tooltipEl, (step.placement as any) || 'bottom');
  }

  let resizeHandler: (() => void) | null = null;

  function mount(parent: HTMLElement) {
    parent.appendChild(tooltipEl);
    if (popper) {
      // Update on resize
      let resizeTimeout: number;
      resizeHandler = () => {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          requestAnimationFrame(() => popper?.update());
        }, 100);
      };
      window.addEventListener('resize', resizeHandler);
    }
  }

  function unmount() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    popper?.destroy();
    popper = null;
    if (tooltipEl.isConnected) {
      tooltipEl.remove();
    }
  }

  return {
    getElement: () => tooltipEl,
    mount,
    unmount,
    destroy: unmount,
  };
}

function createButton(
  action: string,
  label: string,
  visible: boolean,
  variant: 'primary' | 'secondary',
  themeButtons: ThemeConfig['buttons'],
  customButton: string | HTMLElement | undefined,
  handler: () => void
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('data-guideloop-action', action);

  if (!visible) {
    btn.style.display = 'none';
  }

  const styles = variant === 'primary' ? themeButtons?.primary : themeButtons?.secondary;
  if (styles) {
    Object.assign(btn.style, styles);
  }

  if (customButton) {
    btn.textContent = '';
    if (typeof customButton === 'string') {
      btn.innerHTML = customButton;
    } else {
      btn.appendChild(customButton);
    }
  } else {
    btn.textContent = label;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    handler();
  });

  return btn;
}


