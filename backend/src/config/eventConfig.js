/**
 * Central event planning configuration constants.
 * Source of truth for rules engine allocations, city tiers, thresholds, and timelines.
 */

export const EVENT_TYPES = ['wedding', 'birthday', 'community', 'college_fest', 'colony_event'];

export const PRIORITIES = [
  'food',
  'decor',
  'entertainment',
  'photography',
  'venue',
  'guest comfort',
];

export const DIETARY_OPTIONS = ['veg', 'vegan', 'jain', 'halal', 'none'];

export const VENUE_PREFERENCES = ['indoor', 'outdoor', 'either'];

export const FUNCTION_ADDONS = ['haldi', 'mehndi', 'sangeet'];

/**
 * Baseline budget percentage allocations by event type.
 * Each must sum to exactly 100%.
 */
export const STARTING_BUDGET_PERCENTAGES = {
  wedding: {
    venue: 25,
    catering: 35,
    decor: 12,
    entertainment: 8,
    photography: 8,
    attire: 7,
    contingency: 5,
  },
  birthday: {
    venue: 20,
    catering: 35,
    decor: 12,
    entertainment: 10,
    photography: 5,
    attire: 8,
    contingency: 10,
  },
  community: {
    venue: 20,
    catering: 35,
    decor: 10,
    entertainment: 12,
    photography: 5,
    attire: 8,
    contingency: 10,
  },
  college_fest: {
    venue: 18,
    catering: 30,
    decor: 10,
    entertainment: 20,
    photography: 7,
    attire: 5,
    contingency: 10,
  },
  colony_event: {
    venue: 15,
    catering: 35,
    decor: 10,
    entertainment: 15,
    photography: 5,
    attire: 10,
    contingency: 10,
  },
};

/**
 * Category display names and priority mappings
 */
export const CATEGORY_METADATA = {
  venue: { label: 'Venue & Facilities', priorityKey: 'venue' },
  catering: { label: 'Food & Catering', priorityKey: 'food' },
  decor: { label: 'Decor & Theme', priorityKey: 'decor' },
  entertainment: { label: 'Entertainment & Music', priorityKey: 'entertainment' },
  photography: { label: 'Photography & Video', priorityKey: 'photography' },
  attire: { label: 'Attire, Invitations & Misc', priorityKey: 'guest comfort' },
  contingency: { label: 'Contingency & Emergency', priorityKey: null },
  haldi: { label: 'Haldi Ceremony Add-on', priorityKey: null },
  mehndi: { label: 'Mehndi Ceremony Add-on', priorityKey: null },
  sangeet: { label: 'Sangeet Ceremony Add-on', priorityKey: null },
};

/**
 * Allocation safety rules
 */
export const ALLOCATION_RULES = {
  MIN_CATEGORY_FLOOR: 2, // No category may drop below 2%
  CONTINGENCY_FLOOR: 5, // Contingency must never drop below 5%
  PRIORITY_SHIFT_PERCENT: 4, // Shift amount per selected priority
  OUTDOOR_WEATHER_ALLOWANCE_PERCENT: 3, // For outdoor events, reserved for tenting/weather prep
};

/**
 * Wedding function add-ons configuration.
 * Add-on budgets are reallocated from non-priority categories (total remains 100%).
 */
export const FUNCTION_ADDON_CONFIG = {
  haldi: {
    label: 'Haldi Ceremony',
    percent: 4,
    sourceCategory: 'decor',
    daysOffsetFromMain: -1, // 1 day before wedding
    defaultTasks: [
      'Source organic turmeric and floral setup',
      'Arrange traditional seating / yellow dress code',
      'Confirm dholak / music playlist for Haldi',
    ],
  },
  mehndi: {
    label: 'Mehndi Ceremony',
    percent: 4,
    sourceCategory: 'attire',
    daysOffsetFromMain: -1, // 1 day before wedding (or morning)
    defaultTasks: [
      'Book professional bridal mehndi artists',
      'Order henna cones and seating lounge cushions',
      'Arrange bangle bar / floral favors for guests',
    ],
  },
  sangeet: {
    label: 'Sangeet Night',
    percent: 6,
    sourceCategory: 'entertainment',
    daysOffsetFromMain: -2, // 2 days before wedding
    defaultTasks: [
      'Coordinate choreography and family dance list',
      'Confirm sound system and stage lighting',
      'Finalize anchor / DJ playlist for musical evening',
    ],
  },
};

