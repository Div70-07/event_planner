import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadEnv } from '../config/env.js';

describe('Environment Config (env.js)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads valid default values for development', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    const config = loadEnv();
    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(4000);
    expect(config.isProduction).toBe(false);
  });

  it('parses comma-separated CORS origins', () => {
    process.env.CORS_ORIGIN = 'http://localhost:5173, https://example.com ';
    const config = loadEnv();
    expect(config.corsOrigin).toEqual(['http://localhost:5173', 'https://example.com']);
  });

  it('throws in production if both GEMINI_API_KEY and OPENROUTER_API_KEY are missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    expect(() => loadEnv()).toThrow(/Either OPENROUTER_API_KEY or GEMINI_API_KEY is required in production/);
  });

  it('allows production if OPENROUTER_API_KEY is provided without GEMINI_API_KEY', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.GEMINI_API_KEY;
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    const config = loadEnv();
    expect(config.openRouterApiKey).toBe('test-openrouter-key');
  });

  it('throws if PORT is invalid', () => {
    process.env.PORT = 'invalid-port';
    expect(() => loadEnv()).toThrow(/Invalid PORT/);
  });
});
