import { describe, it, expect } from 'vitest';
import {
  generateRulesPlan,
  generateTimeline,
  generatePanicMode,
  generateVendors,
  generateWarnings,
  getDaysRemaining,
} from '../services/rulesEngine/index.js';

describe('Rules Engine — Timeline Generator', () => {
  const currentDate = '2026-10-30';

  it('drops past milestones and carries forward critical tasks into earliest upcoming milestone', () => {
    // Event is 45 days away (~6 weeks away)
    const eventDate = '2026-12-14';
    const { timeline, isCompressed } = generateTimeline({
      eventType: 'wedding',
      eventDate,
      currentDate,
    });

    expect(isCompressed).toBe(false);
    // 6-month, 4-month, 3-month, 2-month milestones should be dropped because they are in the past
    const labels = timeline.map((m) => m.label);
    expect(labels).not.toContain('6 Months Before');
    expect(labels).not.toContain('4 Months Before');
    expect(labels).toContain('1 Month Before');

    // Earliest upcoming milestone should contain carried-forward immediate tasks
    const earliestTasks = timeline[0].tasks;
    const hasImmediate = earliestTasks.some((t) => t.startsWith('[Immediate]'));
    expect(hasImmediate).toBe(true);
  });

  it('marks compressed timeline mode when event is under 30 days away', () => {
    const eventDate = '2026-11-15'; // 16 days away
    expect(getDaysRemaining(eventDate, currentDate)).toBe(16);
    const { isCompressed } = generateTimeline({
      eventType: 'birthday',
      eventDate,
      currentDate,
    });
    expect(isCompressed).toBe(true);
  });

  it('injects wedding add-on ceremonies (Haldi, Mehndi, Sangeet) with correct due dates', () => {
    const eventDate = '2027-02-14';
    const { timeline } = generateTimeline({
      eventType: 'wedding',
      eventDate,
      currentDate,
      functionAddons: ['haldi', 'mehndi', 'sangeet'],
    });

    const labels = timeline.map((m) => m.label);
    expect(labels).toContain('Haldi Ceremony Setup & Rituals');
    expect(labels).toContain('Mehndi Ceremony Setup & Rituals');
    expect(labels).toContain('Sangeet Night Setup & Rituals');

    const sangeet = timeline.find((m) => m.label.includes('Sangeet'));
    expect(sangeet.dueDate).toBe('2027-02-12'); // 2 days before
  });
});

describe('Rules Engine — Panic Mode Engine', () => {
  it('disables panic mode when event is 14 or more days away', () => {
    const result = generatePanicMode({
      daysRemaining: 15,
      eventType: 'wedding',
    });
    expect(result.enabled).toBe(false);
    expect(result.bookToday).toHaveLength(0);
    expect(result.doThisWeek).toHaveLength(0);
    expect(result.canSkip).toHaveLength(0);
  });

  it('activates panic mode when event is fewer than 14 days away with 3 prioritized groups', () => {
    const result = generatePanicMode({
      daysRemaining: 7,
      eventType: 'wedding',
      venuePreference: 'outdoor',
      functionAddons: ['mehndi'],
    });

    expect(result.enabled).toBe(true);
    expect(result.bookToday.length).toBeGreaterThanOrEqual(3);
    expect(result.doThisWeek.length).toBeGreaterThanOrEqual(4);
    expect(result.canSkip.length).toBeGreaterThanOrEqual(4);

    // Outdoor check included
    expect(result.bookToday.some((t) => /waterproof|canopy|tenting/i.test(t))).toBe(true);
    // Add-on task included
    expect(result.doThisWeek.some((t) => /mehndi/i.test(t))).toBe(true);
  });
});

describe('Rules Engine — Vendor Checklist Generator', () => {
  it('includes explicit dietary verification checks for Jain, Vegan, Halal, and Veg', () => {
    const vendors = generateVendors({
      budgetAllocations: [{ key: 'catering', amount: 300000 }],
      priorities: ['food'],
      dietary: ['jain', 'vegan', 'halal'],
      guestCount: 200,
    });

    const catering = vendors.find((v) => v.type.includes('Catering'));
    expect(catering).toBeDefined();

    const checklistText = catering.checklist.join(' ');
    expect(checklistText).toMatch(/Jain/i);
    expect(checklistText).toMatch(/Vegan/i);
    expect(checklistText).toMatch(/Halal/i);
  });

  it('includes outdoor facilities verification for outdoor venue preference', () => {
    const vendors = generateVendors({
      budgetAllocations: [{ key: 'venue', amount: 200000 }],
      venuePreference: 'outdoor',
      guestCount: 100,
    });

    const venueVendor = vendors.find((v) => v.type.includes('Venue'));
    expect(venueVendor.checklist.some((c) => /outdoor|generator|rainproof/i.test(c))).toBe(true);
  });
});

