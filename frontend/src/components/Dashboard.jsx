import BudgetBreakdown from './BudgetBreakdown.jsx';
import Timeline from './Timeline.jsx';
import VendorChecklist from './VendorChecklist.jsx';
import Warnings from './Warnings.jsx';
import AiInsights from './AiInsights.jsx';
import WhatIfSliders from './WhatIfSliders.jsx';
import RefineChips from './RefineChips.jsx';

/**
 * Dashboard — master container that renders the full event plan.
 * Provides sticky navigation, sample mode label, interactive what-if sliders,
 * refine chips, and back-to-form action.
 */

const NAV_SECTIONS = [
  { id: 'budget', label: 'Budget' },
  { id: 'whatif', label: 'What-If Simulation' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'warnings', label: 'Alerts' },
  { id: 'ai-insights', label: 'AI Insights' },
];

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Dashboard({
  result,
  eventMeta,
  onBackToForm,
  onRefine,
  isRefining,
  activeRefineLabel,
}) {
  const { plan, aiEnhanced, aiNotice, isSample } = result;
  const totalBudget = plan.budget.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="dashboard-wrap">
      {/* ── Dashboard Hero Header ─────────────────────────────────────── */}
      <header className="dashboard-hero mehndi-bg" role="banner">
        {/* Mehndi decorative overlay (pure CSS) */}
        <div className="mehndi-overlay" aria-hidden="true" />

        <div className="dashboard-hero-inner">
          {isSample && (
            <div className="sample-ribbon" role="status" aria-live="polite">
              Sample Plan Demonstration
            </div>
          )}

          <h1 className="dashboard-title">
            {eventMeta?.eventType
              ? eventMeta.eventType.charAt(0).toUpperCase() + eventMeta.eventType.slice(1)
              : 'Event'}{' '}
            Plan
          </h1>

          {eventMeta && (
            <div className="dashboard-meta-chips" role="list" aria-label="Event details">
              {eventMeta.city && (
                <span className="meta-chip" role="listitem">City: {eventMeta.city}</span>
              )}
              {eventMeta.guestCount && (
                <span className="meta-chip" role="listitem">{eventMeta.guestCount} guests</span>
              )}
              {eventMeta.eventDate && (
                <span className="meta-chip" role="listitem">
                  {new Date(eventMeta.eventDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span className="meta-chip meta-chip--budget" role="listitem">
                Total Budget: {formatINR(totalBudget)}
              </span>
            </div>
          )}

          {aiEnhanced ? (
            <p className="dashboard-ai-label">
              Enriched with Gemini AI · Culturally tailored for your celebration
            </p>
          ) : (
            <p className="dashboard-ai-label">
              Rules-engine verified plan · Deterministic &amp; reliable
            </p>
          )}
        </div>

        {/* Lotus divider */}
        <div className="lotus-divider" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>
      </header>

      {/* ── Sticky Navigation ─────────────────────────────────────────── */}
      <nav className="dashboard-nav" aria-label="Plan sections">
        <div className="dashboard-nav-inner">
          {NAV_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="dashboard-nav-link"
            >
              {s.label}
            </a>
          ))}
          <button
            type="button"
            className="back-btn"
            onClick={onBackToForm}
            aria-label="Go back to event form"
          >
            ← Back to Form
          </button>
        </div>
      </nav>

      {/* ── Main Dashboard Content ────────────────────────────────────── */}
      <main id="dashboard-main" className="dashboard-main" tabIndex={-1}>
        {/* Quick Refinements bar */}
        {onRefine && (
          <RefineChips
            currentMeta={eventMeta}
            onRefine={onRefine}
            isLoading={isRefining}
            activeRefineLabel={activeRefineLabel}
          />
        )}

        {/* Budget Section */}
        <div id="budget">
          <BudgetBreakdown
            budget={plan.budget}
            tradeoffs={plan.tradeoffs}
            budgetHealth={plan.budgetHealth}
            guestCount={eventMeta?.guestCount}
          />
        </div>

        {/* Section divider */}
        <div className="section-divider-bar" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>

        {/* What-If Sliders Simulation Section */}
        <div id="whatif">
          <WhatIfSliders
            initialBudget={plan.budget}
            initialGuests={eventMeta?.guestCount}
            totalBudget={totalBudget}
          />
        </div>

        {/* Section divider */}
        <div className="section-divider-bar" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>

        {/* Timeline Section */}
        <div id="timeline">
          <Timeline
            timeline={plan.timeline}
            panicMode={plan.panicMode}
            isCompressed={plan.isCompressed}
          />
        </div>

        <div className="section-divider-bar" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>

        {/* Vendors Section */}
        <div id="vendors">
          <VendorChecklist
            vendors={plan.vendors}
            totalBudget={totalBudget}
          />
        </div>

        <div className="section-divider-bar" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>

        {/* Warnings Section */}
        <div id="warnings">
          <Warnings
            warnings={plan.warnings}
            panicMode={plan.panicMode}
          />
        </div>

        <div className="section-divider-bar" aria-hidden="true">
          <span className="ornament-line"></span>
          <span className="ornament-dot">✦</span>
          <span className="ornament-line"></span>
        </div>

        {/* AI Insights Section */}
        <div id="ai-insights">
          <AiInsights
            ai={plan.ai}
            aiEnhanced={aiEnhanced}
            aiNotice={aiNotice}
          />
        </div>

        {/* Back to Form CTA */}
        <div className="dashboard-footer-cta">
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={onBackToForm}
          >
            ← Plan Another Event
          </button>
          <p className="footer-tagline">
            Celebration &amp; Event Planner
          </p>
        </div>
      </main>
    </div>
  );
}
