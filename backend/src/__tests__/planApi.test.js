import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { app } from '../app.js';
import { createPlanRateLimiter } from '../middleware/rateLimiter.js';

describe('POST /api/plan (Rules-Only API)', () => {
  const getFutureDate = (daysAhead = 45) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const samplePayload = {
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
    notes: 'Prefer a simple, family-friendly event',
  };

  it('returns 200 with rules-only plan and aiEnhanced: false for valid request', async () => {
    const res = await request(app)
      .post('/api/plan')
      .send(samplePayload);

    expect(res.status).toBe(200);
    expect(res.body.aiEnhanced).toBe(false);

    const { plan } = res.body;
    expect(plan).toBeDefined();
    expect(Array.isArray(plan.budget)).toBe(true);
    expect(Array.isArray(plan.timeline)).toBe(true);
    expect(Array.isArray(plan.vendors)).toBe(true);
    expect(Array.isArray(plan.warnings)).toBe(true);
    expect(Array.isArray(plan.tradeoffs)).toBe(true);
    expect(plan.budgetHealth).toBeDefined();
    expect(plan.panicMode).toBeDefined();

    // Sum of budget amounts equals requested budget
    const totalAllocated = plan.budget.reduce((sum, item) => sum + item.amount, 0);
    expect(totalAllocated).toBe(800000);
  });

  it('returns 400 with VALIDATION_ERROR on invalid payload', async () => {
    const invalidPayload = {
      ...samplePayload,
      guestCount: -10, // Invalid guest count
      budget: 0, // Invalid budget
      eventDate: '2020-01-01', // Past date
    };

    const res = await request(app)
      .post('/api/plan')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThanOrEqual(2);
  });

  it('includes Helmet security headers in the response', async () => {
    const res = await request(app)
      .post('/api/plan')
      .send(samplePayload);

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('triggers 429 when rate limit of 10 requests per minute is exceeded', async () => {
    // Create dedicated app with fresh rate limiter to test boundary cleanly
    const testApp = express();
    testApp.use(createPlanRateLimiter());
    testApp.get('/test-limit', (_req, res) => res.json({ ok: true }));

    // Send 10 allowed requests
    for (let i = 0; i < 10; i++) {
      const res = await request(testApp).get('/test-limit');
      expect(res.status).toBe(200);
    }

    // 11th request must be rejected with 429
    const blockedRes = await request(testApp).get('/test-limit');
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(blockedRes.body.error.message).toMatch(/Too many plan requests/);
  });
});
