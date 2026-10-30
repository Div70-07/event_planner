import { useState, useEffect, useId } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'event_planner_form_draft';

const PRIORITY_OPTIONS = [
  { id: 'food', label: 'Food & Catering' },
  { id: 'decor', label: 'Decor & Theme' },
  { id: 'photography', label: 'Photography & Video' },
  { id: 'entertainment', label: 'Entertainment & DJ' },
  { id: 'venue', label: 'Venue & Ambiance' },
  { id: 'guest comfort', label: 'Guest Comfort & Favors' },
];

const DIETARY_OPTIONS = [
  { id: 'veg', label: 'Vegetarian' },
  { id: 'jain', label: 'Strict Jain' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'none', label: 'No Special Restrictions' },
];

const FUNCTION_ADDON_OPTIONS = [
  { id: 'haldi', label: 'Haldi Ceremony', desc: 'Adds traditional turmeric setup & morning ritual timeline' },
  { id: 'mehndi', label: 'Mehndi Ceremony', desc: 'Adds henna artists, seating lounge & festive favors' },
  { id: 'sangeet', label: 'Sangeet Night', desc: 'Adds stage sound, DJ choreography & family dance timeline' },
];

export const INITIAL_FORM_STATE = {
  eventType: 'wedding',
  eventName: '',
  eventDate: '',
  city: '',
  venuePreference: 'either',
  guestCount: 150,
  budget: 800000,
  currency: 'INR',
  priorities: ['food', 'photography'],
  dietary: ['veg'],
  functionAddons: ['mehndi'],
  notes: '',
};

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EventForm({
  initialData,
  onSubmit,
  onReset,
  isLoading,
  apiError,
}) {
  const [formData, setFormData] = useState(() => {
    if (initialData) return initialData;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_FORM_STATE, ...parsed };
        }
      }
    } catch {
      // ignore localStorage errors
    }
    return INITIAL_FORM_STATE;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formId = useId();

  // Update form if initialData prop changes (e.g. preset clicked)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData]);

  // Persist form draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // storage unavailable
    }
  }, [formData]);

  // Validation function
  const validateField = (name, value, _currentData = formData) => {
    let error = '';
    const today = getTodayString();

    switch (name) {
      case 'eventName':
        if (!value || !value.trim()) {
          error = 'Please enter an event name';
        } else if (value.length > 100) {
          error = 'Event name cannot exceed 100 characters';
        }
        break;

      case 'eventDate':
        if (!value) {
          error = 'Please select a date for your celebration';
        } else if (value < today) {
          error = 'Event date cannot be in the past';
        }
        break;

      case 'city':
        if (!value || !value.trim()) {
          error = 'Please enter a host city';
        }
        break;

      case 'guestCount': {
        const num = Number(value);
        if (isNaN(num) || num < 1 || !Number.isInteger(num)) {
          error = 'Guest count must be at least 1';
        } else if (num > 2000) {
          error = 'Maximum guest count supported is 2000';
        }
        break;
      }

      case 'budget': {
        const b = Number(value);
        if (isNaN(b) || b <= 0) {
          error = 'Please enter a valid positive budget amount';
        } else if (b > 1000000000) {
          error = 'Budget cannot exceed ₹100 Crore';
        }
        break;
      }

      case 'notes':
        if (value && value.length > 500) {
          error = 'Notes cannot exceed 500 characters';
        }
        break;

      case 'priorities':
        if (Array.isArray(value) && value.length > 3) {
          error = 'You may select up to 3 top priorities';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let updatedValue = value;
    if (type === 'number') {
      updatedValue = value === '' ? '' : Number(value);
    }

    const updatedData = { ...formData, [name]: updatedValue };

    // If switching away from wedding, clear function addons
    if (name === 'eventType' && value !== 'wedding') {
      updatedData.functionAddons = [];
    }

    setFormData(updatedData);

    if (touched[name]) {
      const err = validateField(name, updatedValue, updatedData);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handlePriorityToggle = (priorityId) => {
    setTouched((prev) => ({ ...prev, priorities: true }));
    let updated = [...formData.priorities];
    if (updated.includes(priorityId)) {
      updated = updated.filter((id) => id !== priorityId);
    } else {
      if (updated.length >= 3) {
        setErrors((prev) => ({ ...prev, priorities: 'You can choose up to 3 top priorities.' }));
        return;
      }
      updated.push(priorityId);
    }

    setFormData((prev) => ({ ...prev, priorities: updated }));
    setErrors((prev) => ({ ...prev, priorities: '' }));
  };

  const handleDietaryToggle = (dietId) => {
    setTouched((prev) => ({ ...prev, dietary: true }));
    let updated = [...formData.dietary];

    if (dietId === 'none') {
      updated = ['none'];
    } else {
      updated = updated.filter((id) => id !== 'none');
      if (updated.includes(dietId)) {
        updated = updated.filter((id) => id !== dietId);
        if (updated.length === 0) updated = ['none'];
      } else {
        updated.push(dietId);
      }
    }

    setFormData((prev) => ({ ...prev, dietary: updated }));
  };

  const handleAddonToggle = (addonId) => {
    let updated = [...formData.functionAddons];
    if (updated.includes(addonId)) {
      updated = updated.filter((id) => id !== addonId);
    } else {
      updated.push(addonId);
    }
    setFormData((prev) => ({ ...prev, functionAddons: updated }));
  };

  const validateAll = () => {
    const newErrors = {};
    const fields = ['eventName', 'eventDate', 'city', 'guestCount', 'budget', 'notes', 'priorities'];

    fields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      eventName: true,
      eventDate: true,
      city: true,
      guestCount: true,
      budget: true,
      notes: true,
      priorities: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      onSubmit(formData);
    } else {
      // Focus first erroneous element
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(`${formId}-${firstErrorKey}`);
        if (el) el.focus();
      }
    }
  };

  const handleResetClick = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (onReset) onReset();
  };

  const perGuest =
    formData.budget > 0 && formData.guestCount > 0
      ? Math.round(formData.budget / formData.guestCount)
      : 0;

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate aria-label="Event Planning Form">
      {apiError && (
        <div className="form-alert form-alert--error" role="alert">
          <p className="alert-title">Could not generate plan</p>
          <p>{apiError}</p>
        </div>
      )}

      {/* ── Fieldset: Event Core Details ── */}
      <fieldset className="form-fieldset">
        <legend className="form-legend">Event Details</legend>

        <div className="form-row form-row--2col">
          <div className="form-group">
            <label htmlFor={`${formId}-eventType`} className="form-label">
              Celebration Type <span className="required-star" aria-hidden="true">*</span>
            </label>
            <select
              id={`${formId}-eventType`}
              name="eventType"
              className="form-control"
              value={formData.eventType}
              onChange={handleChange}
              onBlur={() => handleBlur('eventType')}
            >
              <option value="wedding">Wedding Celebration</option>
              <option value="birthday">Birthday Party</option>
              <option value="community">Community / Festive Gathering</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={`${formId}-eventName`} className="form-label">
              Celebration Name <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-eventName`}
              name="eventName"
              className={`form-control ${touched.eventName && errors.eventName ? 'form-control--error' : ''}`}
              placeholder="e.g. Riya & Aman Wedding"
              value={formData.eventName}
              onChange={handleChange}
              onBlur={() => handleBlur('eventName')}
              aria-invalid={!!(touched.eventName && errors.eventName)}
              aria-describedby={touched.eventName && errors.eventName ? `${formId}-eventName-error` : undefined}
            />
            {touched.eventName && errors.eventName && (
              <span id={`${formId}-eventName-error`} className="field-error" role="alert">
                {errors.eventName}
              </span>
            )}
          </div>
        </div>

        <div className="form-row form-row--3col">
          <div className="form-group">
            <label htmlFor={`${formId}-eventDate`} className="form-label">
              Event Date <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="date"
              id={`${formId}-eventDate`}
              name="eventDate"
              className={`form-control ${touched.eventDate && errors.eventDate ? 'form-control--error' : ''}`}
              value={formData.eventDate}
              onChange={handleChange}
              onBlur={() => handleBlur('eventDate')}
              min={getTodayString()}
              aria-invalid={!!(touched.eventDate && errors.eventDate)}
              aria-describedby={touched.eventDate && errors.eventDate ? `${formId}-eventDate-error` : undefined}
            />
            {touched.eventDate && errors.eventDate && (
              <span id={`${formId}-eventDate-error`} className="field-error" role="alert">
                {errors.eventDate}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`${formId}-city`} className="form-label">
              Host City <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-city`}
              name="city"
              className={`form-control ${touched.city && errors.city ? 'form-control--error' : ''}`}
              placeholder="e.g. Lucknow, Mumbai, Delhi"
              value={formData.city}
              onChange={handleChange}
              onBlur={() => handleBlur('city')}
              aria-invalid={!!(touched.city && errors.city)}
              aria-describedby={touched.city && errors.city ? `${formId}-city-error` : undefined}
            />
            {touched.city && errors.city && (
              <span id={`${formId}-city-error`} className="field-error" role="alert">
                {errors.city}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`${formId}-venuePreference`} className="form-label">
              Venue Preference
            </label>
            <select
              id={`${formId}-venuePreference`}
              name="venuePreference"
              className="form-control"
              value={formData.venuePreference}
              onChange={handleChange}
            >
              <option value="indoor">Indoor (Banquet / Hall)</option>
              <option value="outdoor">Outdoor (Lawn / Open-air)</option>
              <option value="either">Flexible / Either</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Fieldset: Guests & Budget ── */}
      <fieldset className="form-fieldset">
        <legend className="form-legend">Guests & Budget</legend>

        <div className="form-row form-row--2col">
          <div className="form-group">
            <label htmlFor={`${formId}-guestCount`} className="form-label">
              Expected Guest Count <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="number"
              id={`${formId}-guestCount`}
              name="guestCount"
              className={`form-control ${touched.guestCount && errors.guestCount ? 'form-control--error' : ''}`}
              value={formData.guestCount}
              onChange={handleChange}
              onBlur={() => handleBlur('guestCount')}
              min="1"
              max="2000"
              aria-invalid={!!(touched.guestCount && errors.guestCount)}
              aria-describedby={touched.guestCount && errors.guestCount ? `${formId}-guestCount-error` : undefined}
            />
            {touched.guestCount && errors.guestCount && (
              <span id={`${formId}-guestCount-error`} className="field-error" role="alert">
                {errors.guestCount}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`${formId}-budget`} className="form-label">
              Total Budget (INR ₹) <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="number"
              id={`${formId}-budget`}
              name="budget"
              className={`form-control ${touched.budget && errors.budget ? 'form-control--error' : ''}`}
              value={formData.budget}
              onChange={handleChange}
              onBlur={() => handleBlur('budget')}
              min="1000"
              step="5000"
              aria-invalid={!!(touched.budget && errors.budget)}
              aria-describedby={touched.budget && errors.budget ? `${formId}-budget-error` : undefined}
            />
            {touched.budget && errors.budget && (
              <span id={`${formId}-budget-error`} className="field-error" role="alert">
                {errors.budget}
              </span>
            )}
          </div>
        </div>

        {/* Live per-guest preview pill */}
        <div className="live-metric-pill" aria-live="polite">
          <span className="metric-label">Estimated Spend Per Guest:</span>
          <span className="metric-value">₹{perGuest.toLocaleString('en-IN')}</span>
          <span className="metric-note">
            (Calculated across {formData.guestCount || 0} guests)
          </span>
        </div>
      </fieldset>

      {/* ── Fieldset: Priorities & Dietary Preferences ── */}
      <fieldset className="form-fieldset">
        <legend className="form-legend">Priorities & Preferences</legend>

        <div className="form-group">
          <label className="form-label">
            Top Priorities (Select up to 3)
          </label>
          <p className="field-help" id={`${formId}-prio-help`}>
            Our rules engine allocates a 4% extra budget shift to your selected priorities.
          </p>
          <div
            className="chips-group"
            role="group"
            aria-describedby={`${formId}-prio-help`}
            aria-label="Event priorities"
          >
            {PRIORITY_OPTIONS.map((prio) => {
              const isChecked = formData.priorities.includes(prio.id);
              return (
                <button
                  type="button"
                  key={prio.id}
                  className={`chip-button ${isChecked ? 'chip-button--active' : ''}`}
                  onClick={() => handlePriorityToggle(prio.id)}
                  aria-pressed={isChecked}
                >
                  <span className="chip-indicator" aria-hidden="true">
                    {isChecked ? '✓' : '+'}
                  </span>
                  {prio.label}
                </button>
              );
            })}
          </div>
          {errors.priorities && (
            <span className="field-error" role="alert">
              {errors.priorities}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Dietary Requirements</label>
          <div className="checkboxes-row" role="group" aria-label="Dietary preferences">
            {DIETARY_OPTIONS.map((diet) => {
              const isChecked = formData.dietary.includes(diet.id);
              return (
                <label key={diet.id} className="checkbox-card">
                  <input
                    type="checkbox"
                    name="dietary"
                    value={diet.id}
                    checked={isChecked}
                    onChange={() => handleDietaryToggle(diet.id)}
                  />
                  <span>{diet.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <div className="label-with-counter">
            <label htmlFor={`${formId}-notes`} className="form-label">
              Special Notes & Traditions (Optional)
            </label>
            <span
              className={`char-counter ${(formData.notes || '').length > 480 ? 'char-counter--warning' : ''}`}
            >
              {(formData.notes || '').length} / 500
            </span>
          </div>
          <textarea
            id={`${formId}-notes`}
            name="notes"
            rows="3"
            className={`form-control ${errors.notes ? 'form-control--error' : ''}`}
            placeholder="e.g. Royal Nawabi vibe, live saxophone welcome, traditional phera timing at sunset"
            value={formData.notes || ''}
            onChange={handleChange}
            onBlur={() => handleBlur('notes')}
            maxLength={500}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? `${formId}-notes-error` : undefined}
          />
          {errors.notes && (
            <span id={`${formId}-notes-error`} className="field-error" role="alert">
              {errors.notes}
            </span>
          )}
        </div>
      </fieldset>

      {/* ── Conditional Fieldset: Wedding Add-ons ── */}
      {formData.eventType === 'wedding' && (
        <fieldset className="form-fieldset form-fieldset--accent">
          <legend className="form-legend">Wedding Ceremony Add-ons</legend>
          <p className="field-help">
            Add-ons introduce transparent budget rows and rituals into your timeline without increasing your overall budget.
          </p>
          <div className="addons-grid" role="group" aria-label="Wedding ritual add-ons">
            {FUNCTION_ADDON_OPTIONS.map((addon) => {
              const isChecked = formData.functionAddons.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`addon-card ${isChecked ? 'addon-card--active' : ''}`}
                >
                  <input
                    type="checkbox"
                    name="functionAddons"
                    value={addon.id}
                    checked={isChecked}
                    onChange={() => handleAddonToggle(addon.id)}
                  />
                  <div className="addon-details">
                    <span className="addon-title">{addon.label}</span>
                    <span className="addon-desc">{addon.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* ── Form Actions ── */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary btn--large"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="loading-state">
              <span className="spinner" aria-hidden="true"></span>
              Generating Your Intelligent Plan...
            </span>
          ) : (
            'Generate Event Plan'
          )}
        </button>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleResetClick}
          disabled={isLoading}
        >
          Reset Form
        </button>
      </div>
    </form>
  );
}

EventForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onReset: PropTypes.func,
  isLoading: PropTypes.bool,
  apiError: PropTypes.string,
};
