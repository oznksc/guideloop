import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GuideLoop, type Step } from '@guideloop/react';
import { DemoCanvas } from './components/DemoCanvas';
import { ExportPanel } from './components/ExportPanel';
import { PickerOverlay } from './components/PickerOverlay';
import { StepEditor } from './components/StepEditor';
import { StepList } from './components/StepList';
import {
  createEmptyStep,
  type BuilderMode,
  type BuilderStep,
  type PickIntent,
} from './lib/types';
import { validateSelector } from './lib/selectors';
import { clearDraft, loadDraft, saveDraft } from './lib/storage';
import { cloneSnapshot, pushHistory, type HistorySnapshot } from './lib/history';

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
  const clean = label.replace(/\s+/g, ' ').slice(0, 48);
  return clean || 'New step';
}

export default function App() {
  const restored = useRef(loadDraft());
  const [steps, setSteps] = useState<BuilderStep[]>(
    () => restored.current?.steps ?? []
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () => restored.current?.selectedId ?? null
  );
  const [mode, setMode] = useState<BuilderMode>('idle');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pickIntent, setPickIntent] = useState<PickIntent>({ type: 'add' });
  const [toast, setToast] = useState<string | null>(null);
  const pastRef = useRef<HistorySnapshot[]>([]);
  const futureRef = useRef<HistorySnapshot[]>([]);
  const skipHistory = useRef(false);

  const selected = useMemo(
    () => steps.find((s) => s.id === selectedId) ?? null,
    [steps, selectedId]
  );

  const guideSteps = useMemo(() => toGuideSteps(steps), [steps]);

  const issues = useMemo(() => {
    const problems: string[] = [];
    steps.forEach((s, i) => {
      const v = validateSelector(s.target);
      if (v.status === 'empty') problems.push(`Step ${i + 1}: empty target`);
      if (v.status === 'missing') problems.push(`Step ${i + 1}: target not found`);
      if (v.status === 'invalid') problems.push(`Step ${i + 1}: invalid selector`);
      (s.additionalTargets ?? []).forEach((t, j) => {
        const av = validateSelector(t);
        if (av.status === 'missing' || av.status === 'invalid') {
          problems.push(`Step ${i + 1} extra #${j + 1}: ${av.message}`);
        }
      });
    });
    return problems;
  }, [steps]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  // Persist draft
  useEffect(() => {
    saveDraft(steps, selectedId);
  }, [steps, selectedId]);

  // History: record after steps/selection change (not on undo/redo)
  useEffect(() => {
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    pastRef.current = pushHistory(pastRef.current, { steps, selectedId });
    futureRef.current = [];
  }, [steps, selectedId]);

  const commit = useCallback(
    (nextSteps: BuilderStep[], nextSelected: string | null = selectedId) => {
      setSteps(nextSteps);
      setSelectedId(nextSelected);
    },
    [selectedId]
  );

  const undo = useCallback(() => {
    if (pastRef.current.length < 2) return;
    const current = pastRef.current.pop();
    if (!current) return;
    futureRef.current.push(current);
    const prev = pastRef.current[pastRef.current.length - 1];
    if (!prev) return;
    skipHistory.current = true;
    setSteps(cloneSnapshot(prev).steps);
    setSelectedId(prev.selectedId);
    showToast('Undid last change');
  }, [showToast]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current = pushHistory(pastRef.current, next);
    skipHistory.current = true;
    setSteps(cloneSnapshot(next).steps);
    setSelectedId(next.selectedId);
    showToast('Redid change');
  }, [showToast]);

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
        showToast(`Updated target → ${selector}`);
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
        showToast(`Added additional target ${selector}`);
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
      showToast(`Added step → ${selector}`);
    },
    [pickIntent, showToast]
  );

  const updateStep = (next: BuilderStep) => {
    setSteps((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  };

  const moveStep = (id: string, direction: -1 | 1) => {
    setSteps((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    setSteps((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateStep = (id: string) => {
    const index = steps.findIndex((s) => s.id === id);
    if (index < 0) return;
    const source = steps[index];
    const { id: _omit, ...rest } = source;
    const clone = createEmptyStep({
      ...rest,
      title: `${source.title} (copy)`,
      additionalTargets: [...(source.additionalTargets ?? [])],
    });
    const copy = [...steps];
    copy.splice(index + 1, 0, clone);
    commit(copy, clone.id);
  };

  const startPick = () => {
    setPreviewOpen(false);
    if (mode === 'pick') {
      setMode('idle');
      setPickIntent({ type: 'add' });
      return;
    }
    setPickIntent({ type: 'add' });
    setMode('pick');
  };

  const startRepick = () => {
    if (!selected) return;
    setPreviewOpen(false);
    setPickIntent({ type: 'repick', stepId: selected.id });
    setMode('pick');
  };

  const startAddAdditional = () => {
    if (!selected) return;
    setPreviewOpen(false);
    setPickIntent({ type: 'add-additional', stepId: selected.id });
    setMode('pick');
  };

  const runPreview = () => {
    if (!guideSteps.length) {
      showToast('Add at least one step with a target');
      return;
    }
    if (issues.length) {
      showToast(`Warning: ${issues[0]}`);
    }
    setMode('idle');
    setPickIntent({ type: 'add' });
    setPreviewOpen(true);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.key === 'Escape') {
        if (mode === 'pick') {
          setMode('idle');
          setPickIntent({ type: 'add' });
          event.preventDefault();
        } else if (previewOpen) {
          setPreviewOpen(false);
        }
        return;
      }

      if (typing) return;

      const meta = event.metaKey || event.ctrlKey;

      if (!meta && (event.key === 'p' || event.key === 'P')) {
        event.preventDefault();
        startPick();
        return;
      }

      if (meta && event.key === 'Enter') {
        event.preventDefault();
        runPreview();
        return;
      }

      if (meta && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (meta && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, previewOpen, undo, redo, guideSteps.length, issues]);

  const pickBanner =
    mode === 'pick'
      ? pickIntent.type === 'repick'
        ? 'Re-pick mode: click a canvas element to update this step’s target. Esc cancels.'
        : pickIntent.type === 'add-additional'
          ? 'Additional target: click a canvas element to multi-spotlight it. Esc cancels.'
          : 'Pick mode: hover the demo UI, click to add a step. Esc cancels.'
      : null;

  return (
    <div className="app">
      <header className="toolbar" data-builder-chrome>
        <h1>GuideLoop Visual Tour Builder</h1>
        <span className="badge">MVP+</span>
        <div className="spacer" />
        <button type="button" className="btn" onClick={undo} title="⌘/Ctrl+Z">
          Undo
        </button>
        <button type="button" className="btn" onClick={redo} title="⌘/Ctrl+Shift+Z">
          Redo
        </button>
        <button
          type="button"
          className={`btn${mode === 'pick' ? ' active' : ''}`}
          onClick={startPick}
          title="P"
        >
          {mode === 'pick' ? 'Picking… (Esc)' : 'Pick element'}
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={runPreview}
          disabled={!guideSteps.length}
          title="⌘/Ctrl+Enter"
        >
          Preview tour
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            if (steps.length && !window.confirm('Clear all steps and draft?')) {
              return;
            }
            commit([], null);
            clearDraft();
            setPreviewOpen(false);
            showToast('Cleared');
          }}
          disabled={!steps.length}
        >
          Clear
        </button>
      </header>

      <aside className="sidebar" data-builder-chrome>
        <h2 className="panel-title">Steps ({steps.length})</h2>
        <StepList
          steps={steps}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={moveStep}
          onRemove={removeStep}
          onDuplicate={duplicateStep}
          onReorder={reorder}
        />
        {issues.length > 0 && (
          <div className="issues">
            <strong>{issues.length} issue(s)</strong>
            <ul>
              {issues.slice(0, 4).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="hint">
          <kbd>P</kbd> pick · <kbd>⌘/Ctrl+Enter</kbd> preview · drag steps to
          reorder · draft auto-saves
        </p>
      </aside>

      <main className="canvas-wrap">
        {pickBanner && <p className="picker-banner">{pickBanner}</p>}
        <DemoCanvas />
      </main>

      <aside className="inspector" data-builder-chrome>
        <h2 className="panel-title">Step editor</h2>
        <StepEditor
          step={selected}
          onChange={updateStep}
          onRepick={startRepick}
          onAddAdditional={startAddAdditional}
        />
        <h2 className="panel-title" style={{ marginTop: '1.25rem' }}>
          Export / import
        </h2>
        <ExportPanel
          steps={steps}
          onImport={(imported) => {
            commit(imported, imported[0]?.id ?? null);
            showToast(`Imported ${imported.length} step(s)`);
          }}
        />
      </aside>

      <PickerOverlay active={mode === 'pick'} onPick={onPick} />

      {toast && (
        <div className="toast" role="status" data-builder-chrome>
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
      />
    </div>
  );
}
