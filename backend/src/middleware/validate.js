/**
 * Middleware factory that validates req.body against a given Zod schema.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.') || 'body',
        message: err.message,
      }));

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the submitted fields.',
          details,
        },
      });
    }

    // Replace req.body with sanitized and defaulted data
    req.body = result.data;
    next();
  };
}
