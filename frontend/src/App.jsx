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
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await generatePlanApi(formData);
      setPlanResult(response);
      setEventMeta({
        eventType: formData.eventType,
        city: formData.city,
        guestCount: formData.guestCount,
        eventDate: formData.eventDate,
      });
    } catch (err) {
      setApiError(err.message || 'Failed to generate event plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setPlanResult(SAMPLE_PLAN);
    setEventMeta(SAMPLE_EVENT_META);
    setApiError('');
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
            <div className="lotus-icon" aria-hidden="true">🪷</div>
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
              ✨ Try a Sample Plan
            </button>
          </div>
          <div className="lotus-divider" aria-hidden="true">
            <span>❀</span><span>✿</span><span>❀</span>
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
        </main>

        <footer className="site-footer" role="contentinfo">
          <div className="lotus-divider" aria-hidden="true">
            <span>❀</span><span>✿</span><span>❀</span>
          </div>
          <p>Made with ❤️ for Indian celebrations &nbsp;·&nbsp; PromptWars Challenge 05</p>
        </footer>
      </div>
    </>
  );
}

export default App;
