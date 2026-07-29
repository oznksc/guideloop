import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { TourHost } from '../components/TourHost';
import { allSteps } from '../tour';

export const meta: MetaFunction = () => [{ title: 'Settings · GuideLoop Remix' }];

export default function Settings() {
  const [enabled, setEnabled] = useState(true);

  return (
    <main className="shell">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/settings">Settings</Link>
      </nav>

      <div className="card">
        <span className="chip">Route: /settings</span>
        <h1>Settings</h1>
        <p className="muted">
          After leaving the home tour mid-way, autoRestore should reopen the tour
          focused on the toggle below.
        </p>

        <div className="panel" id="settings-toggle">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Email notifications ({enabled ? 'on' : 'off'})
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <TourHost steps={allSteps} initialStep={2} startLabel="Resume / start tour" />
        </div>
      </div>
    </main>
  );
}
