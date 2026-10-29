import rateLimit from 'express-rate-limit';

/**
 * Factory for creating plan rate limiter instances.
 */
export function createPlanRateLimiter(overrides = {}) {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per window
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    // eslint-disable-next-line no-unused-vars
    handler: (req, res, _next, options) => {
      res.status(options.statusCode).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many plan requests. Please wait a minute before trying again.',
          details: [
            {
              field: 'rateLimit',
              message: `Limit of 10 requests per minute exceeded. Retry after ${Math.ceil(options.windowMs / 1000)} seconds.`,
            },
          ],
        },
      });
    },
    ...overrides,
  });
}

/**
 * Standard exported rate limiter for application routes.
 */
export const planRateLimiter = createPlanRateLimiter();
