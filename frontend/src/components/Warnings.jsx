/**
 * Warnings — warning pills/cards with icon, and prominent panic mode display.
 */
export default function Warnings({ warnings, panicMode }) {
  const hasWarnings = warnings && warnings.length > 0;
  const hasPanic = panicMode?.enabled;

  if (!hasWarnings && !hasPanic) {
    return (
      <section className="dashboard-section" aria-labelledby="warnings-heading">
        <div className="section-header">
          <h2 id="warnings-heading" className="section-title">Alerts & Advisories</h2>
        </div>
        <p className="no-data-msg">No operational risks identified for this configuration.</p>
      </section>
    );
  }

  return (
    <section className="dashboard-section" aria-labelledby="warnings-heading">
      <div className="section-header">
        <h2 id="warnings-heading" className="section-title">Alerts & Advisories</h2>
      </div>

      {/* Panic Mode Prominent Card */}
      {hasPanic && (
        <div className="panic-banner" role="alert">
          <div className="panic-content">
            <strong>Urgent: Event Window Under 14 Days</strong>
            <p>Prioritise ruthlessly. Recommended priority schedule:</p>

            {panicMode.bookToday?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Book Today</h4>
                <ul className="panic-list">
                  {panicMode.bookToday.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {panicMode.doThisWeek?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Do This Week</h4>
                <ul className="panic-list">
                  {panicMode.doThisWeek.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {panicMode.canSkip?.length > 0 && (
              <div className="panic-group">
                <h4 className="panic-group-title">Can Defer or Skip</h4>
                <ul className="panic-list panic-list--skip">
                  {panicMode.canSkip.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning Pills */}
      {hasWarnings && (
        <ul className="warning-list" role="list" aria-label="Planning warnings">
          {warnings.map((w, i) => (
            <li key={i} className="warning-item" role="listitem">
              <span className="warning-bullet" aria-hidden="true">Notice:</span>
              <span className="warning-text">{w}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
