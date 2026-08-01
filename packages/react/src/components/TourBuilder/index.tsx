'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { GuideLoop } from '../GuideLoop';
import type { Step } from '../GuideLoop/types';
import {
  isBrowser,
  createEmptyStep,
  DEFAULT_STORAGE_KEY,
  PLACEMENTS,
  resolveBuilderEnabled,
  SHAPES,
  TRIGGERS,
  copyToClipboard,
  exportAsJson,
  exportAsTypeScript,
  importFromJson,
  clearDraft,
  loadDraft,
  saveDraft,
  validateSelector,
  injectTourBuilderStyles,
} from '@guideloop/core';
import type {
  BuilderMode,
  BuilderStep,
  PickIntent,
  TourBuilderProps,
} from '@guideloop/core';
import { PickerOverlay } from './PickerOverlay';

function toGuideSteps(steps: BuilderStep[]): Step[] {
  return steps
    .filter((s) => s.target.trim())
    .map((s) => ({
      target: s.target.trim(),
      title: s.title,
      content: s.content,
      placement: s.placement,
      spotlightShape: s.spotlightShape,
      spotlightPadding: s.spotlightPadding,
      ...(s.trigger ? { trigger: s.trigger } : {}),
      ...(s.additionalTargets && s.additionalTargets.length > 0
        ? { additionalTargets: s.additionalTargets }
        : {}),
    }));
}

function guessTitle(el: HTMLElement): string {
  const label =
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('title') ||
    (el instanceof HTMLInputElement || el instanceof HTMLButtonElement
      ? el.value
      : '') ||
    el.textContent?.trim() ||
    el.id ||
    el.tagName.toLowerCase();
  return label.replace(/\s+/g, ' ').slice(0, 48) || 'New step';
}

function Status({ selector }: { selector: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setN((x) => x + 1), 700);
    return () => window.clearInterval(id);
  }, []);
  void n;
  const { status } = validateSelector(selector);
  return (
    <span className={`guideloop-tb-status ${status}`}>
      {status === 'valid' && 'found'}
      {status === 'missing' && 'missing'}
      {status === 'invalid' && 'invalid'}
      {status === 'ambiguous' && 'ambiguous'}
      {status === 'empty' && 'empty'}
    </span>
  );
}

/**
 * In-app development Tour Builder.
 *
 * Prefer a development-only import so production builds never ship this UI:
 *
 * ```tsx
 * // Next.js Server Component gate (no production chunk)
 * async function DevTourBuilderSlot() {
 *   if (process.env.NODE_ENV !== 'development') return null;
 *   const { TourBuilder } = await import('guideloop/builder');
 *   return <TourBuilder enabled />;
 * }
 *
 * // Or gate the render — auto mode also returns null in production
 * {process.env.NODE_ENV === 'development' && <TourBuilder />}
 * ```
 *
 * Click the floating **GL** button, pick real page elements, edit steps,
 * preview with GuideLoop, export JSON/TS into your codebase.
 */
