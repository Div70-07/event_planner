import { describe, it, expect } from 'vitest';
import { calculateBudgetAllocation } from '../services/rulesEngine/budgetCalculator.js';
import { generateTradeoffs } from '../services/rulesEngine/tradeoffEngine.js';
import { calculateBudgetHealth } from '../services/rulesEngine/budgetHealth.js';

describe('Rules Engine — Budget Allocation & Calculations', () => {
  it('allocates budget so the sum of row amounts equals the input budget exactly', () => {
    const testBudgets = [800000, 50000, 1234567, 999999, 15000, 10000000];

    for (const budget of testBudgets) {
      const items = calculateBudgetAllocation({
        eventType: 'wedding',
        budget,
        guestCount: 150,
        priorities: ['food', 'photography'],
        venuePreference: 'outdoor',
        functionAddons: ['haldi', 'mehndi', 'sangeet'],
      });

      const totalAllocated = items.reduce((sum, item) => sum + item.amount, 0);
      expect(totalAllocated).toBe(budget);
    }
  });

  it('guarantees no category falls below the 2% floor and contingency >= 5%', () => {
    const items = calculateBudgetAllocation({
      eventType: 'wedding',
      budget: 800000,
      guestCount: 150,
      priorities: ['food', 'venue', 'entertainment'],
      functionAddons: ['haldi', 'mehndi', 'sangeet'],
    });

    for (const item of items) {
      if (item.key === 'contingency') {
        expect(item.percent).toBeGreaterThanOrEqual(5);
      } else {
        expect(item.percent).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('shifts budget percentage towards prioritized categories', () => {
    const standard = calculateBudgetAllocation({
      eventType: 'wedding',
      budget: 500000,
      guestCount: 100,
      priorities: [],
    });

    const withPhotographyPriority = calculateBudgetAllocation({
      eventType: 'wedding',
      budget: 500000,
      guestCount: 100,
      priorities: ['photography'],
    });

    const photoStandard = standard.find((i) => i.key === 'photography');
    const photoBoosted = withPhotographyPriority.find((i) => i.key === 'photography');

    expect(photoBoosted.percent).toBeGreaterThan(photoStandard.percent);
    expect(photoBoosted.amount).toBeGreaterThan(photoStandard.amount);
  });

  it('adds dedicated transparent budget lines for wedding add-ons without exceeding total budget', () => {
    const items = calculateBudgetAllocation({
      eventType: 'wedding',
      budget: 1000000,
      guestCount: 200,
      functionAddons: ['haldi', 'mehndi', 'sangeet'],
    });

    const haldiItem = items.find((i) => i.key === 'haldi');
    const mehndiItem = items.find((i) => i.key === 'mehndi');
    const sangeetItem = items.find((i) => i.key === 'sangeet');

    expect(haldiItem).toBeDefined();
    expect(mehndiItem).toBeDefined();
    expect(sangeetItem).toBeDefined();

    expect(haldiItem.amount).toBeGreaterThan(0);
    expect(mehndiItem.amount).toBeGreaterThan(0);
    expect(sangeetItem.amount).toBeGreaterThan(0);

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(1000000);
  });

  it('adds outdoor weather buffer when outdoor venue preference is selected', () => {
    const outdoorItems = calculateBudgetAllocation({
      eventType: 'birthday',
      budget: 100000,
      guestCount: 50,
      venuePreference: 'outdoor',
    });

    const contingency = outdoorItems.find((i) => i.key === 'contingency');
    expect(contingency.rationale).toMatch(/weatherproofing/i);
  });
});

describe('Rules Engine — Trade-off Suggestions', () => {
  it('generates deterministic trade-off suggestions identifying donor, target, and amounts', () => {
    const budget = 800000;
    const items = calculateBudgetAllocation({
      eventType: 'wedding',
      budget,
      guestCount: 150,
      priorities: ['photography'],
    });

    const tradeoffs = generateTradeoffs(items, ['photography'], budget);

    expect(tradeoffs.length).toBeGreaterThan(0);
    for (const t of tradeoffs) {
      expect(t.fromCategory).toBeDefined();
      expect(t.toCategory).toBe('Photography & Video');
      expect(t.percent).toBe(3);
      expect(t.amount).toBe(Math.round((3 / 100) * budget));
      expect(t.fromCategory).not.toBe('Contingency & Emergency');
    }
  });

  it('returns empty array if no valid trade-off exists or budget is invalid', () => {
    expect(generateTradeoffs([], [], 0)).toEqual([]);
  });
});

describe('Rules Engine — Budget Health by City Tier', () => {
  it('evaluates budget health accurately across city tiers for identical budget and guest count', () => {
    const params = {
      eventType: 'wedding',
      budget: 200000,
      guestCount: 150, // ₹1,333 per guest
    };

    // In Metro (threshold: 2500), ₹1333 is tight
    const metroHealth = calculateBudgetHealth({ ...params, city: 'Mumbai' });
    expect(metroHealth.cityTier).toBe('metro');
    expect(metroHealth.status).toBe('tight');

    // In Tier-2 (threshold: 1500), ₹1333 is tight/moderate
    const tier2Health = calculateBudgetHealth({ ...params, city: 'Lucknow' });
    expect(tier2Health.cityTier).toBe('tier2');

    // In Tier-3 (threshold: 900), ₹1333 is comfortable (> 900 * 1.35 = 1215)
    const tier3Health = calculateBudgetHealth({ ...params, city: 'Agra' });
    expect(tier3Health.cityTier).toBe('tier3');
    expect(tier3Health.status).toBe('comfortable');
  });
});
