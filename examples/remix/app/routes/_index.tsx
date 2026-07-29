import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { TourHost } from '../components/TourHost';
import { allSteps } from '../tour';

export const meta: MetaFunction = () => [
  { title: 'GuideLoop · Remix' },
  { name: 'description', content: 'Multi-route GuideLoop tour with Remix' },
];

export default function Index() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link id="link-settings" to="/settings">
          Settings
        </Link>
      </nav>

      <div className="card">
        <span className="chip">Remix + Vite</span>
        <h1>Multi-route product tour</h1>
        <p className="muted">
          GuideLoop works as a client component inside Remix routes. Use{' '}
          <code>persist.autoRestore</code> so the tour survives client-side
          navigations.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <TourHost steps={allSteps.slice(0, 2)} />
        </div>
      </div>
    </main>
  );
}
