import { useState } from 'react';
import { copyPlanToClipboard, downloadIcsFile } from '../utils/exportUtils.js';

/**
 * ExportBar — Action toolbar for exporting, printing, and downloading the event plan.
 */
export default function ExportBar({ plan, eventMeta }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyPlanToClipboard(plan, eventMeta);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadCalendar = () => {
    downloadIcsFile(plan, eventMeta);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="export-bar festival-card no-print" role="region" aria-label="Export and Share Options">
      <div className="export-bar-inner">
        <div className="export-bar-text">
          <h3 className="export-bar-title">Export &amp; Share Your Plan</h3>
          <p className="export-bar-subtitle">Save a offline backup, download calendar milestones, or print for family discussions.</p>
        </div>

        <div className="export-actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleCopy}
            aria-label="Copy plan text to clipboard"
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Plan Text'}
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handleDownloadCalendar}
            aria-label="Download calendar iCal .ics file"
          >
            Download Calendar (.ics)
          </button>

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handlePrint}
            aria-label="Print or save as PDF"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
