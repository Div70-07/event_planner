import { useState, useEffect } from 'react';

/**
 * LoadingOverlay — full-screen festival-themed loading popup.
 * Shows while the event plan is being generated.
 * Displays one spotlight celebration icon at a time that slides in from right,
 * holds prominently in the center, and exits to the left.
 */

const ICONS = [
  { symbol: '💍', label: 'Wedding ring' },
  { symbol: '🪔', label: 'Diya lamp' },
  { symbol: '✨', label: 'Celebration sparkle' },
  { symbol: '🥁', label: 'Festival dhol' },
  { symbol: '🎉', label: 'Party popper' },
  { symbol: '🌸', label: 'Garland flower' },
];

export default function LoadingOverlay({ eventMeta }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ICONS.length);
    }, 1300);
    return () => clearInterval(timer);
  }, []);

  const eventLabel = {
    wedding: 'Wedding',
    birthday: 'Birthday Party',
    community: 'Community Gathering',
    college_fest: 'College Fest',
    colony_event: 'Colony Event',
  }[eventMeta?.eventType] || 'Celebration';

  const currentIcon = ICONS[currentIndex];

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label="Generating your event plan">
      <div className="loading-card">
        {/* Mehndi decorative corner */}
        <div className="loading-mehndi" aria-hidden="true" />

        <div className="loading-title-row">
          <span className="loading-ornament" aria-hidden="true">✦</span>
          <h2 className="loading-title">Crafting Your Plan</h2>
          <span className="loading-ornament" aria-hidden="true">✦</span>
        </div>

        {eventMeta && (
          <p className="loading-subtitle">
            {eventLabel}
            {eventMeta.city ? ` · ${eventMeta.city}` : ''}
            {eventMeta.guestCount ? ` · ${eventMeta.guestCount} guests` : ''}
          </p>
        )}

        {/* Single centered spotlight emoji */}
        <div className="loading-spotlight-container" aria-hidden="true">
          <div key={currentIndex} className="spotlight-emoji-wrapper">
            <span className="spotlight-emoji" role="img" aria-label={currentIcon.label}>
              {currentIcon.symbol}
            </span>
          </div>
        </div>

        <p className="loading-message">
          Building budget breakdown, timeline &amp; vendor checklist&hellip;
        </p>

        {/* Shimmer bar */}
        <div className="loading-shimmer-bar" aria-hidden="true">
          <div className="loading-shimmer-fill" />
        </div>
      </div>
    </div>
  );
}
