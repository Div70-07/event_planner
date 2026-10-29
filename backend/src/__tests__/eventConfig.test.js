import { describe, it, expect } from 'vitest';
import {
  EVENT_TYPES,
  STARTING_BUDGET_PERCENTAGES,
  ALLOCATION_RULES,
  getCityTier,
  CITY_TIER_THRESHOLDS,
  TIMELINE_MILESTONES,
} from '../config/eventConfig.js';

describe('Event Configuration (eventConfig.js)', () => {
  it('has starting budget percentages summing to exactly 100 for all event types', () => {
    for (const type of EVENT_TYPES) {
      const budgetMap = STARTING_BUDGET_PERCENTAGES[type];
      expect(budgetMap).toBeDefined();
      const total = Object.values(budgetMap).reduce((sum, val) => sum + val, 0);
      expect(total).toBe(100);
    }
  });

  it('enforces minimum category and contingency floors', () => {
    expect(ALLOCATION_RULES.MIN_CATEGORY_FLOOR).toBe(2);
    expect(ALLOCATION_RULES.CONTINGENCY_FLOOR).toBe(5);
  });

  it('correctly maps known cities to tiers', () => {
    expect(getCityTier('Mumbai')).toBe('metro');
    expect(getCityTier('Delhi')).toBe('metro');
    expect(getCityTier('Lucknow')).toBe('tier2');
    expect(getCityTier('Jaipur')).toBe('tier2');
    expect(getCityTier('Agra')).toBe('tier3');
  });

  it('safely defaults unknown or invalid cities to tier3', () => {
    expect(getCityTier('UnknownCityXyz')).toBe('tier3');
    expect(getCityTier('')).toBe('tier3');
    expect(getCityTier(null)).toBe('tier3');
  });

  it('defines per-guest thresholds for all event types and tiers', () => {
    for (const type of EVENT_TYPES) {
      const thresholds = CITY_TIER_THRESHOLDS[type];
      expect(thresholds.metro).toBeGreaterThan(thresholds.tier2);
      expect(thresholds.tier2).toBeGreaterThan(thresholds.tier3);
    }
  });

  it('defines milestone lists for all event types', () => {
    for (const type of EVENT_TYPES) {
      const milestones = TIMELINE_MILESTONES[type];
      expect(Array.isArray(milestones)).toBe(true);
      expect(milestones.length).toBeGreaterThan(0);
    }
  });
});
