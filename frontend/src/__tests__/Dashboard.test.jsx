import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Dashboard from '../components/Dashboard.jsx';
import { SAMPLE_PLAN, SAMPLE_EVENT_META } from '../data/samplePlan.js';

describe('Dashboard', () => {
  const onBackToForm = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders with sample plan without crashing', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByText(/Wedding Plan/i)).toBeTruthy();
  });

  it('shows sample ribbon when isSample is true', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByText(/Sample Plan/i)).toBeTruthy();
  });

  it('shows event meta chips (city, guests, budget)', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    // Use getAllByText since "Jaipur" may appear in both the chip and in descriptive text
    const jaipur = screen.getAllByText(/Jaipur/i);
    expect(jaipur.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/250 guests/i).length).toBeGreaterThan(0);
  });

  it('renders all nav section links', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByRole('link', { name: /Budget/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Timeline/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Vendors/i })).toBeTruthy();
  });

  it('calls onBackToForm when back button is clicked', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    const backBtn = screen.getByRole('button', { name: /Go back to event form/i });
    fireEvent.click(backBtn);
    expect(onBackToForm).toHaveBeenCalledOnce();
  });

  it('renders BudgetBreakdown section', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByRole('heading', { name: /Budget Breakdown/i })).toBeTruthy();
  });

  it('renders Timeline section', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByRole('heading', { name: /Planning Timeline/i })).toBeTruthy();
  });

  it('renders VendorChecklist section', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={SAMPLE_EVENT_META}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByRole('heading', { name: /Vendor Checklist/i })).toBeTruthy();
  });

  it('renders without eventMeta gracefully', () => {
    render(
      <Dashboard
        result={SAMPLE_PLAN}
        eventMeta={null}
        onBackToForm={onBackToForm}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: /Event Plan/i })).toBeTruthy();
  });
});
