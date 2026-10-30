import { useState } from 'react';
import Presets from './components/Presets.jsx';
import EventForm from './components/EventForm.jsx';
import { generatePlanApi } from './api/planClient.js';

function App() {
  const [formDataOverride, setFormDataOverride] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [planResult, setPlanResult] = useState(null);

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
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await generatePlanApi(formData);
      setPlanResult(response);
    } catch (err) {
      setApiError(err.message || 'Failed to generate event plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app-container">
        <header className="site-header" role="banner">
          <h1 className="site-title">Celebration &amp; Event Planner</h1>
          <p className="site-tagline">
            Intelligent, culturally astute event planning for weddings, birthdays, and community gatherings across Indian cities.
          </p>
        </header>

        <main id="main-content" tabIndex="-1">
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

          {/* Plan Result Summary preview (Full Dashboard comes in Session 8) */}
          {planResult && (
            <section
              className="plan-preview-card"
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: '#ffffff',
                border: '2px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
              }}
              aria-live="polite"
            >
              <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                Plan Generated Successfully!
              </h2>
              <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                {planResult.aiEnhanced
                  ? '✨ Enhanced with Gemini AI insights & culturally curated themes.'
                  : `🛡️ Rules-engine plan verified. ${planResult.aiNotice || ''}`}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Budget Allocated:</strong> ₹
                  {planResult.plan.budget.reduce((acc, b) => acc + b.amount, 0).toLocaleString('en-IN')}
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Budget Health:</strong> {planResult.plan.budgetHealth.status.toUpperCase()}
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Timeline Milestones:</strong> {planResult.plan.timeline.length} stages
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Vendors Curated:</strong> {planResult.plan.vendors.length} categories
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
