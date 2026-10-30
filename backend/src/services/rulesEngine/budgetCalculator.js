import {
  STARTING_BUDGET_PERCENTAGES,
  CATEGORY_METADATA,
  ALLOCATION_RULES,
  FUNCTION_ADDON_CONFIG,
} from '../../config/eventConfig.js';

/**
 * Maps priority keys (e.g. 'food', 'decor', 'photography') to category keys.
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
 * Calculates deterministic budget allocation matching the requested budget exactly.
 *
 * @param {Object} input
 * @param {string} input.eventType - 'wedding' | 'birthday' | 'community'
 * @param {number} input.budget - Total budget in INR
 * @param {number} input.guestCount - Number of guests
 * @param {string[]} [input.priorities] - User priorities
 * @param {string} [input.venuePreference] - 'indoor' | 'outdoor' | 'either'
 * @param {string[]} [input.functionAddons] - Optional wedding add-ons ('haldi', 'mehndi', 'sangeet')
 * @returns {Array<{ category: string, key: string, percent: number, amount: number, rationale: string }>}
 */
export function calculateBudgetAllocation({
  eventType = 'wedding',
  budget,
  priorities = [],
  venuePreference = 'either',
  functionAddons = [],
}) {
  const basePercentages = { ...(STARTING_BUDGET_PERCENTAGES[eventType] || STARTING_BUDGET_PERCENTAGES.wedding) };
  const categories = Object.keys(basePercentages);

  // 1. Map user priorities to category keys
  const prioritizedCategoryKeys = new Set(
    priorities.map((p) => PRIORITY_TO_CATEGORY[p]).filter(Boolean)
  );

  // 2. Adjust percentages based on priorities
  const currentPercentages = { ...basePercentages };
  const shiftAmount = ALLOCATION_RULES.PRIORITY_SHIFT_PERCENT;

  for (const prioCat of prioritizedCategoryKeys) {
    if (!(prioCat in currentPercentages)) {
      continue;
    }

    // Categories eligible to donate percentage (must not be in priorities and not contingency)
    const donors = categories.filter(
      (cat) =>
        cat !== prioCat &&
        cat !== 'contingency' &&
        !prioritizedCategoryKeys.has(cat) &&
        currentPercentages[cat] - ALLOCATION_RULES.MIN_CATEGORY_FLOOR >= 1
    );

    if (donors.length > 0) {
      // Calculate how much we can safely take from donors
      const deductionPerDonor = shiftAmount / donors.length;
      let totalDeducted = 0;

      for (const donor of donors) {
        const available = currentPercentages[donor] - ALLOCATION_RULES.MIN_CATEGORY_FLOOR;
        const toDeduct = Math.min(deductionPerDonor, available);
        currentPercentages[donor] -= toDeduct;
        totalDeducted += toDeduct;
      }

      currentPercentages[prioCat] += totalDeducted;
    }
  }

  // 2b. If user selected priorities and did NOT include food:
  // Zero out catering and reallocate its entire percentage to the user's selected priorities
  if (priorities.length > 0 && !priorities.includes('food')) {
    const cateringShare = currentPercentages.catering || 0;
    if (cateringShare > 0) {
      currentPercentages.catering = 0;
      const targetCategories = categories.filter(
        (cat) => cat !== 'catering' && prioritizedCategoryKeys.has(cat)
      );
      const recipientCategories = targetCategories.length > 0
        ? targetCategories
        : categories.filter((cat) => cat !== 'catering' && cat !== 'contingency');

      if (recipientCategories.length > 0) {
        const extraPerRecipient = Math.floor(cateringShare / recipientCategories.length);
        let distributed = 0;
        for (let i = 0; i < recipientCategories.length; i++) {
          const cat = recipientCategories[i];
          const add = i === recipientCategories.length - 1 ? (cateringShare - distributed) : extraPerRecipient;
          currentPercentages[cat] += add;
          distributed += add;
        }
      }
    }
  }

  // 3. Outdoor venue weather allowance adjustment
  if (venuePreference === 'outdoor') {
    const weatherAllowance = ALLOCATION_RULES.OUTDOOR_WEATHER_ALLOWANCE_PERCENT;
    // Boost contingency or decor for weatherproofing/tenting
    const donorKey = currentPercentages.catering > weatherAllowance ? 'catering' : 'venue';
    if (currentPercentages[donorKey] && currentPercentages[donorKey] - weatherAllowance >= ALLOCATION_RULES.MIN_CATEGORY_FLOOR) {
      currentPercentages[donorKey] -= weatherAllowance;
      currentPercentages.contingency += weatherAllowance;
    }
  }

  // 4. Function Add-ons (e.g. Haldi, Mehndi, Sangeet for weddings)
  const addonAllocations = {};
  if (eventType === 'wedding' && Array.isArray(functionAddons)) {
    for (const addonKey of functionAddons) {
      const config = FUNCTION_ADDON_CONFIG[addonKey];
      if (!config) {
        continue;
      }

      const addonPercent = config.percent;
      const preferredDonor = config.sourceCategory;

      let deducted = 0;
      if (
        currentPercentages[preferredDonor] &&
        currentPercentages[preferredDonor] - addonPercent >= ALLOCATION_RULES.MIN_CATEGORY_FLOOR
      ) {
        currentPercentages[preferredDonor] -= addonPercent;
        deducted = addonPercent;
      } else {
        // Fall back to general non-priority donors
        const donors = categories.filter(
          (c) =>
            c !== 'contingency' &&
            !prioritizedCategoryKeys.has(c) &&
            currentPercentages[c] - ALLOCATION_RULES.MIN_CATEGORY_FLOOR > 1
        );
        if (donors.length > 0) {
          const perDonor = addonPercent / donors.length;
          for (const d of donors) {
            const avail = currentPercentages[d] - ALLOCATION_RULES.MIN_CATEGORY_FLOOR;
            const take = Math.min(perDonor, avail);
            currentPercentages[d] -= take;
            deducted += take;
          }
        }
      }

      addonAllocations[addonKey] = deducted;
    }
  }

  // 5. Ensure contingency floor
  if (currentPercentages.contingency < ALLOCATION_RULES.CONTINGENCY_FLOOR) {
    const deficit = ALLOCATION_RULES.CONTINGENCY_FLOOR - currentPercentages.contingency;
    currentPercentages.contingency = ALLOCATION_RULES.CONTINGENCY_FLOOR;
    // Deduct deficit from highest non-priority category
    const highestNonPrio = categories
      .filter((c) => c !== 'contingency' && !prioritizedCategoryKeys.has(c))
      .sort((a, b) => currentPercentages[b] - currentPercentages[a])[0];
    if (highestNonPrio) {
      currentPercentages[highestNonPrio] = Math.max(
        ALLOCATION_RULES.MIN_CATEGORY_FLOOR,
        currentPercentages[highestNonPrio] - deficit
      );
    }
  }

  // 6. Round percentages to 1 decimal place and normalize to exactly 100%
  const allKeys = [...categories, ...Object.keys(addonAllocations)];
  const rawPercentages = { ...currentPercentages, ...addonAllocations };

  const roundedPercentages = {};
  let totalPercent = 0;
  for (const key of allKeys) {
    const r = Math.round(rawPercentages[key] * 10) / 10;
    roundedPercentages[key] = r;
    totalPercent += r;
  }

  const percentDiff = Math.round((100 - totalPercent) * 10) / 10;
  if (percentDiff !== 0) {
    // Adjust contingency or largest active category
    const activeKeys = allKeys.filter((k) => roundedPercentages[k] > 0);
    const adjustKey = roundedPercentages.catering ? 'catering' : (activeKeys[0] || allKeys[0]);
    roundedPercentages[adjustKey] = Math.round((roundedPercentages[adjustKey] + percentDiff) * 10) / 10;
  }

  // 7. Calculate integer rupee amounts summing exactly to input budget
  const amounts = {};
  let allocatedSum = 0;

  for (const key of allKeys) {
    const amt = Math.round((roundedPercentages[key] / 100) * budget);
    amounts[key] = amt;
    allocatedSum += amt;
  }

  // Remainder adjustment (catering or first active category absorbs rounding difference)
  const remainder = budget - allocatedSum;
  const activeKeysWithAmount = allKeys.filter((k) => amounts[k] > 0);
  const balanceCategory = amounts.catering ? 'catering' : (activeKeysWithAmount[0] || allKeys[0]);
  amounts[balanceCategory] += remainder;

  // 8. Generate helpful contextual rationale for each category
  const result = allKeys.map((key) => {
    const isAddon = key in addonAllocations;
    const metadata = CATEGORY_METADATA[key] || { label: key, priorityKey: null };
    const isPriority = prioritizedCategoryKeys.has(key);

    let rationale = '';
    if (isAddon) {
      rationale = `Dedicated allocation for ${metadata.label.toLowerCase()} decor, rituals, and coordination.`;
    } else if (key === 'contingency') {
      rationale = venuePreference === 'outdoor'
        ? 'Contingency buffer including weatherproofing and outdoor backup provisions (≥ 5% floor maintained).'
        : 'Safety reserve for unplanned expenses and last-minute needs (≥ 5% floor maintained).';
    } else if (isPriority) {
      rationale = `Boosted to match your top priority for ${metadata.label.toLowerCase()}.`;
    } else if (key === 'catering') {
      rationale = 'Covers meal courses, service personnel, bar/beverage setups, and dietary options.';
    } else if (key === 'venue') {
      rationale = 'Covers venue hire, basic banquet amenities, and cleaning/setup deposits.';
    } else if (key === 'decor') {
      rationale = 'Covers stage setup, floral arrangements, backdrop, lighting, and ambient styling.';
    } else if (key === 'entertainment') {
      rationale = 'Covers DJ, sound console, MC/anchor, and celebratory entertainment.';
    } else if (key === 'photography') {
      rationale = 'Covers candid photographer, videography, teaser edits, and digital album.';
    } else if (key === 'attire') {
      rationale = 'Invitations, guest welcome favors, signage, and personal styling essentials.';
    } else {
      rationale = 'Standard baseline event expense.';
    }

    return {
      category: metadata.label,
      key,
      percent: roundedPercentages[key],
      amount: amounts[key],
      rationale,
    };
  });

  // 9. Filter out categories that have zero allocation (e.g. food not selected by user)
  return result.filter((item) => item.percent > 0 && item.amount > 0);
}
