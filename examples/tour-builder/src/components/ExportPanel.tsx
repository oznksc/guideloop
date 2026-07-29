import React, { useMemo, useRef, useState } from 'react';
import type { BuilderStep } from '../lib/types';
import {
  copyToClipboard,
  exportAsJson,
  exportAsTypeScript,
  importFromJson,
} from '../lib/export';

type Props = {
  steps: BuilderStep[];
  onImport: (steps: BuilderStep[]) => void;
};

export function ExportPanel({ steps, onImport }: Props) {
  const [format, setFormat] = useState<'json' | 'ts'>('json');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const output = useMemo(
    () => (format === 'json' ? exportAsJson(steps) : exportAsTypeScript(steps)),
    [format, steps]
  );

  const onCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const onDownload = () => {
    const blob = new Blob([output], {
      type: format === 'json' ? 'application/json' : 'text/typescript',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'json' ? 'guideloop-steps.json' : 'guideloop-steps.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = (raw: string) => {
    const result = importFromJson(raw);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    onImport(result.steps);
    setImportError(null);
    setImportOpen(false);
    setImportText('');
  };

  return (
    <div>
      <div className="tabs">
        <button
          type="button"
          className={`btn${format === 'json' ? ' primary' : ''}`}
          onClick={() => setFormat('json')}
        >
          JSON
        </button>
        <button
          type="button"
          className={`btn${format === 'ts' ? ' primary' : ''}`}
          onClick={() => setFormat('ts')}
        >
          TypeScript
        </button>
      </div>
      <div className="export-box" data-testid="export-output">
        {steps.length === 0 ? '// Add steps to export a tour config' : output}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <button type="button" className="btn primary" onClick={onCopy} disabled={!steps.length}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button type="button" className="btn" onClick={onDownload} disabled={!steps.length}>
          Download
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setImportOpen((v) => !v);
            setImportError(null);
          }}
        >
          Import JSON
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          Load file…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            const text = await file.text();
            applyImport(text);
          }}
        />
      </div>

      {importOpen && (
        <div className="import-box">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='Paste JSON array of steps, e.g. [{ "target": "#x", "title": "Hi", "content": "…" }]'
            rows={6}
          />
          {importError && <p className="error-text">{importError}</p>}
          <button
            type="button"
            className="btn success"
            onClick={() => applyImport(importText)}
          >
            Apply import
          </button>
        </div>
      )}

      <p className="hint">
        Paste into your app as <code>steps</code> for{' '}
        <code>{'<GuideLoop steps={…} />'}</code>. Drafts auto-save in{' '}
        <code>localStorage</code>.
      </p>
    </div>
  );
}
