"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  CodeIcon,
  Flag,
  GuideLoopLogo,
  Reset,
  Search,
  Sparkles,
  Timeline,
} from "./DemoIcons";

interface InteractivePlaygroundProps {
  onStartTour: () => void;
  onResetState: () => void;
  onTriggerTarget: (selector: string) => void;
  statusMessage: string;
}

export function InteractivePlayground({
  onStartTour,
  onResetState,
  onTriggerTarget,
  statusMessage,
}: InteractivePlaygroundProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showActivity, setShowActivity] = useState(false);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [submittedMilestone, setSubmittedMilestone] = useState("");

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneInput.trim()) return;
    setSubmittedMilestone(milestoneInput.trim());
    setMilestoneInput("");
  };

  return (
    <div className="playground-shell">
      {/* QUICK TRIGGER CONTROL BAR */}
      <div className="trigger-pill-bar">
        <div className="trigger-group-left">
          <button
            type="button"
            className="trigger-pill trigger-pill--primary"
            onClick={onStartTour}
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Tour Sandbox [T]</span>
          </button>

          <span className="trigger-divider" aria-hidden="true" />

          <button
            type="button"
            className="trigger-pill"
            onClick={() => onTriggerTarget("#test-search")}
          >
            <Search className="w-3.5 h-3.5 text-accent" />
            <span>Target Search</span>
          </button>

          <button
            type="button"
            className="trigger-pill"
            onClick={() => onTriggerTarget("#test-filter-tabs")}
          >
            <Timeline className="w-3.5 h-3.5 text-accent" />
            <span>Target Filters</span>
          </button>

          <button
            type="button"
            className="trigger-pill"
            onClick={() => onTriggerTarget("#test-metrics")}
          >
            <Timeline className="w-3.5 h-3.5 text-accent" />
            <span>Target Metrics</span>
          </button>

          <button
            type="button"
            className="trigger-pill"
            onClick={() => onTriggerTarget("#test-notifications")}
          >
            <Bell className="w-3.5 h-3.5 text-accent" />
            <span>Target Bell</span>
          </button>

          <button
            type="button"
            className="trigger-pill"
            onClick={() => onTriggerTarget("#test-action-form")}
          >
            <Flag className="w-3.5 h-3.5 text-accent" />
            <span>Target Form</span>
          </button>
        </div>

        <div className="trigger-group-right">
          <button
            type="button"
            className="trigger-pill trigger-pill--ghost"
            onClick={onResetState}
            title="Reset sandbox state [R]"
          >
            <Reset className="w-3.5 h-3.5" />
            <span>Reset [R]</span>
          </button>
        </div>
      </div>

      {/* SANDBOX CANVAS CONTAINER */}
      <div className="playground-canvas">
        {/* TOP BAR / BRAND HEADER */}
        <div className="sandbox-topbar">
          <div className="sandbox-brand">
            <GuideLoopLogo className="h-6 w-auto" />
            <span className="sandbox-brand-title">Interactive Guidance Sandbox</span>
            <span className="sandbox-status-badge">Live Controls</span>
          </div>

          <div className="sandbox-status-line">
            <span className="pulse-dot" />
            <span className="sandbox-status-text">{statusMessage}</span>
          </div>
        </div>

        {/* TARGET ELEMENTS GRID */}
        <div className="sandbox-grid">
          {/* TARGET 1: SEARCH & FILTER BAR */}
          <div className="sandbox-card sandbox-card--full">
            <div className="card-header-row">
              <div className="card-title-group">
                <Search className="w-4 h-4 text-accent" />
                <span className="card-title">Search &amp; Filter Controls</span>
              </div>
              <span className="card-badge">DOM Targets 1 &amp; 2</span>
            </div>
            <div className="search-box-row">
              <div id="test-search" className="sandbox-search-input-wrapper">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type or search components..."
                  className="sandbox-search-input"
                />
                <kbd className="search-shortcut">⌘K</kbd>
              </div>

              <div id="test-filter-tabs" className="filter-pill-group">
                <button type="button" className="filter-pill is-active">All Items</button>
                <button type="button" className="filter-pill">Active Guides</button>
                <button type="button" className="filter-pill">Checklists</button>
              </div>
            </div>
          </div>

          {/* TARGET 2: METRICS & READINESS */}
          <div className="sandbox-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <Timeline className="w-4 h-4 text-accent" />
                <span className="card-title">Metric Dashboard</span>
              </div>
              <span className="card-badge">DOM Target 3</span>
            </div>

            <div id="test-metrics" className="metrics-box">
              <div className="metric-item">
                <span className="metric-label">Launch Readiness</span>
                <strong className="metric-value">88%</strong>
                <div className="metric-progress-bar">
                  <span style={{ width: "88%" }} />
                </div>
              </div>

              <div className="metric-stats-row">
                <div>
                  <span className="stat-sublabel">Spotlight Latency</span>
                  <strong>12ms</strong>
                </div>
                <div>
                  <span className="stat-sublabel">ARIA Focus Trap</span>
                  <strong className="text-emerald-400">Enabled</strong>
                </div>
                <div>
                  <span className="stat-sublabel">Popper Engine</span>
                  <strong className="text-sky-400">v2.11</strong>
                </div>
              </div>
            </div>
          </div>

          {/* TARGET 3: NOTIFICATIONS & POPOVER */}
          <div className="sandbox-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <Bell className="w-4 h-4 text-accent" />
                <span className="card-title">Activity Feed</span>
              </div>
              <span className="card-badge">DOM Target 4</span>
            </div>

            <div className="notification-box">
              <div className="notification-trigger-row">
                <button
                  id="test-notifications"
                  type="button"
                  className="icon-btn-sandbox"
                  onClick={() => setShowActivity((prev) => !prev)}
                  aria-expanded={showActivity}
                >
                  <Bell className="w-4 h-4 text-slate-200" />
                  <span className="notification-ping-dot" />
                </button>
                <div className="notification-info">
                  <strong>Activity Popover &amp; Bell</strong>
                  <span>Click bell to toggle activity popover feed</span>
                </div>
              </div>

              {showActivity && (
                <div className="activity-popover-sandbox">
                  <div className="popover-head">
                    <strong>Recent Events</strong>
                    <span>Live</span>
                  </div>
                  <p>
                    <span className="activity-dot activity-dot--done" />
                    Spotlight bounds calculated.
                  </p>
                  <p>
                    <span className="activity-dot" />
                    Focus trapped within dialog.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TARGET 4: QUICK ACTION FORM */}
          <div className="sandbox-card sandbox-card--full">
            <div className="card-header-row">
              <div className="card-title-group">
                <Flag className="w-4 h-4 text-accent" />
                <span className="card-title">Quick Milestone Action</span>
              </div>
              <span className="card-badge">DOM Target 5</span>
            </div>

            <form id="test-action-form" onSubmit={handleMilestoneSubmit} className="quick-action-row">
              <div className="form-input-group">
                <label htmlFor="sandbox-milestone-input">Milestone or task name</label>
                <input
                  id="sandbox-milestone-input"
                  type="text"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  placeholder="e.g. Release candidate v1.5"
                  className="quick-action-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{ height: "2.5rem", padding: "0 1.25rem", fontSize: "0.85rem" }}
                disabled={!milestoneInput.trim()}
              >
                {submittedMilestone ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-emerald-400" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <CodeIcon className="w-4 h-4 mr-1" />
                    <span>Add Milestone</span>
                  </>
                )}
              </button>

              {submittedMilestone && (
                <span className="milestone-status-tag">
                  ✓ “{submittedMilestone}” saved to state
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
