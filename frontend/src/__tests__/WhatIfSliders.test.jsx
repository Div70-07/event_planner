import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WhatIfSliders from '../components/WhatIfSliders.jsx';

const MOCK_BUDGET = [
  { key: 'venue', category: 'Venue & Decor', percent: 30, amount: 300000, rationale: 'Standard venue' },
  { key: 'catering', category: 'Catering & Food', percent: 28, amount: 280000, rationale: 'Buffet setup' },
  { key: 'contingency', category: 'Contingency', percent: 8, amount: 80000, rationale: 'Safety reserve' },
];

describe('WhatIfSliders', () => {
  it('renders slider controls and headings', () => {
    render(<WhatIfSliders initialBudget={MOCK_BUDGET} initialGuests={200} totalBudget={1000000} />);
    expect(screen.getByRole('heading', { name: /What-If Scenario Simulator/i })).toBeTruthy();
    expect(screen.getByLabelText(/Expected Guest Count/i)).toBeTruthy();
    expect(screen.getByLabelText(/Decor & Venue Allocation Shift/i)).toBeTruthy();
    expect(screen.getByLabelText(/Food & Catering Allocation Shift/i)).toBeTruthy();
  });

  it('updates guest count and cost per guest live without api call', () => {
    render(<WhatIfSliders initialBudget={MOCK_BUDGET} initialGuests={200} totalBudget={1000000} />);
    const guestSlider = screen.getByLabelText(/Expected Guest Count/i);

    // Initial value
    expect(screen.getByText('200 guests')).toBeTruthy();

    // Move slider to 400 guests
    fireEvent.change(guestSlider, { target: { value: '400' } });

    expect(screen.getByText('400 guests')).toBeTruthy();
    expect(screen.getByText('across 400 guests')).toBeTruthy();
  });

  it('adjusts decor spend when shifting decor slider', () => {
    render(<WhatIfSliders initialBudget={MOCK_BUDGET} initialGuests={200} totalBudget={1000000} />);
    const decorSlider = screen.getByLabelText(/Decor & Venue Allocation Shift/i);

    // Shift +5% (₹50,000 on 10L budget) -> 300,000 + 50,000 = 350,000
    fireEvent.change(decorSlider, { target: { value: '5' } });

    expect(screen.getByText('+5%')).toBeTruthy();
    expect(screen.getByText('Reset Simulation')).toBeTruthy();
  });

  it('resets sliders back to baseline when clicking reset', () => {
    render(<WhatIfSliders initialBudget={MOCK_BUDGET} initialGuests={200} totalBudget={1000000} />);
    const guestSlider = screen.getByLabelText(/Expected Guest Count/i);

    fireEvent.change(guestSlider, { target: { value: '500' } });
    expect(screen.getByText('Reset Simulation')).toBeTruthy();

    fireEvent.click(screen.getByText('Reset Simulation'));
    expect(screen.getByText('200 guests')).toBeTruthy();
  });
});