describe('Rules Engine — Warning Engine', () => {
  const currentDate = '2026-10-30';

  it('warns about tight budget in Metro tier but not in Tier-3 for the same budget & guest count', () => {
    const params = {
      eventType: 'wedding',
      budget: 200000,
      guestCount: 150, // ₹1,333/guest
      eventDate: '2027-02-14',
      currentDate,
    };

    // Mumbai is Metro (threshold ₹2,500)
    const metroWarnings = generateWarnings({ ...params, city: 'Mumbai' });
    expect(metroWarnings.some((w) => w.includes('Budget may be tight'))).toBe(true);
    expect(metroWarnings.some((w) => w.includes('Metro'))).toBe(true);

    // Lucknow is Tier-2 (threshold ₹1,500) -> ₹1333 is also below ₹1500
    const lucknowWarnings = generateWarnings({ ...params, city: 'Lucknow' });
    expect(lucknowWarnings.some((w) => w.includes('Tier-2'))).toBe(true);

    // Agra is Tier-3 (threshold ₹900) -> ₹1333 is above ₹900, no tight budget warning
    const agraWarnings = generateWarnings({ ...params, city: 'Agra' });
    expect(agraWarnings.some((w) => w.includes('Budget may be tight'))).toBe(false);
  });

  it('warns about outdoor venue weather exposure', () => {
    const warnings = generateWarnings({
      eventType: 'wedding',
      budget: 1000000,
      guestCount: 200,
      city: 'Delhi',
      eventDate: '2027-07-15', // Monsoon month (July)
      currentDate,
      venuePreference: 'outdoor',
    });

    expect(warnings.some((w) => /monsoon|weather exposure/i.test(w))).toBe(true);
  });

  it('warns about imminent event date when fewer than 14 days remain', () => {
    const warnings = generateWarnings({
      eventType: 'birthday',
      budget: 50000,
      guestCount: 30,
      city: 'Delhi',
      eventDate: '2026-11-05', // 6 days away
      currentDate,
    });

    expect(warnings.some((w) => /Panic Mode is activated/i.test(w))).toBe(true);
  });
});

describe('Rules Engine — Master Orchestrator (generateRulesPlan)', () => {
  it('generates a complete plan conforming to the full spec contract', () => {
    const plan = generateRulesPlan(
      {
        eventType: 'wedding',
        eventName: 'Riya & Aman Wedding',
        eventDate: '2026-11-06', // 7 days away -> Panic Mode triggered
        guestCount: 150,
        budget: 800000,
        currency: 'INR',
        city: 'Lucknow',
        venuePreference: 'outdoor',
        priorities: ['food', 'photography'],
        dietary: ['veg', 'jain'],
        functionAddons: ['mehndi'],
        notes: 'Family-oriented celebration',
      },
      '2026-10-30'
    );

    // Check all required contract fields
    expect(plan.budget).toBeDefined();
    expect(plan.timeline).toBeDefined();
    expect(plan.vendors).toBeDefined();
    expect(plan.warnings).toBeDefined();
    expect(plan.tradeoffs).toBeDefined();
    expect(plan.budgetHealth).toBeDefined();
    expect(plan.panicMode).toBeDefined();

    // Check Panic Mode is enabled
    expect(plan.panicMode.enabled).toBe(true);
    expect(plan.panicMode.bookToday.length).toBeGreaterThan(0);

    // Check sum of budget amounts
    const totalAllocated = plan.budget.reduce((sum, item) => sum + item.amount, 0);
    expect(totalAllocated).toBe(800000);

    // Check vendors
    expect(plan.vendors.length).toBeGreaterThanOrEqual(5);

    // Check timeline has Mehndi
    expect(plan.timeline.some((t) => t.label.includes('Mehndi'))).toBe(true);
  });
});
