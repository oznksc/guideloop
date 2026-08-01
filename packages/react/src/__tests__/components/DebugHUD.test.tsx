import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebugHUD } from '../../components/DebugHUD';
import type { DebugSnapshot } from '../../components/DebugHUD/types';

const baseSnapshot: DebugSnapshot = {
  currentStep: 1,
  totalSteps: 3,
  stepTitle: 'Welcome',
  stepStatus: 'success',
  targetReady: true,
  targetWaiting: false,
  tourVisible: true,
  targets: [
    {
      selector: '#hero',
      found: true,
      role: 'primary',
      shape: 'rect',
      rect: { top: 10, left: 20, width: 100, height: 40 },
    },
    {
      selector: '#missing',
      found: false,
      role: 'additional',
      shape: 'circle',
    },
  ],
  trigger: 'click',
  stepEnteredAt: Date.now() - 1500,
  events: [
    {
      id: 1,
      ts: Date.now() - 2000,
      type: 'open',
      message: 'Tour opened',
      stepIndex: 0,
    },
    {
      id: 2,
      ts: Date.now() - 500,
      type: 'step-change',
      message: 'Step 0 → 1',
      stepIndex: 1,
    },
  ],
  persistKey: 'demo-tour',
};

describe('DebugHUD', () => {
  it('renders step and target information', () => {
    render(<DebugHUD snapshot={baseSnapshot} />);
    expect(screen.getByTestId('guideloop-debug-hud')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('#hero')).toBeInTheDocument();
    expect(screen.getByText('#missing')).toBeInTheDocument();
    expect(screen.getByText('missing')).toBeInTheDocument();
    expect(screen.getByText(/click/)).toBeInTheDocument();
    expect(screen.getByText('demo-tour')).toBeInTheDocument();
  });

  it('shows event history messages', () => {
    render(<DebugHUD snapshot={baseSnapshot} />);
    expect(screen.getByText('Tour opened')).toBeInTheDocument();
    expect(screen.getByText('Step 0 → 1')).toBeInTheDocument();
  });

  it('collapses and expands on header click', () => {
    render(<DebugHUD snapshot={baseSnapshot} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /GuideLoop Debug/i }));
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /GuideLoop Debug/i }));
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    render(<DebugHUD snapshot={baseSnapshot} defaultCollapsed />);
    expect(screen.queryByText('Welcome')).not.toBeInTheDocument();
    expect(screen.getByTestId('guideloop-debug-hud')).toBeInTheDocument();
  });
});
