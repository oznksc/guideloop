"use client";

import { useState } from "react";
import {
  Bell,
  Board,
  Check,
  Flag,
  GuideLoopLogo,
  Search,
  Timeline,
  Users,
} from "./DemoIcons";

interface ProductWorkspaceProps {
  onStartTour: () => void;
}

type WorkspaceTabId = "overview" | "timeline" | "team";

interface WorkspaceRow {
  name: string;
  owner: string;
  date: string;
  status: string;
}

interface WorkspaceView {
  kicker: string;
  title: string;
  summaryLabel: string;
  summaryValue: string;
  progress: string;
  facts: [[string, string], [string, string]];
  tableKicker: string;
  tableTitle: string;
  tableAction: string;
  actionTab: WorkspaceTabId;
  columns: [string, string, string, string];
  quickTitle: string;
  quickDescription: string;
  quickLabel: string;
  quickPlaceholder: string;
  quickButton: string;
  savedMessage: string;
}

const workspaceTabs: Array<{
  id: WorkspaceTabId;
  label: string;
  icon: typeof Board;
}> = [
  { id: "overview", label: "Launch board", icon: Board },
  { id: "timeline", label: "Timeline", icon: Timeline },
  { id: "team", label: "Team", icon: Users },
];

const workspaceViews: Record<WorkspaceTabId, WorkspaceView> = {
  overview: {
    kicker: "Fall release · 2026",
    title: "Launch board",
    summaryLabel: "Launch readiness",
    summaryValue: "7 of 9 items ready",
    progress: "77.7%",
    facts: [
      ["Next review", "Tue · 14:00"],
      ["Target Launch", "Aug 14"],
    ],
    tableKicker: "Critical path",
    tableTitle: "Milestones",
    tableAction: "View timeline",
    actionTab: "timeline",
    columns: ["Milestone", "Owner", "Date", "Status"],
    quickTitle: "Add a milestone",
    quickDescription: "Keep the launch path visible to everyone.",
    quickLabel: "Milestone name",
    quickPlaceholder: "e.g. Release candidate",
    quickButton: "Add milestone",
    savedMessage: "added to the launch board.",
  },
  timeline: {
    kicker: "Sequence & dependencies",
    title: "Launch timeline",
    summaryLabel: "Timeline confidence",
    summaryValue: "4 of 5 dates locked",
    progress: "80%",
    facts: [
      ["Next gate", "Docs review"],
      ["Beta opens", "Aug 05"],
    ],
    tableKicker: "Key dates",
    tableTitle: "Timeline",
    tableAction: "View team",
    actionTab: "team",
    columns: ["Moment", "Owner", "Date", "Status"],
    quickTitle: "Add a timeline note",
    quickDescription: "Record a date or dependency for the launch.",
    quickLabel: "Note title",
    quickPlaceholder: "e.g. Beta opens",
    quickButton: "Add note",
    savedMessage: "added to the timeline.",
  },
  team: {
    kicker: "Ownership & review",
    title: "Launch team",
    summaryLabel: "Team coverage",
    summaryValue: "5 roles assigned",
    progress: "90%",
    facts: [
      ["Lead", "Mira Chen"],
      ["Reviewers", "3 active"],
    ],
    tableKicker: "Working group",
    tableTitle: "Team",
    tableAction: "Back to board",
    actionTab: "overview",
    columns: ["Teammate", "Role", "Focus", "Status"],
    quickTitle: "Invite a teammate",
    quickDescription: "Add a collaborator to this sample workspace.",
    quickLabel: "Email or name",
    quickPlaceholder: "alex@example.com",
    quickButton: "Send invite",
    savedMessage: "invited to the sample team.",
  },
};

const initialRows: Record<WorkspaceTabId, WorkspaceRow[]> = {
  overview: [
    {
      name: "Private beta",
      owner: "Mira Chen",
      date: "Aug 05",
      status: "Ready",
    },
    {
      name: "Docs review",
      owner: "Leo Martin",
      date: "Aug 08",
      status: "In review",
    },
    {
      name: "Public launch",
      owner: "Core team",
      date: "Aug 14",
      status: "Planned",
    },
  ],
  timeline: [
    {
      name: "Design lock",
      owner: "Mira Chen",
      date: "Jul 30",
      status: "Ready",
    },
    {
      name: "Private beta",
      owner: "Core team",
      date: "Aug 05",
      status: "In review",
    },
    {
      name: "Public launch",
      owner: "Leo Martin",
      date: "Aug 14",
      status: "Planned",
    },
  ],
  team: [
    {
      name: "Mira Chen",
      owner: "Product lead",
      date: "Direction",
      status: "Active",
    },
    {
      name: "Leo Martin",
      owner: "Docs lead",
      date: "Readiness",
      status: "Active",
    },
    {
      name: "Core team",
      owner: "Engineering",
      date: "Delivery",
      status: "Active",
    },
  ],
};

