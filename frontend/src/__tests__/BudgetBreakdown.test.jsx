import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BudgetBreakdown from '../components/BudgetBreakdown.jsx';

const MOCK_BUDGET = [
  { key: 'venue', category: 'Venue & Decor', percent: 35, amount: 350000, rationale: 'Heritage venue premium.' },
  { key: 'catering', category: 'Catering', percent: 30, amount: 300000, rationale: 'Large guest count.' },
  { key: 'photography', category: 'Photography', percent: 12, amount: 120000, rationale: 'Candid coverage.' },
  { key: 'contingency', category: 'Contingency', percent: 8, amount: 80000, rationale: 'Safety buffer.' },
  { key: 'entertainment', category: 'Entertainment', percent: 8, amount: 80000, rationale: 'DJ + folk.' },
  { key: 'attire', category: 'Attire', percent: 7, amount: 70000, rationale: 'Bridal wear.' },
];

const MOCK_BUDGET_HEALTH = {
  status: 'comfortable',
  message: 'Budget is well within range for this city.',
};

const MOCK_TRADEOFFS = [
  {
    fromCategory: 'Entertainment',
    toCategory: 'Photography',
    percent: 3,
    amount: 30000,
    reason: 'Memories last longer.',
  },
];

describe('BudgetBreakdown', () => {
  it('renders all budget categories', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.getByText('Venue & Decor')).toBeTruthy();
    expect(screen.getByText('Catering')).toBeTruthy();
    expect(screen.getByText('Contingency')).toBeTruthy();
  });

  it('renders the section heading', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.getByRole('heading', { name: /Budget Breakdown/i })).toBeTruthy();
  });

  it('shows budget health status', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.getByText(/Comfortable Budget/i)).toBeTruthy();
  });

  it('shows total row with correct percentage sum', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renders trade-off suggestions when provided', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={MOCK_TRADEOFFS}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.getByText(/Trade-off Recommendations/i)).toBeTruthy();
    expect(screen.getByText('Memories last longer.')).toBeTruthy();
  });

  it('does not render trade-offs section when array is empty', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={MOCK_BUDGET_HEALTH}
      />,
    );
    expect(screen.queryByText(/Trade-off Recommendations/i)).toBeNull();
  });

  it('shows tight budget health indicator', () => {
    render(
      <BudgetBreakdown
        budget={MOCK_BUDGET}
        tradeoffs={[]}
        budgetHealth={{ status: 'tight', message: 'Budget is very tight.' }}
      />,
    );
    expect(screen.getByText(/Tight Budget/i)).toBeTruthy();
  });
});
