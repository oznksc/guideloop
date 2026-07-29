import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TourBuilder } from '../../components/TourBuilder';
import { resolveBuilderEnabled } from '../../components/TourBuilder/types';
import {
  exportAsJson,
  importFromJson,
} from '../../components/TourBuilder/export';
import { buildSelector, validateSelector } from '../../components/TourBuilder/selectors';

describe('resolveBuilderEnabled', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  it('respects true/false and auto', () => {
    process.env.NODE_ENV = 'production';
    expect(resolveBuilderEnabled(true)).toBe(true);
    expect(resolveBuilderEnabled(false)).toBe(false);
    expect(resolveBuilderEnabled('auto')).toBe(false);
    process.env.NODE_ENV = 'development';
    expect(resolveBuilderEnabled('auto')).toBe(true);
    expect(resolveBuilderEnabled(undefined)).toBe(true);
  });
});

describe('TourBuilder export/import', () => {
  it('round-trips steps', () => {
    const steps = [
      {
        id: '1',
        target: '#x',
        title: 'Hello',
        content: 'World',
        placement: 'bottom' as const,
        spotlightShape: 'circle' as const,
        spotlightPadding: 8,
        trigger: 'click' as const,
        additionalTargets: ['#y'],
      },
    ];
    const json = exportAsJson(steps);
    const result = importFromJson(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.steps[0].target).toBe('#x');
      expect(result.steps[0].spotlightShape).toBe('circle');
      expect(result.steps[0].additionalTargets).toEqual(['#y']);
    }
  });
});

describe('TourBuilder selectors', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="cta">Go</button>
      <div data-guideloop-builder><button id="chrome">X</button></div>
    `;
  });

  it('prefers id selectors', () => {
    const el = document.getElementById('cta')!;
    expect(buildSelector(el)).toBe('#cta');
  });

  it('validates presence', () => {
    expect(validateSelector('#cta').status).toBe('valid');
    expect(validateSelector('#missing').status).toBe('missing');
  });
});

describe('TourBuilder UI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('renders FAB when enabled and opens panel', async () => {
    render(
      <>
        <button id="live-cta" type="button">
          Live CTA
        </button>
        <TourBuilder enabled />
      </>
    );

    const fab = await screen.findByRole('button', {
      name: /Open GuideLoop Tour Builder/i,
    });
    fireEvent.click(fab);

    expect(
      await screen.findByRole('dialog', { name: /Tour Builder/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Pick element/i })
    ).toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    render(<TourBuilder enabled={false} />);
    expect(
      screen.queryByRole('button', { name: /Open GuideLoop Tour Builder/i })
    ).not.toBeInTheDocument();
  });

  it('adds a step when picking a live element', async () => {
    render(
      <>
        <main>
          <button id="live-cta" type="button">
            Live CTA
          </button>
        </main>
        <TourBuilder enabled defaultOpen />
      </>
    );

    await screen.findByRole('dialog', { name: /Tour Builder/i });

    fireEvent.click(screen.getByRole('button', { name: /Pick element/i }));

    const cta = document.getElementById('live-cta')!;
    // jsdom often returns 0 rects — force a non-zero box
    cta.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 10,
        bottom: 40,
        right: 100,
        width: 90,
        height: 30,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect;

    document.elementsFromPoint = () => [cta];

    await act(async () => {
      document.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('#live-cta')).toBeInTheDocument();
    });
  });
});
