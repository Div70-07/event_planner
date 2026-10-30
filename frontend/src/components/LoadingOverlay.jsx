/**
 * LoadingOverlay — full-screen festival-themed loading popup.
 * Shows while the event plan is being generated.
 * Icons (ring, diya, disco ball, shehnai) slide left-to-right in a parade.
 */

const ICONS = [
  { symbol: '💍', label: 'Wedding ring' },
  { symbol: '🪔', label: 'Diya lamp' },
  { symbol: '🪩', label: 'Disco ball' },
  { symbol: '🎊', label: 'Celebration' },
  { symbol: '🌸', label: 'Flower' },
];

export default function LoadingOverlay({ eventMeta }) {
  const eventLabel = {
    wedding: 'Wedding',
    birthday: 'Birthday Party',
    community: 'Community Gathering',
    college_fest: 'College Fest',
    colony_event: 'Colony Event',
  }[eventMeta?.eventType] || 'Celebration';

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

        {/* Icon parade */}
        <div className="loading-parade" aria-hidden="true">
          <div className="loading-track">
            {[...ICONS, ...ICONS].map((icon, i) => (
              <span
                key={i}
                className="parade-icon"
                style={{ animationDelay: `${i * 0.35}s` }}
                title={icon.label}
              >
                {icon.symbol}
              </span>
            ))}
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
