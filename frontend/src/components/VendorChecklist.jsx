import { useState, useEffect, useCallback } from 'react';

/**
 * VendorChecklist — vendor cards with tickable checklist items,
 * WhatsApp inquiry button with complete context, and overall progress bar.
 * State persists in localStorage under event_planner_checklist_vendors.
 */

const LS_KEY = 'event_planner_checklist_vendors';

function loadChecked() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VendorChecklist({ vendors, totalBudget, eventMeta }) {
  const [checked, setChecked] = useState(loadChecked);

  useEffect(() => {
    saveChecked(checked);
  }, [checked]);

  const toggleItem = useCallback((key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const allItems = vendors.flatMap((v) =>
    v.checklist.map((item) => `${v.type}::${item}`),
  );
  const doneCount = allItems.filter((k) => checked[k]).length;
  const progressPct = allItems.length > 0 ? Math.round((doneCount / allItems.length) * 100) : 0;

  return (
    <section className="dashboard-section" aria-labelledby="vendor-heading">
      <div className="section-header">
        <h2 id="vendor-heading" className="section-title">Vendor Checklist</h2>
      </div>

      {/* Overall progress */}
      <div className="progress-wrap" role="group" aria-label="Vendor checklist overall progress">
        <div className="progress-label">
          <span>{doneCount}/{allItems.length} items verified</span>
          <span className="progress-pct">{progressPct}%</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="vendor-grid">
        {vendors.map((vendor) => {
          const vendorItems = vendor.checklist.map((item) => ({
            key: `${vendor.type}::${item}`,
            text: item,
          }));
          const vendorDone = vendorItems.filter((i) => checked[i.key]).length;
          const vendorPct =
            vendorItems.length > 0
              ? Math.round((vendorDone / vendorItems.length) * 100)
              : 0;
          const budgetAmount =
            totalBudget && vendor.budgetShare > 0
              ? formatINR((totalBudget * vendor.budgetShare) / 100)
              : null;

          return (
            <div key={vendor.type} className="vendor-card festival-card">
              {/* Card Header */}
              <div className="vendor-card-header">
                <div className="vendor-title-row">
                  <h3 className="vendor-name">{vendor.type}</h3>
                  {vendor.budgetShare > 0 && (
                    <span className="vendor-budget-chip">
                      {vendor.budgetShare}%
                      {budgetAmount ? ` · ${budgetAmount}` : ''}
                    </span>
                  )}
                </div>
                {/* Mini progress bar */}
                <div className="vendor-mini-progress" aria-hidden="true">
                  <div
                    className="vendor-mini-fill"
                    style={{ width: `${vendorPct}%` }}
                    title={`${vendorDone}/${vendorItems.length} done`}
                  />
                </div>
                <span className="vendor-progress-label">
                  {vendorDone}/{vendorItems.length} checked
                </span>
              </div>

              {/* Checklist */}
              <ul className="vendor-checklist" role="list">
                {vendorItems.map(({ key, text }) => (
                  <li key={key} className={`vendor-item ${checked[key] ? 'vendor-item--done' : ''}`}>
                    <label className="vendor-item-label">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={!!checked[key]}
                        onChange={() => toggleItem(key)}
                        aria-label={text}
                      />
                      <span className="vendor-item-text">{text}</span>
                    </label>
                  </li>
                ))}
              </ul>

            </div>
          );
        })}
      </div>
    </section>
  );
}
