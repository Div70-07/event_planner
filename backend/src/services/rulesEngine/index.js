import { calculateBudgetAllocation } from './budgetCalculator.js';
import { generateTradeoffs } from './tradeoffEngine.js';
import { calculateBudgetHealth } from './budgetHealth.js';
import { generateTimeline, getDaysRemaining } from './timelineGenerator.js';
import { generateVendors } from './vendorGenerator.js';
import { generateWarnings } from './warningEngine.js';
import { generatePanicMode } from './panicModeEngine.js';
import { getTodayDateString } from '../../schemas/planRequestSchema.js';

/**
 * Builds the complete deterministic rules-engine event plan.
 *
 * @param {Object} input - Validated plan request body
 * @param {string} [currentDate] - Optional override for testing (default: today's date)
 * @returns {Object} Complete rules-engine plan
 */
export function generateRulesPlan(input, currentDate = getTodayDateString()) {
  const {
    eventType,
    budget,
    guestCount,
    city,
    eventDate,
    priorities = [],
    dietary = ['none'],
    venuePreference = 'either',
    functionAddons = [],
  } = input;

  const daysRemaining = getDaysRemaining(eventDate, currentDate);

  // 1. Calculate budget allocation
  const budgetAllocations = calculateBudgetAllocation({
    eventType,
    budget,
    guestCount,
    priorities,
    venuePreference,
    functionAddons,
  });

  // 2. Budget health & deterministic trade-offs
  const budgetHealth = calculateBudgetHealth({
    eventType,
    budget,
    guestCount,
    city,
  });

  const tradeoffs = generateTradeoffs(budgetAllocations, priorities, budget);

  // 3. Timeline with adaptive milestone dropping and add-on ceremonies
  const { timeline, isCompressed } = generateTimeline({
    eventType,
    eventDate,
    currentDate,
    functionAddons,
  });

  // 4. Vendors with customized checklists
  const vendors = generateVendors({
    budgetAllocations,
    priorities,
    venuePreference,
    dietary,
    guestCount,
  });

  // 5. Deterministic warnings
  const warnings = generateWarnings({
    eventType,
    budget,
    guestCount,
    city,
    eventDate,
    currentDate,
    venuePreference,
  });

  // 6. Panic Mode for close dates (< 14 days)
  const panicMode = generatePanicMode({
    daysRemaining,
    eventType,
    venuePreference,
    functionAddons,
  });

  return {
    budget: budgetAllocations,
    timeline,
    vendors,
    warnings,
    tradeoffs,
    budgetHealth: {
      status: budgetHealth.status,
      message: budgetHealth.message,
    },
    panicMode,
    isCompressed,
  };
}

export {
  calculateBudgetAllocation,
  generateTradeoffs,
  calculateBudgetHealth,
  generateTimeline,
  generateVendors,
  generateWarnings,
  generatePanicMode,
  getDaysRemaining,
};
