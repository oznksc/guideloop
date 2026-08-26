import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { Portal } from '../../components/GuideLoop/Portal';

describe('Portal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders children into #guideloop-portal after mount', async () => {
    render(
      <Portal>
        <div data-testid="portal-child">Hello portal</div>
      </Portal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('portal-child')).toBeInTheDocument();
    });

    const root = document.getElementById('guideloop-portal');
    expect(root).toBeTruthy();
    expect(root?.contains(screen.getByTestId('portal-child'))).toBe(true);
  });

  it('reuses an existing portal root', async () => {
    const existing = document.createElement('div');
    existing.id = 'guideloop-portal';
    document.body.appendChild(existing);

    render(
      <Portal>
        <span data-testid="child">x</span>
      </Portal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    expect(document.querySelectorAll('#guideloop-portal')).toHaveLength(1);
  });

  it('renders into a custom HTMLElement container', async () => {
    const host = document.createElement('div');
    host.id = 'custom-portal';
    document.body.appendChild(host);

    render(
      <Portal container={host}>
        <span data-testid="custom-child">inside</span>
      </Portal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    });
    expect(host.contains(screen.getByTestId('custom-child'))).toBe(true);
    expect(document.getElementById('guideloop-portal')).toBeNull();
  });

  it('renders into a selector-based container', async () => {
    const host = document.createElement('div');
    host.id = 'selector-portal';
    document.body.appendChild(host);

    render(
      <Portal container="#selector-portal">
        <span data-testid="sel-child">sel</span>
      </Portal>
    );

    await waitFor(() => {
      expect(host.contains(screen.getByTestId('sel-child'))).toBe(true);
    });
  });
});
