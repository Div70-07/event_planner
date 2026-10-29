import { getCityTier, CITY_TIER_THRESHOLDS } from '../../config/eventConfig.js';
import { getDaysRemaining } from './timelineGenerator.js';

/**
 * Generates deterministic, rules-based warnings based on budget, guest count,
 * city tier, date urgency, and weather exposure.
 *
 * @param {Object} params
 * @param {string} params.eventType - 'wedding' | 'birthday' | 'community'
 * @param {number} params.budget - Total budget in INR
 * @param {number} params.guestCount - Number of guests
 * @param {string} params.city - City name
 * @param {string} params.eventDate - YYYY-MM-DD
 * @param {string} params.currentDate - YYYY-MM-DD
 * @param {string} [params.venuePreference] - 'indoor' | 'outdoor' | 'either'
 * @returns {string[]} List of actionable warnings
 */
export function generateWarnings({
  eventType = 'wedding',
  budget,
  guestCount,
  city = '',
  eventDate,
  currentDate,
  venuePreference = 'either',
}) {
  const warnings = [];
  const cityTier = getCityTier(city);
  const tierMap = CITY_TIER_THRESHOLDS[eventType] || CITY_TIER_THRESHOLDS.wedding;
  const threshold = tierMap[cityTier] || tierMap.tier3;
  const perGuestCost = Math.round(budget / Math.max(1, guestCount));
  const daysRemaining = getDaysRemaining(eventDate, currentDate);

  // 1. City Tier Per-Guest Budget Warning
  if (perGuestCost < threshold) {
    const tierName = cityTier === 'metro' ? 'Metro' : cityTier === 'tier2' ? 'Tier-2' : 'Tier-3';
    warnings.push(
      `Budget may be tight for this guest count in this city tier. Your per-guest budget of ₹${perGuestCost.toLocaleString('en-IN')} is below the typical ${tierName} benchmark of ₹${threshold.toLocaleString('en-IN')} for ${eventType}s in ${city || 'this area'}. Consider streamlining the guest list or reviewing trade-off options.`
    );
  }

  // 2. High Guest Count relative to budget Warning
  if (guestCount >= 400 && perGuestCost < threshold * 1.1) {
    warnings.push(
      `Large guest count (${guestCount} guests) with a lean budget will put pressure on catering and venue capacity. Prioritize fixed-plate catering contracts and avoid open-ended bar/dessert additions.`
    );
  }

  // 3. Date Urgency Warning
  if (daysRemaining < 14) {
    warnings.push(
      `Event is only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} away! Panic Mode is activated to prioritize immediate vendor lock-ins and simplify non-essential tasks.`
    );
  } else if (daysRemaining < 30) {
    warnings.push(
      `Event is only ${daysRemaining} days away. Compressed timeline mode active — venue, catering, and photography should be finalized immediately without extended negotiations.`
    );
  }

  // 4. Outdoor Weather Exposure Warning
  if (venuePreference === 'outdoor') {
    const eventMonth = parseInt(eventDate.split('-')[1], 10);
    let weatherNote = 'General outdoor weather backup advised.';
    if (eventMonth >= 6 && eventMonth <= 9) {
      weatherNote = 'Peak monsoon season in most parts of India — waterproof canopy, raised wooden flooring, and enclosed dining pavilions are essential.';
    } else if (eventMonth >= 4 && eventMonth <= 5) {
      weatherNote = 'Peak summer season — high-capacity outdoor misting fans, air-coolers, and shaded canopies are recommended.';
    } else if (eventMonth === 12 || eventMonth === 1) {
      weatherNote = 'Winter season — outdoor lawn heaters, bonfire setups, and warm welcome beverages are recommended for evening gatherings.';
    }

    warnings.push(
      `Outdoor venue selected: Plausible weather exposure. ${weatherNote} A 3% weatherproofing allowance has been factored into your budget.`
    );
  }

  return warnings;
}
