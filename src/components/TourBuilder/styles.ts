const STYLE_ID = 'guideloop-tour-builder-styles';

const CSS = `
.guideloop-tb-fab {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: var(--gl-tb-z, 2147483000);
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.02em;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.45);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
.guideloop-tb-fab:hover { filter: brightness(1.08); }
.guideloop-tb-fab[data-open="true"] {
  background: #0f172a;
  box-shadow: 0 0 0 2px #38bdf8;
}
.guideloop-tb-panel {
  position: fixed;
  top: 12px;
  right: 12px;
  bottom: 12px;
  width: min(380px, calc(100vw - 24px));
  z-index: calc(var(--gl-tb-z, 2147483000) + 1);
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.96);
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 13px;
  overflow: hidden;
}
.guideloop-tb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #334155;
  background: rgba(30, 41, 59, 0.9);
}
.guideloop-tb-header strong { font-size: 13px; }
.guideloop-tb-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: #1e3a5f;
  color: #93c5fd;
}
.guideloop-tb-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.guideloop-tb-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid #334155;
  background: rgba(15, 23, 42, 0.9);
}
.guideloop-tb-btn {
  appearance: none;
  border: 1px solid #475569;
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 7px 10px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.guideloop-tb-btn:hover { filter: brightness(1.1); }
.guideloop-tb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.guideloop-tb-btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  font-weight: 600;
}
.guideloop-tb-btn.success {
  background: #16a34a;
  border-color: #16a34a;
  color: #fff;
  font-weight: 600;
}
.guideloop-tb-btn.danger {
  background: transparent;
  border-color: #7f1d1d;
  color: #fecaca;
}
.guideloop-tb-btn.active {
  outline: 2px solid #f59e0b;
  outline-offset: 1px;
}
.guideloop-tb-section-title {
  margin: 0 0 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}
.guideloop-tb-step {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: start;
  width: 100%;
  text-align: left;
  border: 1px solid #334155;
  background: #1e293b;
  color: inherit;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font: inherit;
  margin-bottom: 6px;
}
.guideloop-tb-step.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
.guideloop-tb-step .idx {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #0f172a;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #93c5fd;
}
.guideloop-tb-step .title {
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.guideloop-tb-step .target {
  font-size: 11px;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.guideloop-tb-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.guideloop-tb-field label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}
.guideloop-tb-field input,
.guideloop-tb-field select,
.guideloop-tb-field textarea {
  border: 1px solid #475569;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 7px 9px;
  font: inherit;
  font-size: 12px;
}
.guideloop-tb-field textarea { min-height: 72px; resize: vertical; }
.guideloop-tb-export {
  border: 1px solid #334155;
  border-radius: 8px;
  background: #020617;
  padding: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  line-height: 1.4;
  color: #cbd5e1;
  max-height: 140px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.guideloop-tb-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: calc(var(--gl-tb-z, 2147483000) + 2);
  padding: 10px 16px;
  text-align: center;
  background: rgba(245, 158, 11, 0.18);
  border-bottom: 1px solid rgba(245, 158, 11, 0.5);
  color: #fde68a;
  font-size: 13px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  pointer-events: none;
}
.guideloop-pick-ring {
  position: fixed;
  pointer-events: none;
  z-index: calc(var(--gl-tb-z, 2147483000) + 3);
  border: 2px solid #f59e0b;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.12);
  box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.2);
}
.guideloop-pick-label {
  position: fixed;
  pointer-events: none;
  z-index: calc(var(--gl-tb-z, 2147483000) + 4);
  max-width: min(420px, 80vw);
  padding: 3px 7px;
  border-radius: 6px;
  background: #0f172a;
  border: 1px solid #f59e0b;
  color: #fde68a;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.guideloop-tb-status {
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  text-transform: none;
  letter-spacing: 0;
}
.guideloop-tb-status.valid { background: #14532d; color: #86efac; }
.guideloop-tb-status.missing,
.guideloop-tb-status.invalid { background: #7f1d1d; color: #fecaca; }
.guideloop-tb-status.ambiguous { background: #713f12; color: #fde68a; }
.guideloop-tb-status.empty { background: #1e293b; color: #94a3b8; }
.guideloop-tb-empty {
  color: #94a3b8;
  font-size: 12px;
  padding: 10px;
  border: 1px dashed #334155;
  border-radius: 10px;
}
.guideloop-tb-toast {
  position: fixed;
  bottom: 84px;
  left: 20px;
  z-index: calc(var(--gl-tb-z, 2147483000) + 5);
  padding: 8px 12px;
  border-radius: 999px;
  background: #0f172a;
  border: 1px solid #38bdf8;
  color: #e2e8f0;
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  pointer-events: none;
}
.guideloop-tb-hint {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.45;
}
.guideloop-tb-row { display: flex; flex-wrap: wrap; gap: 6px; }
.guideloop-tb-icon {
  appearance: none;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px 4px;
  font-size: 12px;
}
.guideloop-tb-icon:hover { color: #e2e8f0; }
.guideloop-tb-icon:disabled { opacity: 0.35; cursor: not-allowed; }
`;

export function injectTourBuilderStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
