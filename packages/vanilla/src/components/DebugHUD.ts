/**
 * DOM DebugHUD component — floating development panel for tour introspection.
 * Pure DOM, no framework dependency.
 */

import type { StepStatus, StepTrigger, WaitForTargetConfig } from '@guideloop/core';
import type { DebugEvent, TargetDebugInfo } from '../core/DebugLogger';

export interface DebugSnapshot {
  currentStep: number;
  totalSteps: number;
  stepTitle: string | undefined;
  stepStatus: StepStatus;
  targetReady: boolean;
  targetWaiting: boolean;
  tourVisible: boolean;
  targets: TargetDebugInfo[];
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
  stepEnteredAt: number;
  events: DebugEvent[];
  persistKey?: string;
}

export interface DebugHUDOptions {
  snapshot: DebugSnapshot;
  zIndex?: number;
  defaultCollapsed?: boolean;
}

function statusColor(status: string): string {
  switch (status) {
    case 'success':
    case 'found':
    case 'ready':
      return 'background:#14532d;color:#86efac';
    case 'pending':
    case 'waiting':
      return 'background:#713f12;color:#fde68a';
    case 'error':
    case 'missing':
      return 'background:#7f1d1d;color:#fecaca';
    default:
      return 'background:#1e293b;color:#cbd5e1';
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const BADGE_BASE = 'display:inline-block;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:600';

export interface DebugHUDInstance {
  getElement: () => HTMLElement;
  mount: (parent: HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
  updateSnapshot: (snapshot: DebugSnapshot) => void;
}

export function createDebugHUD(options: DebugHUDOptions): DebugHUDInstance {
  const { snapshot: initialSnapshot, zIndex = 10000, defaultCollapsed = false } = options;

  let collapsed = defaultCollapsed;
  let now = Date.now();
  let tickInterval: number | undefined;
  let currentSnapshot = initialSnapshot;

  const panel = document.createElement('div');
  panel.className = 'guideloop-debug-hud';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'GuideLoop debug HUD');
  Object.assign(panel.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    width: '320px',
    maxHeight: '70vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
    fontSize: '11px',
    lineHeight: '1.4',
    color: '#e2e8f0',
    background: 'rgba(15, 23, 42, 0.94)',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(8px)',
    pointerEvents: 'auto',
    zIndex: String(zIndex),
  });

  // Header
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '8px 10px',
    borderBottom: '1px solid #334155',
    background: 'rgba(30, 41, 59, 0.9)',
    cursor: 'pointer',
    userSelect: 'none',
  });
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-expanded', String(!collapsed));

  header.addEventListener('click', () => {
    collapsed = !collapsed;
    header.setAttribute('aria-expanded', String(!collapsed));
    render();
  });

  panel.appendChild(header);

  // Body
  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '10px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  });
  panel.appendChild(body);

  function renderHeader(snap: DebugSnapshot) {
    const missing = snap.targets.filter((t) => !t.found);
    header.innerHTML = '';

    const left = document.createElement('div');
    Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '8px' });

    const dot = document.createElement('span');
    Object.assign(dot.style, {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: missing.length ? '#f87171' : '#4ade80',
      boxShadow: missing.length
        ? '0 0 0 3px rgba(248,113,113,0.25)'
        : '0 0 0 3px rgba(74,222,128,0.2)',
    });
    left.appendChild(dot);

    const title = document.createElement('strong');
    title.style.fontSize = '12px';
    title.style.color = '#f8fafc';
    title.textContent = 'GuideLoop Debug';
    left.appendChild(title);

    const statusBadge = document.createElement('span');
    statusBadge.style.cssText = BADGE_BASE + ';' + statusColor(snap.stepStatus);
    statusBadge.textContent = snap.stepStatus;
    left.appendChild(statusBadge);

    header.appendChild(left);

    const right = document.createElement('span');
    right.style.color = '#94a3b8';
    right.textContent = `${snap.currentStep + 1}/${snap.totalSteps} ${collapsed ? '▸' : '▾'}`;
    header.appendChild(right);
  }

  function renderBody(snap: DebugSnapshot) {
    body.innerHTML = '';
    if (collapsed) return;

    const stepDuration = Math.max(0, now - snap.stepEnteredAt);
    const missing = snap.targets.filter((t) => !t.found);

    // Step section
    const stepSection = createSection('Step');
    addRow(stepSection, 'Title', snap.stepTitle || '(untitled)');
    addRow(stepSection, 'Index', `${snap.currentStep} / ${Math.max(snap.totalSteps - 1, 0)}`);
    addRow(stepSection, 'On step', formatMs(stepDuration));
    addRowStatus(stepSection, 'Visible', snap.tourVisible ? 'ready' : 'idle', snap.tourVisible ? 'yes' : 'no');

    const targetStatus = snap.targetWaiting
      ? 'waiting'
      : snap.targetReady
        ? 'ready'
        : 'missing';
    const targetLabel = snap.targetWaiting
      ? 'waiting'
      : snap.targetReady
        ? 'ready'
        : 'not ready';
    addRowStatus(stepSection, 'Target ready', targetStatus, targetLabel);

    if (snap.trigger) addRow(stepSection, 'Trigger', snap.trigger);
    if (snap.persistKey) addRow(stepSection, 'Persist', snap.persistKey);
    body.appendChild(stepSection);

    // Targets section
    const targetsSection = createSection(
      `Targets${missing.length > 0 ? ` (${missing.length} missing)` : ''}`
    );
    const targetsList = document.createElement('div');
    Object.assign(targetsList.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      marginTop: '4px',
    });

    if (snap.targets.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = '#64748b';
      empty.textContent = 'No targets';
      targetsList.appendChild(empty);
    } else {
      for (const t of snap.targets) {
        targetsList.appendChild(createTargetRow(t));
      }
    }
    targetsSection.appendChild(targetsList);
    body.appendChild(targetsSection);

    // Events section
    const eventsSection = createSection('Event history');
    const eventsList = document.createElement('div');
    Object.assign(eventsList.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginTop: '4px',
      maxHeight: '140px',
      overflow: 'auto',
    });

    const recentEvents = snap.events.slice(-12).reverse();
    if (recentEvents.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = '#64748b';
      empty.textContent = 'No events yet';
      eventsList.appendChild(empty);
    } else {
      for (const e of recentEvents) {
        eventsList.appendChild(createEventRow(e));
      }
    }
    eventsSection.appendChild(eventsList);
    body.appendChild(eventsSection);
  }

  function render() {
    renderHeader(currentSnapshot);
    renderBody(currentSnapshot);
  }

  function startTick() {
    if (tickInterval !== undefined) return;
    tickInterval = window.setInterval(() => {
      now = Date.now();
      render();
    }, 250);
  }

  function stopTick() {
    if (tickInterval !== undefined) {
      window.clearInterval(tickInterval);
      tickInterval = undefined;
    }
  }

  // Initial render
  render();
  if (!collapsed) startTick();

  return {
    getElement: () => panel,
    mount(parent: HTMLElement) {
      parent.appendChild(panel);
    },
    unmount() {
      stopTick();
      if (panel.isConnected) {
        panel.remove();
      }
    },
    destroy() {
      this.unmount();
    },
    updateSnapshot(snapshot: DebugSnapshot) {
      currentSnapshot = snapshot;
      now = Date.now();
      if (!collapsed) {
        startTick();
      } else {
        stopTick();
      }
      render();
    },
  };
}

