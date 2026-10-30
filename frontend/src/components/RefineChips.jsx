/**
 * RefineChips — Quick 1-click refinement prompts that modify plan parameters
 * and trigger plan regeneration with clear user feedback.
 */

const REFINE_PRESETS = [
  {
    id: 'cheaper',
    label: 'Make it 15% Cheaper',
    description: 'Scales down overall budget while preserving core contingency buffer',
    apply: (currentMeta) => ({
      ...currentMeta,
      budget: Math.round(currentMeta.budget * 0.85),
    }),
    changeLabel: 'Budget lowered by 15%',
  },
  {
    id: 'more-veg',
    label: 'Strict Vegetarian Focus',
    description: 'Enforces pure vegetarian and Jain dietary checks for all catering',
    apply: (currentMeta) => ({
      ...currentMeta,
      dietary: Array.from(new Set([...(currentMeta.dietary || []), 'veg', 'jain'])).filter((d) => d !== 'none'),
    }),
    changeLabel: 'Dietary updated to Vegetarian & Jain',
  },
  {
    id: 'add-entertainment',
    label: 'Prioritise Live Music & DJ',
    description: 'Adds Entertainment & DJ to your top 3 celebration priorities',
    apply: (currentMeta) => {
      const current = (currentMeta.priorities || []).filter((p) => p !== 'entertainment');
      return {
        ...currentMeta,
        priorities: ['entertainment', ...current].slice(0, 3),
      };
    },
    changeLabel: 'Entertainment added to top priorities',
  },
];

export default function RefineChips({ currentMeta, onRefine, isLoading, activeRefineLabel }) {
  if (!currentMeta) {
    return null;
  }

  return (
    <div className="refine-container festival-card" aria-label="One-click plan adjustments">
      <div className="refine-header">
        <h3 className="sub-section-title">Quick Refinements</h3>
        <span className="refine-subtitle">Instant one-click adjustments to recalibrate your event parameters</span>
      </div>

      <div className="refine-chips-row" role="group" aria-label="Quick refinement actions">
        {REFINE_PRESETS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="chip-button"
            disabled={isLoading}
            onClick={() => {
              const updated = chip.apply(currentMeta);
              onRefine(updated, chip.changeLabel);
            }}
            title={chip.description}
          >
            <span className="chip-indicator" aria-hidden="true">+</span>
            {chip.label}
          </button>
        ))}
      </div>

      {activeRefineLabel && (
        <div className="refine-feedback" role="status" aria-live="polite">
          <span className="badge-applied">Applied:</span> {activeRefineLabel}
        </div>
      )}
    </div>
  );
}
