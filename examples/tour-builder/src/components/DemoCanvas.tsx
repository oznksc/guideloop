import React from 'react';

/**
 * Sample product UI used as the pick target surface.
 * Prefer stable #ids so exported selectors stay readable.
 */
export function DemoCanvas() {
  return (
    <div className="canvas" id="builder-canvas" data-tour-id="canvas-root">
      <div className="canvas-card">
        <h2 id="hero-title">Acme Dashboard</h2>
        <p id="hero-copy">
          Click <strong>Pick element</strong> in the toolbar, then click any control
          below to add a tour step. Edit title/content on the right, reorder on the
          left, then export JSON or TypeScript.
        </p>

        <div className="canvas-row">
          <input id="search-input" type="search" placeholder="Search projects…" />
          <select id="filter-select" defaultValue="all" aria-label="Filter">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button id="new-project-btn" className="primary" type="button">
            New project
          </button>
          <button id="notifications-btn" type="button" aria-label="Notifications">
            🔔
          </button>
        </div>

        <div className="stats">
          <div className="stat" id="metric-users">
            <strong>1,284</strong>
            <span>Active users</span>
          </div>
          <div className="stat" id="metric-revenue">
            <strong>$48.2k</strong>
            <span>MRR</span>
          </div>
          <div className="stat" id="metric-churn">
            <strong>2.1%</strong>
            <span>Churn</span>
          </div>
        </div>

        <div className="canvas-row" style={{ marginTop: '1.25rem' }}>
          <button id="settings-btn" type="button">
            Settings
          </button>
          <button id="invite-btn" type="button">
            Invite team
          </button>
          <button id="help-btn" type="button">
            Help
          </button>
        </div>
      </div>
    </div>
  );
}
