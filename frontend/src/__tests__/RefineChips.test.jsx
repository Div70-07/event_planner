import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RefineChips from '../components/RefineChips.jsx';

const MOCK_META = {
  eventType: 'wedding',
  budget: 1000000,
  guestCount: 200,
  city: 'Jaipur',
  dietary: ['veg'],
  priorities: ['venue', 'catering'],
};

describe('RefineChips', () => {
  it('renders refine buttons with clear labels', () => {
    render(<RefineChips currentMeta={MOCK_META} onRefine={vi.fn()} isLoading={false} activeRefineLabel="" />);
    expect(screen.getByRole('button', { name: /Make it 15% Cheaper/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Strict Vegetarian Focus/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Prioritise Live Music & DJ/i })).toBeTruthy();
  });

  it('triggers onRefine callback with modified values for cheaper preset', () => {
    const onRefine = vi.fn();
    render(<RefineChips currentMeta={MOCK_META} onRefine={onRefine} isLoading={false} activeRefineLabel="" />);

    fireEvent.click(screen.getByRole('button', { name: /Make it 15% Cheaper/i }));
    expect(onRefine).toHaveBeenCalledWith(
      expect.objectContaining({ budget: 850000 }),
      'Budget lowered by 15%',
    );
  });

  it('triggers onRefine callback with vegetarian and jain dietary check', () => {
    const onRefine = vi.fn();
    render(<RefineChips currentMeta={MOCK_META} onRefine={onRefine} isLoading={false} activeRefineLabel="" />);

    fireEvent.click(screen.getByRole('button', { name: /Strict Vegetarian Focus/i }));
    expect(onRefine).toHaveBeenCalledWith(
      expect.objectContaining({ dietary: expect.arrayContaining(['veg', 'jain']) }),
      'Dietary updated to Vegetarian & Jain',
    );
  });

  it('displays applied refinement feedback banner when activeRefineLabel is provided', () => {
    render(
      <RefineChips
        currentMeta={MOCK_META}
        onRefine={vi.fn()}
        isLoading={false}
        activeRefineLabel="Budget lowered by 15%"
      />,
    );
    expect(screen.getByText(/Budget lowered by 15%/i)).toBeTruthy();
  });
});
