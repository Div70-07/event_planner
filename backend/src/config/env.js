import 'dotenv/config';

/**
 * Validates and exports environment configuration.
 * Fails fast with clear error messages if required variables are missing in production.
 */
function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const port = parseInt(process.env.PORT || '4000', 10);
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  const errors = [];

  if (isProduction && !geminiApiKey) {
    errors.push('GEMINI_API_KEY is required in production.');
  }

  if (isNaN(port) || port <= 0 || port > 65535) {
    errors.push(`Invalid PORT: ${process.env.PORT}`);
  }

  if (errors.length > 0) {
    throw new Error(`Environment Configuration Error:\n- ${errors.join('\n- ')}`);
  }

  return {
    nodeEnv,
    isProduction,
    isTest: nodeEnv === 'test',
    port,
    corsOrigin: corsOrigin.split(',').map((o) => o.trim()).filter(Boolean),
    geminiApiKey,
    geminiModel,
  };
}

export const env = loadEnv();
export { loadEnv };
