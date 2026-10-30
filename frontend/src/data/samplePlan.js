/**
 * Sample plan data for demo / "Try a Sample" mode.
 * This is a hardcoded complete plan — no API call required.
 */

export const SAMPLE_EVENT_META = {
  eventType: 'wedding',
  city: 'Jaipur',
  guestCount: 250,
  budget: 1500000,
  eventDate: '2027-02-14',
  isSample: true,
};

export const SAMPLE_PLAN = {
  aiEnhanced: false,
  isSample: true,
  plan: {
    budget: [
      {
        key: 'venue',
        category: 'Venue & Decor',
        percent: 30,
        amount: 450000,
        rationale: 'Jaipur heritage havelis command a premium; includes floral mandap decor.',
      },
      {
        key: 'catering',
        category: 'Catering & Beverages',
        percent: 28,
        amount: 420000,
        rationale: 'Rajasthani thali + live counters for 250 guests with mocktail bar.',
      },
      {
        key: 'photography',
        category: 'Photography & Videography',
        percent: 12,
        amount: 180000,
        rationale: 'Candid photographer + drone coverage for heritage venue.',
      },
      {
        key: 'entertainment',
        category: 'Entertainment & DJ',
        percent: 8,
        amount: 120000,
        rationale: 'Live dhol, folk dancers for baraat + DJ for reception night.',
      },
      {
        key: 'attire',
        category: 'Bridal Attire & Grooming',
        percent: 7,
        amount: 105000,
        rationale: 'Bridal lehenga, groom sherwani, makeup trials included.',
      },
      {
        key: 'invitations',
        category: 'Invitations & Stationery',
        percent: 3,
        amount: 45000,
        rationale: 'Laser-cut boxed invites with dry fruit inserts — Jaipur tradition.',
      },
      {
        key: 'transportation',
        category: 'Transportation & Logistics',
        percent: 4,
        amount: 60000,
        rationale: 'Vintage car for baraat + shuttle buses for outstation guests.',
      },
      {
        key: 'contingency',
        category: 'Contingency Buffer',
        percent: 8,
        amount: 120000,
        rationale: 'Winter Jaipur events are stable; 8% provides adequate buffer.',
      },
    ],
    timeline: [
      {
        label: 'Initial Planning',
        dueDate: '2026-11-01',
        relativeLabel: '15 weeks before',
        tasks: [
          'Fix venue: Heritage haveli or hotel palace',
          'Book main catering vendor',
          'Shortlist photographers (meet 3, check portfolios)',
          'Fix wedding date on family calendar',
        ],
      },
      {
        label: 'Vendor Bookings',
        dueDate: '2026-12-01',
        relativeLabel: '10 weeks before',
        tasks: [
          'Confirm decor vendor with mandap design approval',
          'Book dhol & folk dance troupe',
          'Send save-the-dates for outstation guests',
          'Choose Sangeet & Mehndi venue (often same as main)',
        ],
      },
      {
        label: 'Design & Invites',
        dueDate: '2026-12-20',
        relativeLabel: '7 weeks before',
        tasks: [
          'Finalise invite design, order laser-cut boxes',
          'Complete bridal lehenga selection & trials',
          'Book transportation (vintage car + shuttle)',
          'Confirm guest list (RSVPs)',
        ],
      },
      {
        label: 'Sangeet Ceremony',
        dueDate: '2027-02-12',
        relativeLabel: '2 days before',
        tasks: [
          'Sangeet rehearsal with performers',
          'Confirm family entry and order of events',
          'Check sound system with DJ',
        ],
      },
      {
        label: 'Mehndi & Haldi',
        dueDate: '2027-02-13',
        relativeLabel: '1 day before',
        tasks: [
          'Mehndi artist arrives — bridal party on time',
          'Haldi ceremony — turmeric paste & photographer briefed',
          'Groom\'s side Haldi coordination',
          'Final venue inspection walkthrough',
        ],
      },
      {
        label: 'Wedding Day',
        dueDate: '2027-02-14',
        relativeLabel: 'Wedding Day',
        tasks: [
          'Bridal makeup at 5:00 AM — confirm artist arrival',
          'Baraat procession at 7:00 PM — dhol & vintage car ready',
          'Pheras at 8:30 PM — pandit briefed',
          'Reception dinner to follow — catering on standby',
          'Photographer: capture all rituals in timeline sequence',
        ],
      },
    ],
    vendors: [
      {
        type: 'Venue',
        budgetShare: 30,
        checklist: [
          'Visit at least 3 heritage havelis or palace hotels',
          'Confirm guest capacity ≥ 300 (buffer for 250)',
          'Check mandap space, electricity backup, parking',
          'Review cancellation and rain-backup clauses',
          'Get written agreement with date lock-in',
        ],
      },
      {
        type: 'Catering',
        budgetShare: 28,
        checklist: [
          'Schedule food tasting — minimum 8 dishes',
          'Confirm Rajasthani thali + live chaat counter',
          'Ask about halal / Jain menu sections for guests',
          'Confirm staff count (1 per 10 guests recommended)',
          'Agree on serving style: buffet vs. seated',
        ],
      },
      {
        type: 'Photography & Videography',
        budgetShare: 12,
        checklist: [
          'Review 2 full wedding albums (not just highlights)',
          'Confirm drone availability & local permissions',
          'Decide on same-day edit vs. delivered within 30 days',
          'Sign contract with rights and RAW file policy',
          'Share ceremony sequence sheet with photographer',
        ],
      },
      {
        type: 'Entertainment',
        budgetShare: 8,
        checklist: [
          'Audition dhol player — check energy & stamina',
          'Confirm folk dance troupe (3-5 performers ideal)',
          'DJ: verify sound equipment wattage for open venue',
          'Share a "do not play" list with DJ',
          'Coordinate with venue on noise ordinances',
        ],
      },
      {
        type: 'Decor & Florals',
        budgetShare: 0,
        checklist: [
          'Choose colour palette (typically gold, ivory, marigold for Jaipur)',
          'Confirm marigold flower sourcing (local mandi recommended)',
          'Mandap design: toran, phoolon ki chadar, entrance arch',
          'Table centrepieces: brass urli with floating flowers',
          'Confirm setup & breakdown timings with venue',
        ],
      },
    ],
    warnings: [
      'Winter Jaipur (Dec–Feb) is peak wedding season — book all vendors NOW, prices rise 20–30% closer to date.',
      'Heritage venues often have noise curfews; confirm DJ cut-off time before signing.',
      'For 250 guests in a haveli, confirm restroom count and accessibility.',
    ],
    tradeoffs: [
      {
        fromCategory: 'Entertainment & DJ',
        toCategory: 'Photography & Videography',
        percent: 3,
        amount: 45000,
        reason: 'Heritage venues are naturally photogenic; extra photography budget preserves irreplaceable memories.',
      },
    ],
    budgetHealth: {
      status: 'comfortable',
      message:
        'Budget of ₹1,50,000 for 250 guests in Jaipur is well within the comfortable range (₹3,000–₹8,000 per person for Tier-2 cities). Good scope for premium vendors.',
    },
    panicMode: {
      enabled: false,
      bookToday: [],
      doThisWeek: [],
      canSkip: [],
    },
    ai: {
      summary:
        'A royal Jaipur winter wedding for 250 guests. The heritage haveli setting calls for warm gold and marigold florals, folk music, and an unforgettable baraat through the old city lanes.',
      themeIdeas: [
        'Royal Rajputana: deep crimson, gold & ivory — jewel-toned lehenga, armour-inspired groom sherwani',
        'Merigold Dreams: all-marigold mandap with brass diyas, terracotta pots, and folk art backdrops',
        'Pastel Palace: blush pink, mint & gold — softer, contemporary take on Rajasthani grandeur',
      ],
      personalisedTips: [
        'Book your haveli photographer for a pre-wedding shoot at golden hour — the light is legendary.',
        'Serve a live kachori & lassi counter at the Mehndi — guests remember the food as much as the flowers.',
        'Hire a local travel coordinator for outstation guests: Jaipur airport/bus transfers go a long way.',
      ],
      vendorSuggestions: [
        'Photography: Look for Jaipur-based candid photographers who specialize in heritage properties',
        'Catering: Shortlist caterers experienced in large Rajasthani thalis with live stations',
        'Decor: Local flower mandi in Chandpole Bazaar for bulk marigold at best prices',
      ],
      risks: [
        'Peak-season vendor scarcity: Lock in ALL key vendors simultaneously — do not wait.',
        'Heritage venue limitations: Verify power backup & noise regulations before signing.',
        'Guest travel: Arrange accommodation blocks at nearby hotels; Jaipur fills up fast in February.',
      ],
    },
  },
};
