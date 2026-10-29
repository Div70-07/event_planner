import { getCityTier, CITY_TIER_THRESHOLDS } from '../../config/eventConfig.js';

/**
 * Calculates budget health based on per-guest spend versus city-tier thresholds.
 *
 * @param {Object} params
 * @param {string} params.eventType - 'wedding' | 'birthday' | 'community'
 * @param {number} params.budget - Total budget in INR
 * @param {number} params.guestCount - Number of guests
 * @param {string} params.city - City name
 * @returns {{ status: 'comfortable' | 'moderate' | 'tight', message: string, perGuestCost: number, tierThreshold: number, cityTier: string }}
 */
export function calculateBudgetHealth({
  eventType = 'wedding',
  budget,
  guestCount,
  city = '',
}) {
  const cityTier = getCityTier(city);
  const tierThresholds = CITY_TIER_THRESHOLDS[eventType] || CITY_TIER_THRESHOLDS.wedding;
  const threshold = tierThresholds[cityTier] || tierThresholds.tier3;

  const perGuestCost = Math.round(budget / Math.max(1, guestCount));

  let status = 'moderate';
  let message = '';

  if (perGuestCost >= threshold * 1.35) {
    status = 'comfortable';
    message = `Comfortable budget (₹${perGuestCost.toLocaleString('en-IN')}/guest). Fits well within typical ${cityTier.toUpperCase()} costs for ${eventType}s (baseline: ₹${threshold.toLocaleString('en-IN')}/guest).`;
  } else if (perGuestCost >= threshold) {
    status = 'moderate';
    message = `Balanced budget (₹${perGuestCost.toLocaleString('en-IN')}/guest). Aligns with standard ${cityTier.toUpperCase()} market averages (baseline: ₹${threshold.toLocaleString('en-IN')}/guest).`;
  } else {
    status = 'tight';
    message = `Tight budget (₹${perGuestCost.toLocaleString('en-IN')}/guest). Below typical ${cityTier.toUpperCase()} recommended benchmark of ₹${threshold.toLocaleString('en-IN')}/guest. Watch vendor fees and guest count closely.`;
  }

  return {
    status,
    message,
    perGuestCost,
    tierThreshold: threshold,
    cityTier,
  };
}
