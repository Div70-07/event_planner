import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { SYSTEM_INSTRUCTION, buildEnrichmentPrompt } from '../prompts/planPrompt.js';
import { aiEnrichmentSchema } from '../schemas/aiEnrichmentSchema.js';

const TIMEOUT_MS = 15000; // 15s timeout

/**
 * Strips markdown code blocks if the model wrapped JSON output in ```json ... ```
 */
function cleanJsonString(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Calls Gemini with a 15-second timeout limit.
 */
async function callGeminiWithTimeout(aiClient, promptText) {
  const apiPromise = aiClient.models.generateContent({
    model: env.geminiModel,
    contents: promptText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.6,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json',
    },
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('GEMINI_TIMEOUT: Request exceeded 15 seconds')), TIMEOUT_MS);
  });

  return Promise.race([apiPromise, timeoutPromise]);
}

/**
 * Enriches a rules-generated event plan using Gemini AI.
 * Returns null if anything fails, allowing graceful rules-only fallback.
 *
 * @param {Object} input - Validated plan request body
 * @param {Object} rulesPlan - Output of rules engine
 * @param {Object} [injectedClient] - Optional injected client for testing/mocking
 * @returns {Promise<Object|null>} Validated enrichment object or null on failure
 */
export async function enrichPlanWithGemini(input, rulesPlan, injectedClient = null) {
  // If no API key configured, gracefully fall back immediately
  if (!env.geminiApiKey && !injectedClient) {
    if (env.nodeEnv !== 'test') {
      console.warn('[GeminiService] No GEMINI_API_KEY found; falling back to rules-only plan.');
    }
    return null;
  }

  const aiClient = injectedClient || new GoogleGenAI({ apiKey: env.geminiApiKey });
  const prompt = buildEnrichmentPrompt(input, rulesPlan);

  // Attempt up to 2 tries (initial + 1 retry on invalid JSON)
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await callGeminiWithTimeout(aiClient, prompt);
      const rawText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty response text from Gemini');
      }

      const cleaned = cleanJsonString(rawText);
      const parsed = JSON.parse(cleaned);

      // Validate structure with Zod schema
      const validation = aiEnrichmentSchema.safeParse(parsed);
      if (!validation.success) {
        throw new Error(`Invalid AI response schema: ${validation.error.message}`);
      }

      return validation.data;
    } catch (err) {
      if (attempt === maxAttempts || err.message?.includes('GEMINI_TIMEOUT')) {
        if (env.nodeEnv !== 'test') {
          console.warn(`[GeminiService] AI enrichment failed (${err.message}); falling back to rules plan.`);
        }
        return null;
      }
      // Brief pause before retry
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return null;
}
