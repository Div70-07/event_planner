import { useState } from 'react';
import Presets from './components/Presets.jsx';
import EventForm from './components/EventForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import { generatePlanApi } from './api/planClient.js';
import { SAMPLE_PLAN, SAMPLE_EVENT_META } from './data/samplePlan.js';

function App() {
  const [formDataOverride, setFormDataOverride] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [planResult, setPlanResult] = useState(null);
  const [eventMeta, setEventMeta] = useState(null);
  const [activeRefineLabel, setActiveRefineLabel] = useState('');

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFormDataOverride({ ...preset.data });
    setApiError('');
  };

  const handleFormReset = () => {
    setSelectedPresetId('');
    setFormDataOverride(null);
    setApiError('');
    setPlanResult(null);
    setEventMeta(null);
    setActiveRefineLabel('');
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await generatePlanApi(formData);
      setPlanResult(response);
      setEventMeta({ ...formData });
    } catch (err) {
      setApiError(err.message || 'Failed to generate event plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinePlan = async (updatedFormData, changeLabel) => {
    setIsLoading(true);
    setActiveRefineLabel(changeLabel);

    try {
      const response = await generatePlanApi(updatedFormData);
      setPlanResult(response);
      setEventMeta({ ...updatedFormData });
    } catch (err) {
      setApiError(err.message || 'Failed to update refined plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setPlanResult(SAMPLE_PLAN);
    setEventMeta(SAMPLE_EVENT_META);
    setApiError('');
    setActiveRefineLabel('');
  };

  // ── Dashboard view ─────────────────────────────────────────────────────
  if (planResult) {
    return (
      <>
        <a href="#dashboard-main" className="skip-link">
          Skip to plan content
        </a>
        <Dashboard
          result={planResult}
          eventMeta={eventMeta}
          onBackToForm={handleFormReset}
          onRefine={handleRefinePlan}
          isRefining={isLoading}
          activeRefineLabel={activeRefineLabel}
        />
      </>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app-container">
        {/* ── Site Header ──────────────────────────────────────────── */}
        <header className="site-header mehndi-bg" role="banner">
          <div className="mehndi-overlay" aria-hidden="true" />
          <div className="site-header-inner">
            <div className="header-crest" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C12 2 15 7 15 11C15 13 13.5 15 12 15C10.5 15 9 13 9 11C9 7 12 2 12 2Z" fill="var(--color-turmeric)" fillOpacity="0.4" stroke="var(--color-turmeric)"/>
                <path d="M12 15C12 15 6 13 4 8C3.5 12 6 17 10 18C11 18.25 12 18 12 18C12 18 13 18.25 14 18C18 17 20.5 12 20 8C18 13 12 15 12 15Z" stroke="var(--color-gold)"/>
                <circle cx="12" cy="20" r="1.5" fill="var(--color-turmeric)"/>
              </svg>
            </div>
            <h1 className="site-title">Celebration & Event Planner</h1>
            <p className="site-tagline">
              Intelligent, culturally astute event planning for weddings, birthdays &amp;
              community gatherings across Indian cities.
            </p>
            {/* Try Sample CTA */}
            <button
              type="button"
              className="btn-sample"
              onClick={handleLoadSample}
              aria-label="Load a pre-built sample plan to explore the dashboard"
            >
              Try a Sample Plan
            </button>
          </div>
          <div className="lotus-divider" aria-hidden="true">
            <span className="ornament-line"></span>
            <span className="ornament-dot">✦</span>
            <span className="ornament-line"></span>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>
          {/* Preset Buttons */}
          <Presets
            onSelectPreset={handleSelectPreset}
            selectedPresetId={selectedPresetId}
            disabled={isLoading}
          />

          {/* Core Event Planning Form */}
          <EventForm
            initialData={formDataOverride}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
            isLoading={isLoading}
            apiError={apiError}
          />

          {/* Accessible status announcer for loading/error states */}
          <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
            {isLoading ? 'Generating your event plan, please wait…' : ''}
            {apiError && !isLoading ? `Error: ${apiError}` : ''}
          </div>
        </main>

        <footer className="site-footer" role="contentinfo">
          <div className="lotus-divider" aria-hidden="true">
            <span className="ornament-line"></span>
            <span className="ornament-dot">✦</span>
            <span className="ornament-line"></span>
          </div>
          <p>Celebration &amp; Event Planner &nbsp;·&nbsp; PromptWars Challenge 05</p>
        </footer>
      </div>
    </>
  );
}

export default App;
