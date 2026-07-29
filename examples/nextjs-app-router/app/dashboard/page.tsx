import Link from 'next/link';
import { TourProvider } from '../../components/TourProvider';
import { dashboardSteps, homeSteps } from '../../lib/tour';

export default function DashboardPage() {
  // Full step list so index 2 resolves after restore from the home page tour.
  const steps = [...homeSteps, ...dashboardSteps];

  return (
    <main className="shell">
      <nav className="nav">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>

      <div className="card">
        <span className="badge">Route: /dashboard</span>
        <h1>Dashboard</h1>
        <p>
          If you left the home tour mid-way with autoRestore enabled, GuideLoop
          should reopen here on the metric step.
        </p>

        <div className="panel" id="dashboard-metric">
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>1,284</div>
          <div style={{ color: 'var(--muted)' }}>Active users (demo metric)</div>
        </div>

        <div className="row" style={{ marginTop: '1.25rem' }}>
          <TourProvider steps={steps} initialStep={2} />
        </div>
      </div>
    </main>
  );
}
