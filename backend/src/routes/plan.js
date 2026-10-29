import { Router } from 'express';
import { createPlan } from '../controllers/planController.js';
import { validateBody } from '../middleware/validate.js';
import { planRequestSchema } from '../schemas/planRequestSchema.js';
import { planRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * POST /api/plan
 * Generates an event plan. Rate-limited to 10 req/min/IP.
 */
router.post('/plan', planRateLimiter, validateBody(planRequestSchema), createPlan);

export default router;
