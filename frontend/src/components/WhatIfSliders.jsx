import { useState, useMemo } from 'react';

/**
 * WhatIfSliders — interactive instant what-if scenario calculator.
 * Adjusts guest count, decor allocation %, and catering allocation %
 * completely in the client without making any network / API call.
 */

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WhatIfSliders({ initialBudget, initialGuests, totalBudget }) {
  const [guestCount, setGuestCount] = useState(initialGuests || 150);
  const [decorShift, setDecorShift] = useState(0); // -10% to +10%
  const [cateringShift, setCateringShift] = useState(0); // -10% to +10%

  // Find baseline categories
  const baselineVenue = initialBudget.find((b) => b.key === 'venue');
  const baselineCatering = initialBudget.find((b) => b.key === 'catering');

  const recomputed = useMemo(() => {
    const venueBaseAmount = baselineVenue ? baselineVenue.amount : totalBudget * 0.3;
    const cateringBaseAmount = baselineCatering ? baselineCatering.amount : totalBudget * 0.28;

    // Shift amounts
    const decorDelta = (totalBudget * decorShift) / 100;
    const cateringDelta = (totalBudget * cateringShift) / 100;

    const adjustedVenue = Math.max(0, venueBaseAmount + decorDelta);
    const adjustedCatering = Math.max(0, cateringBaseAmount + cateringDelta);

    const baseOther = totalBudget - venueBaseAmount - cateringBaseAmount;
    const newTotal = adjustedVenue + adjustedCatering + baseOther;
    const perGuestSpend = guestCount > 0 ? Math.round(newTotal / guestCount) : 0;

    return {
      newTotal,
      adjustedVenue,
      adjustedCatering,
      perGuestSpend,
      netDifference: newTotal - totalBudget,
    };
  }, [totalBudget, baselineVenue, baselineCatering, decorShift, cateringShift, guestCount]);

  const handleReset = () => {
    setGuestCount(initialGuests || 150);
    setDecorShift(0);
    setCateringShift(0);
  };

  const isModified = guestCount !== (initialGuests || 150) || decorShift !== 0 || cateringShift !== 0;

  return (
    <section className="dashboard-section what-if-section" aria-labelledby="whatif-heading">
      <div className="section-header">
        <h2 id="whatif-heading" className="section-title">What-If Scenario Simulator</h2>
        <span className="live-badge" aria-label="Calculated live in browser without network call">Instant Local Recalculation</span>
      </div>
      <p className="field-help">
        Test instant variations in guest numbers and decor/catering priorities without making a server request.
      </p>

      <div className="what-if-grid">
        {/* Controls */}
        <div className="what-if-controls">
          <div className="slider-group">
            <div className="slider-label-row">
              <label htmlFor="slider-guests" className="slider-label">Expected Guest Count</label>
              <span className="slider-value">{guestCount} guests</span>
            </div>
            <input
              id="slider-guests"
              type="range"
              min="20"
              max="1500"
              step="10"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
              className="slider-input"
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label htmlFor="slider-decor" className="slider-label">Decor & Venue Allocation Shift</label>
              <span className="slider-value">{decorShift > 0 ? `+${decorShift}%` : `${decorShift}%`}</span>
            </div>
            <input
              id="slider-decor"
              type="range"
              min="-10"
              max="10"
              step="1"
              value={decorShift}
              onChange={(e) => setDecorShift(parseInt(e.target.value, 10))}
              className="slider-input"
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label htmlFor="slider-catering" className="slider-label">Food & Catering Allocation Shift</label>
              <span className="slider-value">{cateringShift > 0 ? `+${cateringShift}%` : `${cateringShift}%`}</span>
            </div>
            <input
              id="slider-catering"
              type="range"
              min="-10"
              max="10"
              step="1"
              value={cateringShift}
              onChange={(e) => setCateringShift(parseInt(e.target.value, 10))}
              className="slider-input"
            />
          </div>

          {isModified && (
            <button type="button" className="btn btn--secondary btn--sm" onClick={handleReset}>
              Reset Simulation
            </button>
          )}
        </div>

        {/* Results Card */}
        <div className="what-if-results festival-card">
          <h3 className="sub-section-title">Simulated Impact</h3>
          <div className="metric-card-group">
            <div className="metric-card">
              <span className="metric-card-label">Simulated Total Spend</span>
              <span className="metric-card-value">{formatINR(recomputed.newTotal)}</span>
              {recomputed.netDifference !== 0 && (
                <span className={`metric-card-sub ${recomputed.netDifference > 0 ? 'text-warn' : 'text-good'}`}>
                  {recomputed.netDifference > 0 ? `+${formatINR(recomputed.netDifference)}` : formatINR(recomputed.netDifference)} from baseline
                </span>
              )}
            </div>

            <div className="metric-card">
              <span className="metric-card-label">Cost Per Guest</span>
              <span className="metric-card-value">{formatINR(recomputed.perGuestSpend)}</span>
              <span className="metric-card-sub">across {guestCount} guests</span>
            </div>

            <div className="metric-card">
              <span className="metric-card-label">Adjusted Venue/Decor</span>
              <span className="metric-card-value">{formatINR(recomputed.adjustedVenue)}</span>
            </div>

            <div className="metric-card">
              <span className="metric-card-label">Adjusted Catering</span>
              <span className="metric-card-value">{formatINR(recomputed.adjustedCatering)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
