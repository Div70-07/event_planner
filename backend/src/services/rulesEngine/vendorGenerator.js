/**
 * Generates vendor items with checklists tailored to event preferences, dietary needs,
 * venue choices, and priorities.
 *
 * @param {Object} params
 * @param {Array<{ category: string, key: string, percent: number, amount: number }>} params.budgetAllocations
 * @param {string[]} [params.priorities]
 * @param {string} [params.venuePreference]
 * @param {string[]} [params.dietary]
 * @param {number} params.guestCount
 * @returns {Array<{ type: string, checklist: string[], budgetShare: number }>}
 */
export function generateVendors({
  budgetAllocations = [],
  priorities = [],
  venuePreference = 'either',
  dietary = ['none'],
  guestCount = 100,
}) {
  const allocationMap = {};
  const percentMap = {};
  for (const item of budgetAllocations) {
    allocationMap[item.key] = item.amount;
    percentMap[item.key] = item.percent;
  }

  const vendors = [];

  // 1. Venue & Facilities
  const venueChecks = [
    'Confirm maximum guest capacity, AC performance, and restroom cleanliness',
    'Review standard setup time access and curfew/sound restriction timings',
    'Verify parking capacity, valet options, and security staff',
  ];
  if (venuePreference === 'outdoor') {
    venueChecks.push('Verify outdoor generator power backup and rainproof covered pavilion availability');
  }
  if (priorities.includes('venue')) {
    venueChecks.push('Inspect bridal suite / green room amenities and priority guest reception area');
  }

  vendors.push({
    type: 'Venue & Banquet Hall',
    budgetShare: percentMap.venue || 0,
    checklist: venueChecks,
  });

  // 2. Catering & Food Service
  const cateringChecks = [
    `Confirm live counter capacity and plate service ratio for ${guestCount} guests`,
    'Lock menu tasting date and specify appetizer replenishment frequency',
    'Confirm trained service staff ratio (at least 1 server per 25-30 guests)',
  ];

  // Dietary specific checks
  if (dietary.includes('jain')) {
    cateringChecks.push('Strict Jain counter verification: zero onion, garlic, or root vegetable ingredients with separate prep cookware');
  }
  if (dietary.includes('vegan')) {
    cateringChecks.push('Vegan menu confirmation: 100% plant-based dairy substitutes for sweets, gravies, and beverages');
  }
  if (dietary.includes('halal')) {
    cateringChecks.push('Halal meat sourcing certificate and segregated kitchen prep verification');
  }
  if (dietary.includes('veg')) {
    cateringChecks.push('Pure vegetarian kitchen handling and clear food labeling for all counters');
  }
  if (priorities.includes('food')) {
    cateringChecks.push('Include 2 signature interactive live counters (e.g. chaat street, pasta/dimsum bar)');
  }

  vendors.push({
    type: 'Catering & Hospitality',
    budgetShare: percentMap.catering || 0,
    checklist: cateringChecks,
  });

  // 3. Decorator & Event Stylist
  const decorChecks = [
    'Finalize main stage backdrop, entrance arch, and color theme mockups',
    'Confirm fresh flower delivery time and stage sofa/chair styling',
    'Verify setup teardown schedule and venue deposit liability',
  ];
  if (venuePreference === 'outdoor') {
    decorChecks.push('Confirm wind-resistant trussing and waterproof canopy fabric');
  }
  if (priorities.includes('decor')) {
    decorChecks.push('Request 3D render preview for photo booth and VIP family seating zone');
  }

  vendors.push({
    type: 'Decorator & Floral Stylist',
    budgetShare: percentMap.decor || 0,
    checklist: decorChecks,
  });

  // 4. Photographer & Videographer
  const photoChecks = [
    'Confirm team size (number of candid photographers + cinematic video operators)',
    'Review sample portfolio for similar lighting conditions (daylight vs indoor night)',
    'Lock turnaround time for teaser highlights (under 7 days) and full album delivery',
  ];
  if (priorities.includes('photography')) {
    photoChecks.push('Prepare prioritized family portrait shot list and agree on drone camera coverage');
  }

  vendors.push({
    type: 'Photographer & Videographer',
    budgetShare: percentMap.photography || 0,
    checklist: photoChecks,
  });

  // 5. Entertainment & Music
  const entertainmentChecks = [
    'Review sound console specifications, wireless microphones, and DJ sound permits',
    'Share banned songs and must-play playlist highlights with DJ',
    'Verify emcee / anchor schedule and stage coordination cues',
  ];
  if (priorities.includes('entertainment')) {
    entertainmentChecks.push('Include live percussionist / dhol player / instrumental opening act');
  }

  vendors.push({
    type: 'DJ, Sound & Entertainment',
    budgetShare: percentMap.entertainment || 0,
    checklist: entertainmentChecks,
  });

  // 6. Attire, Invites & Guest Favors
  const attireChecks = [
    'Finalize digital invitation graphic and RSVP tracking setup',
    'Order guest welcome gifts / sweet boxes and verify packaging batch',
    'Conduct final fitting for hosts / couple attire 10 days before event',
  ];

  vendors.push({
    type: 'Invitations, Styling & Favors',
    budgetShare: percentMap.attire || 0,
    checklist: attireChecks,
  });

  return vendors;
}
