import { PANIC_MODE_DAYS_THRESHOLD } from '../../config/eventConfig.js';

/**
 * Generates Panic Mode action groups when event is fewer than 14 days away.
 *
 * @param {Object} params
 * @param {number} params.daysRemaining - Days until the event date
 * @param {string} params.eventType - 'wedding' | 'birthday' | 'community'
 * @param {string} [params.venuePreference] - 'indoor' | 'outdoor' | 'either'
 * @param {string[]} [params.functionAddons] - Optional wedding add-ons
 * @returns {{ enabled: boolean, bookToday: string[], doThisWeek: string[], canSkip: string[] }}
 */
export function generatePanicMode({
  daysRemaining,
  eventType = 'wedding',
  venuePreference = 'either',
  functionAddons = [],
}) {
  if (daysRemaining >= PANIC_MODE_DAYS_THRESHOLD) {
    return {
      enabled: false,
      bookToday: [],
      doThisWeek: [],
      canSkip: [],
    };
  }

  const bookToday = [
    'Lock and confirm the main celebration venue with immediate advance payment',
    'Book primary caterer and lock a streamlined per-plate menu with guaranteed headcount',
    'Confirm lead photographer / videographer with concrete start and wrap timings',
  ];

  if (venuePreference === 'outdoor') {
    bookToday.push('Confirm emergency waterproof canopy / tenting and generator backup with venue');
  }

  const doThisWeek = [
    'Send instant WhatsApp digital invitations with RSVP link and venue location pin',
    'Finalize high-impact stage backdrop and entrance floral/lighting setup',
    'Create curated Spotify / DJ playlist and brief event MC / family coordinator',
    'Assemble emergency kit: safety pins, first-aid, power banks, spare shoes, and receipts',
  ];

  if (eventType === 'wedding' && Array.isArray(functionAddons)) {
    if (functionAddons.includes('mehndi')) {
      doThisWeek.push('Confirm bridal mehndi artist arrival timing and seating setup');
    }
    if (functionAddons.includes('haldi')) {
      doThisWeek.push('Source organic turmeric, yellow floral decor, and dholak team');
    }
    if (functionAddons.includes('sangeet')) {
      doThisWeek.push('Finalize sound setup and 5-6 core family performance tracks');
    }
  }

  const canSkip = [
    'Physical printed invitation cards (replace entirely with high-resolution digital cards)',
    'Elaborate personalized gift hampers (replace with curated sweets or dry fruits boxes)',
    'Multi-tiered stage structures (opt for clean minimalist floral/fabric backdrops)',
    'Drone videography or elaborate multi-camera setups (focus on one solid candid photographer)',
    'Excessive menu counters (trim to 3 appetizers, 4 main courses, and 2 standout desserts)',
  ];

  return {
    enabled: true,
    bookToday,
    doThisWeek,
    canSkip,
  };
}
