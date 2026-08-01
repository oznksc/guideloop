import { useMemo, useState } from 'react';
import { GuideLoop, type Step } from '@guideloop/react';

export default function App() {
  const [open, setOpen] = useState(false);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '#avatar',
        title: 'Circular spotlight',
        content: 'spotlightShape: "circle" fits avatars and icons.',
        placement: 'bottom',
        spotlightShape: 'circle',
      },
      {
        target: '#save-btn',
        title: 'Multi-spotlight',
        content:
          'Primary target is Save; Cancel and Help are highlighted via additionalTargets.',
        placement: 'top',
        additionalTargets: [
          '#cancel-btn',
          { selector: '#help-icon', shape: 'circle', padding: 6 },
        ],
      },
      {
        target: '#badge',
        title: 'Custom polygon',
        content: 'Polygon points are normalized 0–1 within the padded bbox.',
        placement: 'left',
        spotlightShape: {
          type: 'polygon',
          points: [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5],
          ],
        },
      },
    ],
    []
  );

  return (
    <div className="page">
      <div className="card">
        <span className="chip">Vite + React</span>
        <h1>Shapes & multi-spotlight</h1>
        <p className="muted">
          Minimal SPA showing advanced cutouts and the Debug HUD (
          <code>debug</code> forced on for this example).
        </p>

        <div className="toolbar">
          <button id="start-tour" className="primary" type="button" onClick={() => setOpen(true)}>
            Start tour
          </button>
        </div>

        <div className="grid">
          <div className="tile">
            <div id="avatar" className="avatar">
              OK
            </div>
            Profile
          </div>
          <div className="tile">
            <div id="badge" className="chip" style={{ fontSize: '0.9rem', padding: '0.45rem 0.8rem' }}>
              Pro plan
            </div>
            <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              Diamond cutout
            </div>
          </div>
          <div className="tile">
            <div className="actions">
              <button id="save-btn" className="primary" type="button">
                Save
              </button>
              <button id="cancel-btn" type="button">
                Cancel
              </button>
              <button id="help-icon" type="button" aria-label="Help">
                ?
              </button>
            </div>
          </div>
        </div>
      </div>

      <GuideLoop
        steps={steps}
        isOpen={open}
        onClose={() => setOpen(false)}
        onComplete={() => setOpen(false)}
        theme="tailwind"
        debug
      />
    </div>
  );
}