export const TourBuilder: React.FC<TourBuilderProps> = ({
  enabled = 'auto',
  storageKey = DEFAULT_STORAGE_KEY,
  zIndex = 2147483000,
  defaultOpen = false,
  onStepsChange,
}) => {
  const active = resolveBuilderEnabled(enabled);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<BuilderMode>('idle');
  const [pickIntent, setPickIntent] = useState<PickIntent>({ type: 'add' });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [exportFmt, setExportFmt] = useState<'json' | 'ts'>('json');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const draft = useMemo(
    () => (isBrowser() ? loadDraft(storageKey) : null),
    [storageKey]
  );
  const [steps, setSteps] = useState<BuilderStep[]>(() => draft?.steps ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => draft?.selectedId ?? null
  );

  const selected = useMemo(
    () => steps.find((s) => s.id === selectedId) ?? null,
    [steps, selectedId]
  );
  const guideSteps = useMemo(() => toGuideSteps(steps), [steps]);
  const exportText = useMemo(
    () =>
      exportFmt === 'json' ? exportAsJson(steps) : exportAsTypeScript(steps),
    [exportFmt, steps]
  );

  useEffect(() => {
    if (!active) return;
    injectTourBuilderStyles();
    setMounted(true);
  }, [active]);

  useEffect(() => {
    if (!active || !mounted) return;
    saveDraft(storageKey, steps, selectedId);
    onStepsChange?.(steps);
  }, [active, mounted, steps, selectedId, storageKey, onStepsChange]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  }, []);

  const onPick = useCallback(
    (selector: string, el: HTMLElement) => {
      if (pickIntent.type === 'repick') {
        const id = pickIntent.stepId;
        setSteps((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  target: selector,
                  title:
                    s.title === 'New step' || s.title.startsWith('Highlight ')
                      ? guessTitle(el)
                      : s.title,
                }
              : s
          )
        );
        setSelectedId(id);
        setPickIntent({ type: 'add' });
        setMode('idle');
        showToast(`Target → ${selector}`);
        return;
      }
      if (pickIntent.type === 'add-additional') {
        const id = pickIntent.stepId;
        setSteps((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  additionalTargets: [...(s.additionalTargets ?? []), selector],
                }
              : s
          )
        );
        setSelectedId(id);
        setPickIntent({ type: 'add' });
        setMode('idle');
        showToast(`+ ${selector}`);
        return;
      }
      const step = createEmptyStep({
        target: selector,
        title: guessTitle(el),
        content: `This highlights ${selector}.`,
      });
      setSteps((prev) => [...prev, step]);
      setSelectedId(step.id);
      setMode('idle');
      showToast(`Added ${selector}`);
    },
    [pickIntent, showToast]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'pick') {
          setMode('idle');
          setPickIntent({ type: 'add' });
          e.preventDefault();
        } else if (previewOpen) {
          setPreviewOpen(false);
        }
      }
      if (
        !e.metaKey &&
        !e.ctrlKey &&
        (e.key === 'p' || e.key === 'P') &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setPreviewOpen(false);
        setMode((m) => {
          if (m === 'pick') {
            setPickIntent({ type: 'add' });
            return 'idle';
          }
          setPickIntent({ type: 'add' });
          return 'pick';
        });
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, mode, previewOpen]);

  if (!active || !mounted || !isBrowser()) {
    return null;
  }

  const patchSelected = (partial: Partial<BuilderStep>) => {
    if (!selected) return;
    setSteps((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, ...partial } : s))
    );
  };

  const move = (id: string, dir: -1 | 1) => {
    setSteps((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      return copy;
    });
  };

  const ui = (
    <div
      data-guideloop-builder
      style={{ ['--gl-tb-z' as string]: String(zIndex) }}
    >
      <button
        type="button"
        className="guideloop-tb-fab"
        data-open={open ? 'true' : 'false'}
        data-guideloop-builder
        title="GuideLoop Tour Builder (dev)"
        aria-label="Open GuideLoop Tour Builder"
        onClick={() => {
          setOpen((v) => !v);
          setMode('idle');
        }}
      >
        GL
      </button>

      {open && (
        <div className="guideloop-tb-panel" data-guideloop-builder role="dialog" aria-label="Tour Builder">
          <div className="guideloop-tb-header" data-guideloop-builder>
            <strong>Tour Builder</strong>
            <span className="guideloop-tb-badge">dev</span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              className="guideloop-tb-btn"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="guideloop-tb-body" data-guideloop-builder>
            <div>
              <h3 className="guideloop-tb-section-title">
                Steps ({steps.length})
              </h3>
              {steps.length === 0 ? (
                <div className="guideloop-tb-empty">
                  Click <strong>Pick</strong> then select any element on your
                  live page. Export when done.
                </div>
              ) : (
                steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`guideloop-tb-step${
                      selectedId === step.id ? ' selected' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(step.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedId(step.id);
                      }
                    }}
                  >
                    <span className="idx">{index + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="title">{step.title || '(untitled)'}</div>
                      <div className="target">
                        {step.target || '(no target)'}
                      </div>
                    </div>
                    <div
                      style={{ display: 'flex', flexDirection: 'column' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="guideloop-tb-icon"
                        disabled={index === 0}
                        onClick={() => move(step.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="guideloop-tb-icon"
                        disabled={index === steps.length - 1}
                        onClick={() => move(step.id, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="guideloop-tb-icon"
                        onClick={() => {
                          setSteps((prev) => prev.filter((s) => s.id !== step.id));
                          if (selectedId === step.id) setSelectedId(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h3 className="guideloop-tb-section-title">Editor</h3>
              {!selected ? (
                <div className="guideloop-tb-empty">Select a step to edit.</div>
              ) : (
                <>
                  <div className="guideloop-tb-field">
                    <label>
                      Target <Status selector={selected.target} />
                    </label>
                    <input
                      value={selected.target}
                      spellCheck={false}
                      onChange={(e) =>
                        patchSelected({ target: e.target.value })
                      }
                    />
                    <div className="guideloop-tb-row" style={{ marginTop: 4 }}>
                      <button
                        type="button"
                        className="guideloop-tb-btn"
                        onClick={() => {
                          setPickIntent({
                            type: 'repick',
                            stepId: selected.id,
                          });
                          setMode('pick');
                          setPreviewOpen(false);
                        }}
                      >
                        Re-pick
                      </button>
                      <button
                        type="button"
                        className="guideloop-tb-btn"
                        onClick={() => {
                          setPickIntent({
                            type: 'add-additional',
                            stepId: selected.id,
                          });
                          setMode('pick');
                          setPreviewOpen(false);
                        }}
                      >
                        + Extra target
                      </button>
                    </div>
                  </div>
                  <div className="guideloop-tb-field">
                    <label>Title</label>
                    <input
                      value={selected.title}
                      onChange={(e) =>
                        patchSelected({ title: e.target.value })
                      }
                    />
                  </div>
                  <div className="guideloop-tb-field">
                    <label>Content</label>
                    <textarea
                      value={selected.content}
                      onChange={(e) =>
                        patchSelected({ content: e.target.value })
                      }
                    />
                  </div>
                  <div className="guideloop-tb-field">
                    <label>Placement</label>
                    <select
                      value={selected.placement}
                      onChange={(e) =>
                        patchSelected({
                          placement: e.target
                            .value as BuilderStep['placement'],
                        })
                      }
                    >
                      {PLACEMENTS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="guideloop-tb-field">
                    <label>Shape</label>
                    <select
                      value={selected.spotlightShape}
                      onChange={(e) =>
                        patchSelected({
                          spotlightShape: e.target
                            .value as BuilderStep['spotlightShape'],
                        })
                      }
                    >
                      {SHAPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="guideloop-tb-field">
                    <label>Trigger</label>
                    <select
                      value={selected.trigger ?? ''}
                      onChange={(e) =>
                        patchSelected({
                          trigger: e.target.value as BuilderStep['trigger'],
                        })
                      }
                    >
                      {TRIGGERS.map((t) => (
                        <option key={t || 'none'} value={t}>
                          {t || '(none)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(selected.additionalTargets?.length ?? 0) > 0 && (
                    <div className="guideloop-tb-field">
                      <label>Additional targets</label>
                      {(selected.additionalTargets ?? []).map((t, i) => (
                        <div
                          key={`${t}-${i}`}
                          className="guideloop-tb-row"
                          style={{ marginBottom: 4 }}
                        >
                          <input
                            style={{ flex: 1, minWidth: 0 }}
                            value={t}
                            spellCheck={false}
                            onChange={(e) => {
                              const next = [
                                ...(selected.additionalTargets ?? []),
                              ];
                              next[i] = e.target.value;
                              patchSelected({ additionalTargets: next });
                            }}
                          />
                          <Status selector={t} />
                          <button
                            type="button"
                            className="guideloop-tb-icon"
                            onClick={() =>
                              patchSelected({
                                additionalTargets: (
                                  selected.additionalTargets ?? []
                                ).filter((_, j) => j !== i),
                              })
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <h3 className="guideloop-tb-section-title">Export</h3>
              <div className="guideloop-tb-row" style={{ marginBottom: 6 }}>
                <button
                  type="button"
                  className={`guideloop-tb-btn${
                    exportFmt === 'json' ? ' primary' : ''
                  }`}
                  onClick={() => setExportFmt('json')}
                >
                  JSON
                </button>
                <button
                  type="button"
                  className={`guideloop-tb-btn${
                    exportFmt === 'ts' ? ' primary' : ''
                  }`}
                  onClick={() => setExportFmt('ts')}
                >
                  TypeScript
                </button>
              </div>
              <div className="guideloop-tb-export">
                {steps.length === 0
                  ? '// Pick elements on the page to build steps'
                  : exportText}
              </div>
              <div className="guideloop-tb-row" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="guideloop-tb-btn primary"
                  disabled={!steps.length}
                  onClick={async () => {
                    const ok = await copyToClipboard(exportText);
                    showToast(ok ? 'Copied to clipboard' : 'Copy failed');
                  }}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="guideloop-tb-btn"
                  onClick={() => {
                    setShowImport((v) => !v);
                    setImportError(null);
                  }}
                >
                  Import
                </button>
              </div>
              {showImport && (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    className="guideloop-tb-field"
                    style={{
                      width: '100%',
                      minHeight: 80,
                      border: '1px solid #475569',
                      borderRadius: 8,
                      background: '#0f172a',
                      color: '#e2e8f0',
                      padding: 8,
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: 11,
                    }}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='[{ "target": "#x", "title": "…", "content": "…" }]'
                  />
                  {importError && (
                    <p style={{ color: '#fecaca', fontSize: 11, margin: '4px 0' }}>
                      {importError}
                    </p>
                  )}
                  <button
                    type="button"
                    className="guideloop-tb-btn success"
                    onClick={() => {
                      const result = importFromJson(importText);
                      if (!result.ok) {
                        setImportError(result.error);
                        return;
                      }
                      setSteps(result.steps);
                      setSelectedId(result.steps[0]?.id ?? null);
                      setImportError(null);
                      setShowImport(false);
                      setImportText('');
                      showToast(`Imported ${result.steps.length} step(s)`);
                    }}
                  >
                    Apply import
                  </button>
                </div>
              )}
              <p className="guideloop-tb-hint" style={{ marginTop: 8 }}>
                Draft auto-saves to localStorage. Paste export into your app as{' '}
                <code>steps</code> for <code>{'<GuideLoop />'}</code>.
              </p>
            </div>
          </div>

          <div className="guideloop-tb-footer" data-guideloop-builder>
            <button
              type="button"
              className={`guideloop-tb-btn${mode === 'pick' ? ' active' : ''}`}
              onClick={() => {
                setPreviewOpen(false);
                if (mode === 'pick') {
                  setMode('idle');
                  setPickIntent({ type: 'add' });
                } else {
                  setPickIntent({ type: 'add' });
                  setMode('pick');
                }
              }}
            >
              {mode === 'pick' ? 'Picking… (Esc / P)' : 'Pick element (P)'}
            </button>
            <button
              type="button"
              className="guideloop-tb-btn primary"
              disabled={!guideSteps.length}
              onClick={() => {
                setMode('idle');
                setPreviewOpen(true);
              }}
            >
              Preview tour
            </button>
            <button
              type="button"
              className="guideloop-tb-btn danger"
              disabled={!steps.length}
              onClick={() => {
                if (!window.confirm('Clear all builder steps?')) return;
                setSteps([]);
                setSelectedId(null);
                clearDraft(storageKey);
                showToast('Cleared');
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {mode === 'pick' && (
        <div className="guideloop-tb-banner" data-guideloop-builder>
          {pickIntent.type === 'repick'
            ? 'Click any element on the page to update this step’s target. Esc cancels.'
            : pickIntent.type === 'add-additional'
              ? 'Click an element to add a multi-spotlight target. Esc cancels.'
              : 'Pick mode: click any element on your live page to add a step. Esc cancels.'}
        </div>
      )}

      <PickerOverlay active={mode === 'pick'} onPick={onPick} />

      {toast && (
        <div className="guideloop-tb-toast" data-guideloop-builder role="status">
          {toast}
        </div>
      )}

      <GuideLoop
        steps={guideSteps}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onComplete={() => setPreviewOpen(false)}
        theme="tailwind"
        debug={false}
        zIndex={zIndex + 100}
      />
    </div>
  );

  return createPortal(ui, document.body);
};

export default TourBuilder;
