import React, { useEffect, useState } from 'react';
import type { BuilderStep } from '../lib/types';
import { PLACEMENTS, SHAPES, TRIGGERS } from '../lib/types';
import { validateSelector } from '../lib/selectors';

type Props = {
  step: BuilderStep | null;
  onChange: (next: BuilderStep) => void;
  onRepick: () => void;
  onAddAdditional: () => void;
};

function StatusBadge({ selector }: { selector: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 800);
    return () => window.clearInterval(id);
  }, []);
  void tick;
  const { status, message } = validateSelector(selector);
  return (
    <span className={`status-badge status-${status}`} title={message}>
      {status === 'valid' && '✓ found'}
      {status === 'missing' && '✗ missing'}
      {status === 'invalid' && '! invalid'}
      {status === 'ambiguous' && `~ ${message}`}
      {status === 'empty' && '— empty'}
    </span>
  );
}

export function StepEditor({
  step,
  onChange,
  onRepick,
  onAddAdditional,
}: Props) {
  if (!step) {
    return (
      <div className="empty">
        Select a step to edit its title, content, and options — or pick an element
        from the canvas.
      </div>
    );
  }

  const patch = (partial: Partial<BuilderStep>) => onChange({ ...step, ...partial });
  const extras = step.additionalTargets ?? [];

  const removeExtra = (index: number) => {
    patch({
      additionalTargets: extras.filter((_, i) => i !== index),
    });
  };

  const updateExtra = (index: number, value: string) => {
    const next = [...extras];
    next[index] = value;
    patch({ additionalTargets: next });
  };

  return (
    <div>
      <div className="field">
        <label htmlFor="step-target">
          Target selector <StatusBadge selector={step.target} />
        </label>
        <input
          id="step-target"
          value={step.target}
          onChange={(e) => patch({ target: e.target.value })}
          spellCheck={false}
        />
        <button type="button" className="btn" style={{ marginTop: 6 }} onClick={onRepick}>
          Re-pick element
        </button>
      </div>

      <div className="field">
        <label htmlFor="step-title">Title</label>
        <input
          id="step-title"
          value={step.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="step-content">Content</label>
        <textarea
          id="step-content"
          value={step.content}
          onChange={(e) => patch({ content: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="step-placement">Placement</label>
        <select
          id="step-placement"
          value={step.placement}
          onChange={(e) =>
            patch({ placement: e.target.value as BuilderStep['placement'] })
          }
        >
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="step-shape">Spotlight shape</label>
        <select
          id="step-shape"
          value={step.spotlightShape}
          onChange={(e) =>
            patch({
              spotlightShape: e.target.value as BuilderStep['spotlightShape'],
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

      <div className="field">
        <label htmlFor="step-padding">Spotlight padding</label>
        <input
          id="step-padding"
          type="number"
          min={0}
          max={48}
          value={step.spotlightPadding ?? 8}
          onChange={(e) => patch({ spotlightPadding: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label htmlFor="step-trigger">Auto-advance trigger</label>
        <select
          id="step-trigger"
          value={step.trigger ?? ''}
          onChange={(e) =>
            patch({
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

      <div className="field">
        <label>
          Additional targets ({extras.length}){' '}
          <span className="muted-inline">multi-spotlight</span>
        </label>
        {extras.map((sel, index) => (
          <div key={`${index}-${sel}`} className="extra-row">
            <input
              value={sel}
              spellCheck={false}
              onChange={(e) => updateExtra(index, e.target.value)}
              aria-label={`Additional target ${index + 1}`}
            />
            <StatusBadge selector={sel} />
            <button
              type="button"
              className="icon-btn"
              title="Remove"
              onClick={() => removeExtra(index)}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn" onClick={onAddAdditional}>
          + Pick additional target
        </button>
      </div>
    </div>
  );
}