// ─── Helpers ───

function createSection(title: string): HTMLElement {
  const section = document.createElement('section');
  const h4 = document.createElement('h4');
  Object.assign(h4.style, {
    margin: '0',
    color: '#94a3b8',
    fontSize: '10px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  });
  h4.textContent = title;
  section.appendChild(h4);
  return section;
}

function addRow(parent: HTMLElement, label: string, value: string): void {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '2px',
  });
  const lbl = document.createElement('span');
  lbl.textContent = label;
  row.appendChild(lbl);
  const val = document.createElement('span');
  val.style.color = '#f8fafc';
  val.style.textAlign = 'right';
  val.textContent = value;
  row.appendChild(val);
  parent.appendChild(row);
}

function addRowStatus(
  parent: HTMLElement,
  label: string,
  status: string,
  displayValue: string
): void {
  const row = document.createElement('div');
  Object.assign(row.style, {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '2px',
  });
  const lbl = document.createElement('span');
  lbl.textContent = label;
  row.appendChild(lbl);
  const badge = document.createElement('span');
  badge.style.cssText = BADGE_BASE + ';' + statusColor(status);
  badge.textContent = displayValue;
  row.appendChild(badge);
  parent.appendChild(row);
}

function createTargetRow(target: TargetDebugInfo): HTMLElement {
  const row = document.createElement('div');
  Object.assign(row.style, {
    padding: '6px 8px',
    borderRadius: '6px',
    background: 'rgba(30, 41, 59, 0.7)',
    border: `1px solid ${target.found ? '#334155' : '#7f1d1d'}`,
  });

  const top = document.createElement('div');
  Object.assign(top.style, { display: 'flex', justifyContent: 'space-between', gap: '6px' });

  const code = document.createElement('code');
  code.style.color = '#f8fafc';
  code.style.wordBreak = 'break-all';
  code.textContent = target.selector;
  top.appendChild(code);

  const badge = document.createElement('span');
  badge.style.cssText = BADGE_BASE + ';' + statusColor(target.found ? 'found' : 'missing');
  badge.textContent = target.found ? 'found' : 'missing';
  top.appendChild(badge);

  row.appendChild(top);

  const info = document.createElement('div');
  info.style.color = '#94a3b8';
  info.style.marginTop = '4px';
  let infoText = target.role;
  if (target.shape) infoText += ` · ${target.shape}`;
  if (target.rect && target.found) {
    infoText += ` · ${Math.round(target.rect.width)}×${Math.round(target.rect.height)} @ (${Math.round(target.rect.left)},${Math.round(target.rect.top)})`;
  }
  info.textContent = infoText;
  row.appendChild(info);

  return row;
}

function createEventRow(event: DebugEvent): HTMLElement {
  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', gap: '6px', color: '#cbd5e1' });

  const ts = document.createElement('span');
  ts.style.color = '#64748b';
  ts.style.flexShrink = '0';
  ts.textContent = formatTime(event.ts);
  row.appendChild(ts);

  const type = document.createElement('span');
  type.style.color = '#38bdf8';
  type.style.flexShrink = '0';
  type.textContent = event.type;
  row.appendChild(type);

  const msg = document.createElement('span');
  msg.style.wordBreak = 'break-word';
  msg.textContent = event.message;
  row.appendChild(msg);

  return row;
}
