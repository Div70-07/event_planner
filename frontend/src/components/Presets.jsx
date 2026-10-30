import PropTypes from 'prop-types';
import { EVENT_PRESETS } from '../data/presets.js';

/**
 * Presets component allowing one-click population of typical Indian celebrations.
 */
export default function Presets({ onSelectPreset, selectedPresetId, disabled }) {
  return (
    <section className="presets-section" aria-labelledby="presets-heading">
      <div className="presets-header">
        <h2 id="presets-heading" className="presets-title">
          Quick Start with a Preset
        </h2>
        <p className="presets-subtitle">
          Choose a scenario below to auto-fill sensible values, or start typing your own details directly.
        </p>
      </div>

      <div className="presets-grid" role="group" aria-label="Event scenario presets">
        {EVENT_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              className={`preset-card ${isSelected ? 'preset-card--selected' : ''}`}
              onClick={() => onSelectPreset(preset)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              <span className="preset-name">{preset.name}</span>
              <span className="preset-tagline">{preset.tagline}</span>
              <span className="preset-desc">{preset.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

Presets.propTypes = {
  onSelectPreset: PropTypes.func.isRequired,
  selectedPresetId: PropTypes.string,
  disabled: PropTypes.bool,
};