export function ProductWorkspace({
  onStartTour,
}: ProductWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");
  const [showActivity, setShowActivity] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [savedMilestone, setSavedMilestone] = useState("");
  const [rowsByTab, setRowsByTab] = useState(initialRows);
  const [searchQuery, setSearchQuery] = useState("");

  const activeView = workspaceViews[activeTab];
  const ActiveRowIcon =
    activeTab === "timeline" ? Timeline : activeTab === "team" ? Users : Flag;

  const addWorkspaceRow = () => {
    const value = milestoneDraft.trim();
    if (!value) return;

    const metadata: Record<
      WorkspaceTabId,
      Pick<WorkspaceRow, "owner" | "date" | "status">
    > = {
      overview: { owner: "You", date: "TBD", status: "Planned" },
      timeline: { owner: "You", date: "TBD", status: "Planned" },
      team: { owner: "Contributor", date: "Launch", status: "Invited" },
    };

    setRowsByTab((current) => ({
      ...current,
      [activeTab]: [
        ...current[activeTab],
        { name: value, ...metadata[activeTab] },
      ],
    }));
    setSavedMilestone(value);
    setMilestoneDraft("");
  };

  return (
    <div className="product-shell">
      <header className="product-topbar">
        <div className="product-brand">
          <span className="product-brand__mark">
            <GuideLoopLogo className="h-6 w-auto" />
          </span>
          <span className="product-brand__title">Acme Launch Hub</span>
          <span className="product-badge">Embedded App</span>
        </div>

        <div className="product-topbar__actions">
          <div id="search-bar" className="product-search-input-wrapper">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspace..."
              className="product-search-input"
            />
          </div>

          <div className="activity-anchor">
            <button
              id="notifications"
              type="button"
              className="product-icon-button"
              aria-label="Open activity"
              aria-expanded={showActivity}
              onClick={() => setShowActivity((visible) => !visible)}
            >
              <Bell className="w-4 h-4" />
              <span className="product-notification-dot" aria-hidden="true" />
            </button>

            {showActivity && (
              <div className="activity-popover" role="status">
                <div className="activity-popover__header">
                  <strong>Recent activity</strong>
                  <span>Live feed</span>
                </div>
                <p>
                  <span className="activity-dot activity-dot--done" />
                  Docs review moved to in review.
                </p>
                <p>
                  <span className="activity-dot" />
                  Mira added a launch note.
                </p>
              </div>
            )}
          </div>

          <span className="product-avatar" aria-label="Mira Chen">
            MC
          </span>
        </div>
      </header>

      <div className="product-layout">
        <aside id="tab-section" className="product-sidebar" aria-label="Workspace">
          <div>
            <p className="product-sidebar__label">NAVIGATION</p>
            <nav>
              {workspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="product-sidebar__footer">
            <span className="product-team-stack" aria-hidden="true">
              <i>MC</i>
              <i>LM</i>
              <i>+3</i>
            </span>
            <span>5 collaborators</span>
          </div>
        </aside>

        <section className="product-main" aria-label="Sample launch workspace">
          <div className="product-heading-row">
            <div>
              <p className="product-kicker">{activeView.kicker}</p>
              <h3>{activeView.title}</h3>
            </div>
            <button
              id="help-button"
              type="button"
              className="product-tour-button"
              onClick={() => {
                setActiveTab("overview");
                window.setTimeout(onStartTour, 0);
              }}
            >
              <GuideLoopLogo className="h-5 w-auto" />
              <span>Start Product Tour</span>
            </button>
          </div>

          <section
            id="stats-section"
            className="launch-summary"
            aria-label="Sample launch readiness"
          >
            <div>
              <span className="launch-summary__label">
                {activeView.summaryLabel}
              </span>
              <strong>{activeView.summaryValue}</strong>
            </div>
            <div className="launch-progress" aria-hidden="true">
              <span style={{ inlineSize: activeView.progress }} />
            </div>
            <dl>
              {activeView.facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="product-content-grid">
            <section id="table-section" className="milestones">
              <div className="product-section-heading">
                <div>
                  <p className="product-kicker">{activeView.tableKicker}</p>
                  <h4>{activeView.tableTitle}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeView.actionTab)}
                >
                  {activeView.tableAction} →
                </button>
              </div>

              <div className="milestone-table" role="table" aria-label="Sample milestones">
                <div className="milestone-row milestone-row--head" role="row">
                  {activeView.columns.map((column) => (
                    <span role="columnheader" key={column}>
                      {column}
                    </span>
                  ))}
                </div>
                {rowsByTab[activeTab].map((row) => (
                  <div
                    className="milestone-row"
                    role="row"
                    key={`${activeTab}-${row.name}`}
                  >
                    <span role="cell">
                      <i className="milestone-icon">
                        <ActiveRowIcon className="w-4 h-4" />
                      </i>
                      <strong>{row.name}</strong>
                    </span>
                    <span role="cell">{row.owner}</span>
                    <span role="cell">{row.date}</span>
                    <span role="cell">
                      <i
                        className={
                          row.status === "Ready" || row.status === "Active"
                            ? "status-dot status-dot--ready"
                            : "status-dot"
                        }
                      />
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <aside id="form-section" className="quick-milestone">
              <span className="quick-milestone__icon">
                <ActiveRowIcon className="w-5 h-5" />
              </span>
              <p className="product-kicker">Quick Action</p>
              <h4>{activeView.quickTitle}</h4>
              <p>{activeView.quickDescription}</p>
              <label htmlFor="quick-milestone-name">
                {activeView.quickLabel}
              </label>
              <input
                id="quick-milestone-name"
                value={milestoneDraft}
                onChange={(event) => {
                  setMilestoneDraft(event.target.value);
                  setSavedMilestone("");
                }}
                placeholder={activeView.quickPlaceholder}
              />
              <button
                type="button"
                className="button button--primary w-full"
                disabled={!milestoneDraft.trim()}
                onClick={addWorkspaceRow}
              >
                {savedMilestone ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Added
                  </>
                ) : (
                  activeView.quickButton
                )}
              </button>
              <span className="quick-milestone__status" role="status">
                {savedMilestone
                  ? `“${savedMilestone}” ${activeView.savedMessage}`
                  : "\u00a0"}
              </span>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
