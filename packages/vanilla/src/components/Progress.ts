/**
 * DOM Progress component — step progress dots indicator.
 * Pure DOM, no framework dependency.
 */

import { getTheme } from '@guideloop/core';
import type { Theme, ThemeConfig } from '@guideloop/core';

export interface ProgressOptions {
  current: number;
  total: number;
  theme: Theme;
  customTheme?: Partial<ThemeConfig>;
}

export interface ProgressInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
  update: (current: number, total: number) => void;
}

export function createProgress(options: ProgressOptions): ProgressInstance {
  const { current, total, theme, customTheme } = options;
  const themeStyles = getTheme(theme, customTheme);

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
  });

  const pill = document.createElement('div');
  Object.assign(pill.style, {
    backgroundColor: themeStyles.tooltip.background,
    borderRadius: '9999px',
    boxShadow:
      '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    padding: '0.5rem 1rem',
  });

  const dotsRow = document.createElement('div');
  Object.assign(dotsRow.style, { display: 'flex', gap: '0.25rem' });

  function renderDots(cur: number, tot: number) {
    dotsRow.innerHTML = '';
    for (let i = 0; i < tot; i++) {
      const dot = document.createElement('div');
      const isActive = i < cur;
      Object.assign(dot.style, {
        width: '0.5rem',
        height: '0.5rem',
        borderRadius: '9999px',
        backgroundColor: isActive
          ? themeStyles.buttons.primary.background
          : themeStyles.buttons.secondary.textColor,
        opacity: isActive ? '1' : '0.3',
      });
      dotsRow.appendChild(dot);
    }
  }

  renderDots(current, total);
  pill.appendChild(dotsRow);
  container.appendChild(pill);

  return {
    getElement: () => container,
    mount(parent: HTMLElement) {
      parent.appendChild(container);
    },
    unmount() {
      if (container.isConnected) {
        container.remove();
      }
    },
    destroy() {
      this.unmount();
    },
    update(newCurrent: number, newTotal: number) {
      renderDots(newCurrent, newTotal);
    },
  };
}
