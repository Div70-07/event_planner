import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { validateBody } from '../middleware/validate.js';
import { errorHandler, AppError } from '../middleware/errorHandler.js';
import { planRequestSchema } from '../schemas/planRequestSchema.js';

describe('Error Handling and Validation Middleware', () => {
  const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Test route using validateBody
    app.post('/test/validate', validateBody(planRequestSchema), (req, res) => {
      res.json({ success: true, data: req.body });
    });

    // Test route triggering AppError
    app.get('/test/app-error', () => {
      throw new AppError('Custom operational error', 422, 'CUSTOM_ERROR', [{ info: 'sample' }]);
    });

    // Test route triggering unhandled error
    app.get('/test/server-error', () => {
      throw new Error('Explosion');
    });

    app.use(errorHandler);
    return app;
  };

  const app = createTestApp();

  it('formats validation errors with VALIDATION_ERROR code and field details', async () => {
    const res = await request(app).post('/test/validate').send({
      eventType: 'invalid_event',
      guestCount: -5,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('Please check the submitted fields.');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('formats custom AppError correctly', async () => {
    const res = await request(app).get('/test/app-error');
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error: {
        code: 'CUSTOM_ERROR',
        message: 'Custom operational error',
        details: [{ info: 'sample' }],
      },
    });
  });

  it('formats unhandled 500 errors safely without leaking internal trace in error message', async () => {
    const res = await request(app).get('/test/server-error');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('An unexpected server error occurred.');
  });
});
