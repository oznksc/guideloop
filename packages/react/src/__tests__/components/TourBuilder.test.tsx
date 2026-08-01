import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TourBuilder } from '../../components/TourBuilder';
import { resolveBuilderEnabled, createEmptyStep } from '@guideloop/core';
import {
  exportAsJson,
  exportAsTypeScript,
  importFromJson,
  copyToClipboard,
  toExportSteps,
} from '../../components/TourBuilder/export';
import {
  buildSelector,
  validateSelector,
  isBuilderChrome,
  resolvePickTarget,
} from '../../components/TourBuilder/selectors';
import {
  loadDraft,
  saveDraft,
  clearDraft,
} from '../../components/TourBuilder/storage';

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
      <div data-tour-id="hero">Hero</div>
      <input name="email" />
      <button aria-label="Save draft">Save</button>
      <div data-guideloop-builder><button id="chrome">X</button></div>
      <div id="list"><span>a</span><span>b</span></div>
    `;
  });

  it('prefers id selectors', () => {
    const el = document.getElementById('cta')!;
    expect(buildSelector(el)).toBe('#cta');
  });

  it('uses data-tour-id and name attributes', () => {
    expect(buildSelector(document.querySelector('[data-tour-id="hero"]')!)).toBe(
      '[data-tour-id="hero"]'
    );
    expect(buildSelector(document.querySelector('input[name="email"]')!)).toBe(
      'input[name="email"]'
    );
  });

  it('uses unique aria-label on buttons', () => {
    expect(
      buildSelector(document.querySelector('button[aria-label="Save draft"]')!)
    ).toBe('button[aria-label="Save draft"]');
  });

  it('builds path selectors with nth-of-type for siblings', () => {
    const spans = document.querySelectorAll('#list span');
    const sel = buildSelector(spans[1]);
    expect(sel).toContain('nth-of-type');
    expect(document.querySelector(sel)).toBe(spans[1]);
  });

  it('validates presence, empty, ambiguous, and invalid', () => {
    expect(validateSelector('#cta').status).toBe('valid');
    expect(validateSelector('#missing').status).toBe('missing');
    expect(validateSelector('').status).toBe('empty');
    expect(validateSelector('span').status).toBe('ambiguous');
    expect(validateSelector('???').status).toBe('invalid');
  });

  it('detects builder chrome and resolves pick targets', () => {
    const chrome = document.getElementById('chrome')!;
    expect(isBuilderChrome(chrome)).toBe(true);
    expect(isBuilderChrome(document.getElementById('cta'))).toBe(false);

    const cta = document.getElementById('cta')!;
    cta.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        bottom: 20,
        right: 40,
        width: 40,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    document.elementsFromPoint = () => [chrome, cta];
    expect(resolvePickTarget(5, 5)).toBe(cta);

    document.elementsFromPoint = () => [chrome];
    expect(resolvePickTarget(5, 5)).toBeNull();
  });
});

describe('TourBuilder storage', () => {
  const key = 'test-builder-draft';

  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips draft save/load and clear', () => {
    const steps = [createEmptyStep({ target: '#a', title: 'A' })];
    saveDraft(key, steps, steps[0].id);
    const draft = loadDraft(key);
    expect(draft?.steps).toHaveLength(1);
    expect(draft?.steps[0].target).toBe('#a');
    expect(draft?.selectedId).toBe(steps[0].id);
    clearDraft(key);
    expect(loadDraft(key)).toBeNull();
  });

  it('returns null for missing or malformed storage', () => {
    expect(loadDraft('missing')).toBeNull();
    localStorage.setItem(key, '{not-json');
    expect(loadDraft(key)).toBeNull();
    localStorage.setItem(key, JSON.stringify({ steps: 'nope' }));
    expect(loadDraft(key)).toBeNull();
  });
});

describe('TourBuilder export helpers', () => {
  it('omits default shape/padding and supports TS export', () => {
    const steps = [
      createEmptyStep({
        target: '#x',
        title: 'T',
        content: 'C',
        spotlightShape: 'circle',
        spotlightPadding: 12,
        trigger: 'click',
        additionalTargets: ['#y'],
      }),
    ];
    const exported = toExportSteps(steps);
    expect(exported[0]).toMatchObject({
      target: '#x',
      spotlightShape: 'circle',
      spotlightPadding: 12,
      trigger: 'click',
      additionalTargets: ['#y'],
    });
    expect(exportAsTypeScript(steps)).toContain("import type { Step }");
    expect(exportAsTypeScript(steps)).toContain('spotlightShape');
  });

  it('rejects bad import payloads', () => {
    expect(importFromJson('nope').ok).toBe(false);
    expect(importFromJson('{}').ok).toBe(false);
    expect(importFromJson('[{}]').ok).toBe(false);
    expect(importFromJson('[{"target":"#a"}]').ok).toBe(false);
    expect(
      importFromJson(JSON.stringify({ steps: [{ target: '#a', title: 'A' }] })).ok
    ).toBe(true);
  });

  it('copyToClipboard uses navigator.clipboard when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
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

  it('does not render under auto mode outside development', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      render(<TourBuilder />);
      expect(
        screen.queryByRole('button', { name: /Open GuideLoop Tour Builder/i })
      ).not.toBeInTheDocument();
    } finally {
      process.env.NODE_ENV = original;
    }
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

  it('edits selected step fields and reorders / deletes', async () => {
    const onStepsChange = jest.fn();
    render(
      <>
        <button id="a" type="button">
          A
        </button>
        <button id="b" type="button">
          B
        </button>
        <TourBuilder enabled defaultOpen onStepsChange={onStepsChange} />
      </>
    );

    await screen.findByRole('dialog', { name: /Tour Builder/i });

    // Seed two steps via import UI
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i }));
    const textareas = document.querySelectorAll('textarea');
    const ta = textareas[textareas.length - 1] as HTMLTextAreaElement;
    fireEvent.change(ta, {
      target: {
        value: JSON.stringify([
          { target: '#a', title: 'First', content: 'One' },
          { target: '#b', title: 'Second', content: 'Two' },
        ]),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Apply import/i }));

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('First'));
    const titleInput = screen.getByDisplayValue('First');
    fireEvent.change(titleInput, { target: { value: 'First renamed' } });
    expect(screen.getByDisplayValue('First renamed')).toBeInTheDocument();

    expect(onStepsChange).toHaveBeenCalled();
  });

  it('supports clear, export format toggle, copy, and preview', async () => {
    window.confirm = jest.fn(() => true);
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <>
        <button id="cta" type="button">
          CTA
        </button>
        <TourBuilder enabled defaultOpen />
      </>
    );

    await screen.findByRole('dialog', { name: /Tour Builder/i });

    fireEvent.click(screen.getByRole('button', { name: /^Import$/i }));
    const textareas = document.querySelectorAll('textarea');
    const ta = textareas[textareas.length - 1] as HTMLTextAreaElement;
    fireEvent.change(ta, {
      target: {
        value: JSON.stringify([{ target: '#cta', title: 'Hi', content: 'There' }]),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Apply import/i }));

    await waitFor(() => {
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^TypeScript$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Copy$/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /Preview tour/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Guided tour/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^Clear$/i }));
    await waitFor(() => {
      expect(screen.queryByText('Hi')).not.toBeInTheDocument();
    });
    expect(window.confirm).toHaveBeenCalled();
  });

  it('deletes a step and supports re-pick mode', async () => {
    render(
      <>
        <button id="cta" type="button">
          CTA
        </button>
        <button id="other" type="button">
          Other
        </button>
        <TourBuilder enabled defaultOpen />
      </>
    );

    await screen.findByRole('dialog', { name: /Tour Builder/i });
    fireEvent.click(screen.getByRole('button', { name: /^Import$/i }));
    const ta = document.querySelectorAll('textarea')[
      document.querySelectorAll('textarea').length - 1
    ] as HTMLTextAreaElement;
    fireEvent.change(ta, {
      target: {
        value: JSON.stringify([{ target: '#cta', title: 'Step A', content: 'Body' }]),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Apply import/i }));
    await waitFor(() => expect(screen.getByText('Step A')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Step A'));
    fireEvent.click(screen.getByRole('button', { name: /Re-pick/i }));
    expect(screen.getByText(/update this step/i)).toBeInTheDocument();

    const other = document.getElementById('other')!;
    other.getBoundingClientRect = () =>
      ({
        top: 10,
        left: 10,
        bottom: 40,
        right: 80,
        width: 70,
        height: 30,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect;
    document.elementsFromPoint = () => [other];
    await act(async () => {
      document.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: 15,
          clientY: 15,
        })
      );
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('#other')).toBeInTheDocument();
    });

    // delete via ✕
    const deleteBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === '✕'
    );
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn!);
    await waitFor(() => {
      expect(screen.queryByText('Step A')).not.toBeInTheDocument();
    });
  });
});
