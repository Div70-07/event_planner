import { ALLOCATION_RULES } from '../../config/eventConfig.js';

/**
 * Priority to Category mapping
 */
const PRIORITY_TO_CATEGORY = {
  food: 'catering',
  catering: 'catering',
  decor: 'decor',
  entertainment: 'entertainment',
  photography: 'photography',
  venue: 'venue',
  'guest comfort': 'attire',
  attire: 'attire',
};

/**
 * Generates deterministic trade-off suggestions based on user priorities.
 * Identifies categories that can spare budget without violating floors,
 * and suggests shifting percentage to a prioritized or core category.
 *
 * @param {Array<{ category: string, key: string, percent: number, amount: number }>} budgetItems
 * @param {string[]} priorities
 * @param {number} totalBudget
 * @returns {Array<{ fromCategory: string, toCategory: string, percent: number, amount: number, reason: string }>}
 */
export function generateTradeoffs(budgetItems = [], priorities = [], totalBudget = 0) {
  if (!Array.isArray(budgetItems) || budgetItems.length === 0 || totalBudget <= 0) {
    return [];
  }

  const prioritizedKeys = new Set(
    priorities.map((p) => PRIORITY_TO_CATEGORY[p]).filter(Boolean)
  );

  // Separate non-priority donors and potential priority beneficiaries
  const donors = [];
  const beneficiaries = [];

  for (const item of budgetItems) {
    // Contingency is NEVER a donor for trade-offs
    if (item.key === 'contingency') {
      continue;
    }

    // Check available surplus above minimum floor
    const minFloor = ALLOCATION_RULES.MIN_CATEGORY_FLOOR;
    const surplus = item.percent - minFloor;

    if (!prioritizedKeys.has(item.key) && surplus >= 3) {
      donors.push({ ...item, surplus });
    } else if (prioritizedKeys.has(item.key)) {
      beneficiaries.push(item);
    }
  }

  // Sort donors descending by surplus
  donors.sort((a, b) => b.surplus - a.surplus);

  // If no prioritized beneficiaries specified by user, look for core categories that could benefit
  if (beneficiaries.length === 0) {
    const coreBeneficiary = budgetItems.find(
      (b) => (b.key === 'catering' || b.key === 'venue') && !donors.some((d) => d.key === b.key)
    );
    if (coreBeneficiary) {
      beneficiaries.push(coreBeneficiary);
    }
  }

  const tradeoffs = [];
  const shiftPercent = 3; // Modest, actionable percentage shift

  for (const donor of donors) {
    if (beneficiaries.length === 0) {
      break;
    }

    // Pick top beneficiary
    const target = beneficiaries[tradeoffs.length % beneficiaries.length];
    if (donor.key === target.key) {
      continue;
    }

    if (donor.surplus >= shiftPercent) {
      const shiftAmount = Math.round((shiftPercent / 100) * totalBudget);

      tradeoffs.push({
        fromCategory: donor.category,
        toCategory: target.category,
        percent: shiftPercent,
        amount: shiftAmount,
        reason: `Reallocate 3% (₹${shiftAmount.toLocaleString('en-IN')}) from ${donor.category} to ${target.category} to strengthen your top preference.`,
      });
    }

    // Spec recommends at most 2 targeted trade-off options
    if (tradeoffs.length >= 2) {
      break;
    }
  }

  return tradeoffs;
}
