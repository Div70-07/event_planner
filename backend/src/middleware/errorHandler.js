/**
 * Custom application error class for standard operational errors.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Central Express error handling middleware.
 * Ensures all errors adhere to the specification format:
 * { "error": { "code": "...", "message": "...", "details": [] } }
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body.',
        details: [],
      },
    });
  }

  // Handle CORS rejection
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: {
        code: 'CORS_FORBIDDEN',
        message: 'Request blocked by CORS policy.',
        details: [],
      },
    });
  }

  // Operational AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Log unexpected internal errors (suppressed in test environment if needed)
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'An unexpected server error occurred.' : err.message,
      details: err.details || [],
    },
  });
}
