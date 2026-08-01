'use client';

import React, { useEffect, useState } from 'react';
import type { DebugHUDProps, DebugEvent, TargetDebugInfo } from './types';

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  right: 12,
  bottom: 12,
  width: 320,
  maxHeight: '70vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 11,
  lineHeight: 1.4,
  color: '#e2e8f0',
  background: 'rgba(15, 23, 42, 0.94)',
  border: '1px solid #334155',
  borderRadius: 8,
  boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
  backdropFilter: 'blur(8px)',
  pointerEvents: 'auto',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '8px 10px',
  borderBottom: '1px solid #334155',
  background: 'rgba(30, 41, 59, 0.9)',
  cursor: 'pointer',
  userSelect: 'none',
};

const bodyStyle: React.CSSProperties = {
  padding: 10,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  color: '#94a3b8',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  marginTop: 2,
};

const badgeBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 600,
};

function statusColor(status: string): React.CSSProperties {
  switch (status) {
    case 'success':
    case 'found':
    case 'ready':
      return { ...badgeBase, background: '#14532d', color: '#86efac' };
    case 'pending':
    case 'waiting':
      return { ...badgeBase, background: '#713f12', color: '#fde68a' };
    case 'error':
    case 'missing':
      return { ...badgeBase, background: '#7f1d1d', color: '#fecaca' };
    default:
      return { ...badgeBase, background: '#1e293b', color: '#cbd5e1' };
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

function TargetRow({ target }: { target: TargetDebugInfo }) {
  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        background: 'rgba(30, 41, 59, 0.7)',
        border: `1px solid ${target.found ? '#334155' : '#7f1d1d'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
        <code style={{ color: '#f8fafc', wordBreak: 'break-all' }}>{target.selector}</code>
        <span style={statusColor(target.found ? 'found' : 'missing')}>
          {target.found ? 'found' : 'missing'}
        </span>
      </div>
      <div style={{ color: '#94a3b8', marginTop: 4 }}>
        {target.role}
        {target.shape ? ` · ${target.shape}` : ''}
        {target.rect && target.found
          ? ` · ${Math.round(target.rect.width)}×${Math.round(target.rect.height)} @ (${Math.round(
              target.rect.left
            )},${Math.round(target.rect.top)})`
          : ''}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: DebugEvent }) {
  return (
    <div style={{ display: 'flex', gap: 6, color: '#cbd5e1' }}>
      <span style={{ color: '#64748b', flexShrink: 0 }}>{formatTime(event.ts)}</span>
      <span style={{ color: '#38bdf8', flexShrink: 0 }}>{event.type}</span>
      <span style={{ wordBreak: 'break-word' }}>{event.message}</span>
    </div>
  );
}

/**
 * Development-only floating panel for tour introspection.
 * Always mounted only when the host opts in / auto-enables in non-production.
 */
export const DebugHUD: React.FC<DebugHUDProps> = ({
  snapshot,
  zIndex = 10000,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (collapsed) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [collapsed]);

  const stepDuration = Math.max(0, now - snapshot.stepEnteredAt);
  const missing = snapshot.targets.filter((t) => !t.found);
  const recentEvents = snapshot.events.slice(-12).reverse();

  return (
    <div
      className="guideloop-debug-hud"
      data-testid="guideloop-debug-hud"
      style={{ ...panelStyle, zIndex }}
      role="region"
      aria-label="GuideLoop debug HUD"
    >
      <div
        style={headerStyle}
        onClick={() => setCollapsed((c) => !c)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCollapsed((c) => !c);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: missing.length ? '#f87171' : '#4ade80',
              boxShadow: missing.length
                ? '0 0 0 3px rgba(248,113,113,0.25)'
                : '0 0 0 3px rgba(74,222,128,0.2)',
            }}
          />
          <strong style={{ fontSize: 12, color: '#f8fafc' }}>GuideLoop Debug</strong>
          <span style={statusColor(snapshot.stepStatus)}>{snapshot.stepStatus}</span>
        </div>
        <span style={{ color: '#94a3b8' }}>
          {snapshot.currentStep + 1}/{snapshot.totalSteps} {collapsed ? '▸' : '▾'}
        </span>
      </div>

      {!collapsed && (
        <div style={bodyStyle}>
          <section>
            <h4 style={sectionTitle}>Step</h4>
            <div style={rowStyle}>
              <span>Title</span>
              <span style={{ color: '#f8fafc', textAlign: 'right' }}>
                {snapshot.stepTitle || '(untitled)'}
              </span>
            </div>
            <div style={rowStyle}>
              <span>Index</span>
              <span>
                {snapshot.currentStep} / {Math.max(snapshot.totalSteps - 1, 0)}
              </span>
            </div>
            <div style={rowStyle}>
              <span>On step</span>
              <span>{formatMs(stepDuration)}</span>
            </div>
            <div style={rowStyle}>
              <span>Visible</span>
              <span style={statusColor(snapshot.tourVisible ? 'ready' : 'idle')}>
                {snapshot.tourVisible ? 'yes' : 'no'}
              </span>
            </div>
            <div style={rowStyle}>
              <span>Target ready</span>
              <span
                style={statusColor(
                  snapshot.targetWaiting
                    ? 'waiting'
                    : snapshot.targetReady
                      ? 'ready'
                      : 'missing'
                )}
              >
                {snapshot.targetWaiting
                  ? 'waiting'
                  : snapshot.targetReady
                    ? 'ready'
                    : 'not ready'}
              </span>
            </div>
            {snapshot.trigger && (
              <div style={rowStyle}>
                <span>Trigger</span>
                <span style={{ color: '#f8fafc' }}>{snapshot.trigger}</span>
              </div>
            )}
            {snapshot.waitForTarget !== undefined && (
              <div style={rowStyle}>
                <span>waitForTarget</span>
                <span style={{ color: '#f8fafc' }}>
                  {typeof snapshot.waitForTarget === 'object'
                    ? JSON.stringify(snapshot.waitForTarget)
                    : String(snapshot.waitForTarget)}
                </span>
              </div>
            )}
            {snapshot.persistKey && (
              <div style={rowStyle}>
                <span>Persist</span>
                <span style={{ color: '#f8fafc' }}>{snapshot.persistKey}</span>
              </div>
            )}
          </section>

          <section>
            <h4 style={sectionTitle}>
              Targets {missing.length > 0 ? `(${missing.length} missing)` : ''}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {snapshot.targets.length === 0 ? (
                <div style={{ color: '#64748b' }}>No targets</div>
              ) : (
                snapshot.targets.map((t) => (
                  <TargetRow key={`${t.role}-${t.selector}`} target={t} />
                ))
              )}
            </div>
          </section>

          <section>
            <h4 style={sectionTitle}>Event history</h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                marginTop: 4,
                maxHeight: 140,
                overflow: 'auto',
              }}
            >
              {recentEvents.length === 0 ? (
                <div style={{ color: '#64748b' }}>No events yet</div>
              ) : (
                recentEvents.map((e) => <EventRow key={e.id} event={e} />)
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DebugHUD;
