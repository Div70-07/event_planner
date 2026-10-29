import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint
 */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;
