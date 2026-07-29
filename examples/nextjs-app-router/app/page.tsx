import Link from 'next/link';
import { TourProvider } from '../components/TourProvider';
import { homeSteps } from '../lib/tour';

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/">Home</Link>
        <Link id="go-dashboard" href="/dashboard">
          Dashboard
        </Link>
      </nav>

      <div className="card">
        <span className="badge">Next.js App Router</span>
        <h1>GuideLoop multi-page tour</h1>
        <p>
          Start the tour here, then navigate to the dashboard. Progress is stored
          in <code>sessionStorage</code> via the <code>persist</code> prop so the
          tour can resume after the route change.
        </p>

        <div className="row">
          <TourProvider steps={homeSteps} />
        </div>

        <div className="panel">
          <strong>What this demonstrates</strong>
          <ul>
            <li>
              <code>&quot;use client&quot;</code> island for DOM-based tours
            </li>
            <li>
              <code>persist.autoRestore</code> across App Router navigations
            </li>
            <li>Local monorepo install via <code>guideloop: file:../..</code></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
