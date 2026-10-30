/**
 * Helper to compute a future YYYY-MM-DD date string
 */
export function getFutureDateString(daysAhead = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 3 Standard Indian Event Presets as defined in the spec.
 */
export const EVENT_PRESETS = [
  {
    id: 'royal-wedding',
    name: 'Royal Wedding',
    tagline: 'Lucknow • 400 guests • ₹25L • Outdoor',
    description: 'Traditional Awadhi wedding with Sangeet & Mehndi, royal decor, and Awadhi culinary spread.',
    data: {
      eventType: 'wedding',
      eventName: 'Ananya & Kabir Wedding',
      eventDate: getFutureDateString(90),
      city: 'Lucknow',
      guestCount: 400,
      budget: 2500000,
      currency: 'INR',
      venuePreference: 'outdoor',
      priorities: ['food', 'photography', 'decor'],
      dietary: ['veg'],
      functionAddons: ['sangeet', 'mehndi'],
      notes: 'Desire royal Nawabi aesthetic, live Awadhi chaat and kebabs counter, and evening mood lighting.',
    },
  },
  {
    id: 'kids-birthday',
    name: "Kids' Birthday",
    tagline: 'Bengaluru • 50 guests • ₹75k • Indoor',
    description: 'Vibrant jungle safari birthday celebration with interactive games, party favors, and snacks.',
    data: {
      eventType: 'birthday',
      eventName: "Aarav's 5th Birthday",
      eventDate: getFutureDateString(25),
      city: 'Bengaluru',
      guestCount: 50,
      budget: 75000,
      currency: 'INR',
      venuePreference: 'indoor',
      priorities: ['entertainment', 'decor'],
      dietary: ['veg'],
      functionAddons: [],
      notes: 'Jungle animal theme with customized balloon arch, magician, and kid-friendly finger foods.',
    },
  },
  {
    id: 'diwali-community',
    name: 'Diwali Community Meet',
    tagline: 'Delhi • 500 guests • ₹3L • Outdoor',
    description: 'Society Diwali gathering with cultural performances, diya lighting, and community sweets distribution.',
    data: {
      eventType: 'community',
      eventName: 'Vasant Vihar Diwali Mela',
      eventDate: getFutureDateString(45),
      city: 'Delhi',
      guestCount: 500,
      budget: 300000,
      currency: 'INR',
      venuePreference: 'outdoor',
      priorities: ['entertainment', 'food'],
      dietary: ['veg', 'jain'],
      functionAddons: [],
      notes: 'Open amphitheater setup with stage lighting, acoustic sound console, and sweet boxes for families.',
    },
  },
];
