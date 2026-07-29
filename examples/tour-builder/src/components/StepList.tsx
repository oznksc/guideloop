import React, { useState } from 'react';
import type { BuilderStep } from '../lib/types';
import { validateSelector } from '../lib/selectors';

type Props = {
  steps: BuilderStep[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export function StepList({
  steps,
  selectedId,
  onSelect,
  onMove,
  onRemove,
  onDuplicate,
  onReorder,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (steps.length === 0) {
    return (
      <div className="empty">
        No steps yet. Press <kbd>P</kbd> or use <strong>Pick element</strong> to
        start.
      </div>
    );
  }

  return (
    <div className="step-list">
      {steps.map((step, index) => {
        const status = validateSelector(step.target).status;
        return (
          <div
            key={step.id}
            className={`step-item${selectedId === step.id ? ' selected' : ''}${
              dragIndex === index ? ' dragging' : ''
            }`}
            role="button"
            tabIndex={0}
            draggable
            onDragStart={(e) => {
              setDragIndex(index);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = Number(e.dataTransfer.getData('text/plain'));
              if (!Number.isNaN(from) && from !== index) {
                onReorder(from, index);
              }
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            onClick={() => onSelect(step.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(step.id);
              }
            }}
          >
            <span className="idx" title="Drag to reorder">
              {index + 1}
            </span>
            <div className="meta">
              <div className="title">
                <span className={`dot status-${status}`} title={status} />
                {step.title || '(untitled)'}
              </div>
              <div className="target">{step.target || '(no target)'}</div>
              {(step.additionalTargets?.length ?? 0) > 0 && (
                <div className="target extras-hint">
                  +{step.additionalTargets!.length} additional
                </div>
              )}
            </div>
            <div className="actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="icon-btn"
                title="Move up"
                disabled={index === 0}
                onClick={() => onMove(step.id, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Move down"
                disabled={index === steps.length - 1}
                onClick={() => onMove(step.id, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Duplicate"
                onClick={() => onDuplicate(step.id)}
              >
                ⧉
              </button>
              <button
                type="button"
                className="icon-btn"
                title="Remove"
                onClick={() => onRemove(step.id)}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
