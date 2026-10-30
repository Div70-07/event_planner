import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import VendorChecklist from '../components/VendorChecklist.jsx';

const MOCK_VENDORS = [
  {
    type: 'Venue',
    budgetShare: 30,
    checklist: ['Visit 3 venues', 'Check capacity', 'Review cancellation clause'],
  },
  {
    type: 'Catering',
    budgetShare: 25,
    checklist: ['Schedule food tasting', 'Confirm staff count'],
  },
];

describe('VendorChecklist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all vendor types', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    expect(screen.getByText('Venue')).toBeTruthy();
    expect(screen.getByText('Catering')).toBeTruthy();
  });

  it('renders checklist items for each vendor', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    expect(screen.getByText('Visit 3 venues')).toBeTruthy();
    expect(screen.getByText('Schedule food tasting')).toBeTruthy();
  });

  it('shows overall progress label', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    expect(screen.getByText(/0\/5 items verified/i)).toBeTruthy();
  });

  it('checking an item updates progress', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    const checkbox = screen.getByLabelText('Visit 3 venues');
    fireEvent.click(checkbox);
    expect(screen.getByText(/1\/5 items verified/i)).toBeTruthy();
  });

  it('persists checked state to localStorage', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    const checkbox = screen.getByLabelText('Check capacity');
    fireEvent.click(checkbox);
    const stored = JSON.parse(localStorage.getItem('event_planner_checklist_vendors'));
    expect(stored['Venue::Check capacity']).toBe(true);
  });

  it('renders whatsapp inquiry links for each vendor', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    const waLinks = screen.getAllByRole('link', { name: /enquire.*whatsapp/i });
    expect(waLinks.length).toBe(2);
    waLinks.forEach((link) => {
      expect(link.href).toContain('wa.me');
    });
  });

  it('renders the section heading', () => {
    render(<VendorChecklist vendors={MOCK_VENDORS} totalBudget={1000000} />);
    expect(screen.getByRole('heading', { name: /Vendor Checklist/i })).toBeTruthy();
  });
});
