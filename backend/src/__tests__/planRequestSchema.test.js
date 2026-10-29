import { describe, it, expect } from 'vitest';
import { planRequestSchema } from '../schemas/planRequestSchema.js';

describe('Plan Request Schema (planRequestSchema.js)', () => {
  const getFutureDate = (daysAhead = 30) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getValidPayload = () => ({
    eventType: 'wedding',
    eventName: 'Riya & Aman Wedding',
    eventDate: getFutureDate(60),
    guestCount: 150,
    budget: 800000,
    currency: 'INR',
    city: 'Lucknow',
    venuePreference: 'either',
    priorities: ['food', 'photography'],
    dietary: ['veg'],
    functionAddons: ['mehndi'],
    notes: 'Simple family celebration',
  });

  it('accepts a fully specified valid payload', () => {
    const payload = getValidPayload();
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    expect(result.data.eventName).toBe('Riya & Aman Wedding');
    expect(result.data.budget).toBe(800000);
  });

  it('applies default values for optional fields', () => {
    const payload = {
      eventType: 'birthday',
      eventName: 'Aryan Birthday',
      eventDate: getFutureDate(10),
      guestCount: 50,
      budget: 50000,
      city: 'Delhi',
    };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    expect(result.data.currency).toBe('INR');
    expect(result.data.venuePreference).toBe('either');
    expect(result.data.priorities).toEqual([]);
    expect(result.data.dietary).toEqual(['none']);
    expect(result.data.functionAddons).toEqual([]);
    expect(result.data.notes).toBe('');
  });

  it('rejects past event dates', () => {
    const payload = { ...getValidPayload(), eventDate: '2020-01-01' };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/cannot be in the past/);
  });

  it('rejects invalid date calendar formats', () => {
    const payload = { ...getValidPayload(), eventDate: '2027-02-31' };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/valid calendar date/);
  });

  it('rejects guest count outside 1–2000', () => {
    const low = planRequestSchema.safeParse({ ...getValidPayload(), guestCount: 0 });
    expect(low.success).toBe(false);

    const high = planRequestSchema.safeParse({ ...getValidPayload(), guestCount: 2001 });
    expect(high.success).toBe(false);

    const floatVal = planRequestSchema.safeParse({ ...getValidPayload(), guestCount: 50.5 });
    expect(floatVal.success).toBe(false);
  });

  it('rejects zero or negative budgets', () => {
    const zero = planRequestSchema.safeParse({ ...getValidPayload(), budget: 0 });
    expect(zero.success).toBe(false);

    const neg = planRequestSchema.safeParse({ ...getValidPayload(), budget: -500 });
    expect(neg.success).toBe(false);
  });

  it('rejects unknown fields (.strict())', () => {
    const payload = {
      ...getValidPayload(),
      unexpectedField: 'not allowed',
    };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/Unknown fields are not allowed/);
  });

  it('rejects notes exceeding 500 characters', () => {
    const longNotes = 'a'.repeat(501);
    const payload = { ...getValidPayload(), notes: longNotes };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toMatch(/cannot exceed 500 characters/);
  });

  it('rejects invalid eventType', () => {
    const payload = { ...getValidPayload(), eventType: 'festival' };
    const result = planRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