/**
 * City-to-Tier Mapping.
 * Explicit initial set; easily extensible; safe fallback is tier3.
 */
export const CITY_TIERS = {
  // Metro Tier
  mumbai: 'metro',
  delhi: 'metro',
  'new delhi': 'metro',
  bengaluru: 'metro',
  bangalore: 'metro',
  hyderabad: 'metro',
  chennai: 'metro',
  kolkata: 'metro',
  pune: 'metro',
  ahmedabad: 'metro',

  // Tier 2
  lucknow: 'tier2',
  jaipur: 'tier2',
  chandigarh: 'tier2',
  indore: 'tier2',
  kochi: 'tier2',
  cochin: 'tier2',
  surat: 'tier2',
  nagpur: 'tier2',
  patna: 'tier2',
  bhopal: 'tier2',
  visakhapatnam: 'tier2',
  vizag: 'tier2',

  // Tier 3 & others (explicit examples)
  agra: 'tier3',
  varanasi: 'tier3',
  meerut: 'tier3',
  kanpur: 'tier3',
  rajkot: 'tier3',
  mysore: 'tier3',
  mysuru: 'tier3',
};

/**
 * Returns city tier for a given city name, defaulting safely to 'tier3'.
 */
export function getCityTier(cityName = '') {
  if (!cityName || typeof cityName !== 'string') {
    return 'tier3';
  }
  const normalized = cityName.trim().toLowerCase();
  return CITY_TIERS[normalized] || 'tier3';
}

/**
 * Indicative per-guest minimum recommended thresholds (INR).
 * Based on event type and city tier.
 */
export const CITY_TIER_THRESHOLDS = {
  wedding: {
    metro: 2500,
    tier2: 1500,
    tier3: 900,
  },
  birthday: {
    metro: 1200,
    tier2: 800,
    tier3: 500,
  },
  community: {
    metro: 800,
    tier2: 500,
    tier3: 300,
  },
  college_fest: {
    metro: 500,
    tier2: 350,
    tier3: 200,
  },
  colony_event: {
    metro: 600,
    tier2: 400,
    tier3: 250,
  },
};

/**
 * Panic Mode trigger threshold in days
 */
export const PANIC_MODE_DAYS_THRESHOLD = 14;

/**
 * Standard milestone definitions (weeks before event date)
 */
export const TIMELINE_MILESTONES = {
  wedding: [
    { label: '6 Months Before', weeksBefore: 24 },
    { label: '4 Months Before', weeksBefore: 16 },
    { label: '3 Months Before', weeksBefore: 12 },
    { label: '2 Months Before', weeksBefore: 8 },
    { label: '1 Month Before', weeksBefore: 4 },
    { label: '2 Weeks Before', weeksBefore: 2 },
    { label: '1 Week Before', weeksBefore: 1 },
    { label: 'Event Week', weeksBefore: 0.5 },
    { label: 'Event Day', weeksBefore: 0 },
    { label: 'Post-Event', weeksBefore: -0.5 },
  ],
  birthday: [
    { label: '2 Months Before', weeksBefore: 8 },
    { label: '1 Month Before', weeksBefore: 4 },
    { label: '2 Weeks Before', weeksBefore: 2 },
    { label: '1 Week Before', weeksBefore: 1 },
    { label: 'Event Day', weeksBefore: 0 },
  ],
  community: [
    { label: '3 Months Before', weeksBefore: 12 },
    { label: '2 Months Before', weeksBefore: 8 },
    { label: '1 Month Before', weeksBefore: 4 },
    { label: '2 Weeks Before', weeksBefore: 2 },
    { label: '1 Week Before', weeksBefore: 1 },
    { label: 'Event Day', weeksBefore: 0 },
    { label: 'Post-Event', weeksBefore: -0.5 },
  ],
  college_fest: [
    { label: '2 Months Before', weeksBefore: 8 },
    { label: '1 Month Before', weeksBefore: 4 },
    { label: '2 Weeks Before', weeksBefore: 2 },
    { label: '1 Week Before', weeksBefore: 1 },
    { label: 'Event Day', weeksBefore: 0 },
  ],
  colony_event: [
    { label: '1 Month Before', weeksBefore: 4 },
    { label: '2 Weeks Before', weeksBefore: 2 },
    { label: '1 Week Before', weeksBefore: 1 },
    { label: 'Event Day', weeksBefore: 0 },
  ],
};
