import { useState, useEffect, useCallback } from 'react';
import { buildVendorWhatsappLink } from '../utils/exportUtils.js';

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

              {/* WhatsApp Inquiry Button with context */}
              <a
                href={buildVendorWhatsappLink(vendor, eventMeta)}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
                aria-label={`Enquire about ${vendor.type} via WhatsApp`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enquire on WhatsApp
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
