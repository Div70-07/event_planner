import { Fragment, useState, useCallback } from 'react';

/**
 * BudgetBreakdown — displays budget allocation table with visual bars,
 * trade-off suggestions, and budget health indicator.
 */

const HEALTH_CONFIG = {
  comfortable: { icon: '●', label: 'Comfortable', color: '#15803d', bg: '#dcfce7' },
  moderate: { icon: '●', label: 'Moderate', color: '#b45309', bg: '#fef9c3' },
  tight: { icon: '●', label: 'Tight', color: '#b91c1c', bg: '#fee2e2' },
};

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetBreakdown({ budget, tradeoffs, budgetHealth, guestCount }) {
  const [expanded, setExpanded] = useState(null);

  const totalAmount = budget.reduce((s, b) => s + b.amount, 0);
  const health = HEALTH_CONFIG[budgetHealth?.status] ?? HEALTH_CONFIG.moderate;
  const perGuestCost = guestCount && guestCount > 0 ? Math.round(totalAmount / guestCount) : null;

  const toggleRow = useCallback(
    (key) => setExpanded((prev) => (prev === key ? null : key)),
    [],
  );

  return (
    <section className="dashboard-section" aria-labelledby="budget-heading">
      {/* Section Header */}
      <div className="section-header">
        <h2 id="budget-heading" className="section-title">Budget Breakdown</h2>
      </div>

      {/* Budget Health Meter */}
      <div
        className="health-banner"
        style={{ '--health-color': health.color, '--health-bg': health.bg }}
        role="status"
        aria-label={`Budget health: ${health.label}`}
      >
        <span className="health-icon" aria-hidden="true">{health.icon}</span>
        <div className="health-text">
          <div className="health-title-row">
            <strong>{health.label} Budget Meter</strong>
            {perGuestCost && (
              <span className="health-per-guest">
                Cost per guest: {formatINR(perGuestCost)} ({guestCount} guests)
              </span>
            )}
          </div>
          <p>{budgetHealth?.message}</p>
        </div>
      </div>

      {/* Budget Table */}
      <div className="budget-table-wrap">
        <table className="budget-table" aria-label="Budget allocation breakdown">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="num-col">%</th>
              <th scope="col" className="num-col">Amount</th>
              <th scope="col" className="bar-col" aria-label="Visual share"></th>
            </tr>
          </thead>
          <tbody>
            {budget.map((item) => (
              <Fragment key={item.key}>
                <tr
                  className={`budget-row ${expanded === item.key ? 'budget-row--open' : ''}`}
                  onClick={() => toggleRow(item.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleRow(item.key);
                    }
                  }}
                  aria-expanded={expanded === item.key}
                  aria-label={`${item.category}: ${item.percent}%, ${formatINR(item.amount)}. Click to see rationale.`}
                >
                  <td className="cat-cell">
                    <span className="cat-name">{item.category}</span>
                    <span className="expand-caret" aria-hidden="true">
                      {expanded === item.key ? '▾' : '▸'}
                    </span>
                  </td>
                  <td className="num-col percent-cell">{item.percent}%</td>
                  <td className="num-col amount-cell">{formatINR(item.amount)}</td>
                  <td className="bar-col">
                    <div className="bar-track" aria-hidden="true">
                      <div
                        className="bar-fill"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </td>
                </tr>
                {expanded === item.key && (
                  <tr key={`${item.key}-rationale`} className="rationale-row">
                    <td colSpan={4}>
                      <p className="rationale-text">{item.rationale}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td><strong>Total</strong></td>
              <td className="num-col"><strong>100%</strong></td>
              <td className="num-col"><strong>{formatINR(totalAmount)}</strong></td>
              <td className="bar-col" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Trade-offs */}
      {tradeoffs && tradeoffs.length > 0 && (
        <div className="tradeoffs-section">
          <h3 className="sub-section-title">Strategic Trade-off Recommendations</h3>
          <ul className="tradeoff-list" role="list">
            {tradeoffs.map((t, i) => (
              <li key={i} className="tradeoff-item">
                <div className="tradeoff-arrow">
                  <span className="tradeoff-from">{t.fromCategory}</span>
                  <span className="tradeoff-icon" aria-hidden="true">→</span>
                  <span className="tradeoff-to">{t.toCategory}</span>
                  <span className="tradeoff-amount">({formatINR(t.amount)})</span>
                </div>
                <p className="tradeoff-reason">{t.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
