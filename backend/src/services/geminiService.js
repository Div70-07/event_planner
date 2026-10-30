import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { SYSTEM_INSTRUCTION, buildEnrichmentPrompt } from '../prompts/planPrompt.js';
import { aiEnrichmentSchema } from '../schemas/aiEnrichmentSchema.js';

const TIMEOUT_MS = 45000; // 45s timeout limit for full LLM responses

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
 * Calls OpenRouter chat completions API with timeout and robust error handling.
 */
async function callOpenRouter(promptText) {
const payload = {
  model: env.openRouterModel,
  temperature: 0.6,
  max_tokens: 3000,

  reasoning: {
    enabled: false,
  },

  chat_template_kwargs: {
    enable_thinking: false,
  },

  messages: [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    { role: 'user', content: promptText },
  ],
};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${env.openRouterBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Celebration and Event Planner',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenRouter HTTP ${res.status}: ${errorText}`);
    }

   const data = await res.json();

  const messageContent = data.choices?.[0]?.message?.content;

console.log('[OpenRouter DEBUG]', {
  finishReason: data.choices?.[0]?.finish_reason,
  contentType: typeof messageContent,
  contentLength: typeof messageContent === 'string'
    ? messageContent.length
    : null,
    reasoningTokens: data.usage?.completion_tokens_details?.reasoning_tokens, totalCompletionTokens: data.usage?.completion_tokens,
  hasError: Boolean(data.error),
  error: data.error || null,
});

return messageContent || '';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Calls direct Google Gemini API with timeout limit.
 */
async function callGemini(aiClient, promptText) {
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

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Enriches a rules-generated event plan using OpenRouter or Gemini AI.
 * Returns null if anything fails, allowing graceful rules-only fallback.
 *
 * @param {Object} input - Validated plan request body
 * @param {Object} rulesPlan - Output of rules engine
 * @param {Object} [injectedClient] - Optional injected client for testing/mocking
 * @returns {Promise<Object|null>} Validated enrichment object or null on failure
 */
export async function enrichPlanWithGemini(input, rulesPlan, injectedClient = null) {
  const hasOpenRouter = Boolean(env.openRouterApiKey);
  const hasGemini = Boolean(env.geminiApiKey) || Boolean(injectedClient);

  // If no AI key is configured, gracefully fall back immediately
  if (!hasOpenRouter && !hasGemini) {
    if (env.nodeEnv !== 'test') {
      console.warn('[AIService] No OPENROUTER_API_KEY or GEMINI_API_KEY found; falling back to rules-only plan.');
    }
    return null;
  }

  const prompt = buildEnrichmentPrompt(input, rulesPlan);
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let rawText = '';

      if (injectedClient) {
        rawText = await callGemini(injectedClient, prompt);
      } else if (hasOpenRouter) {
        // Preferred: OpenRouter API
        rawText = await callOpenRouter(prompt);
      } else {
        // Direct Gemini SDK
        const aiClient = new GoogleGenAI({ apiKey: env.geminiApiKey });
        rawText = await callGemini(aiClient, prompt);
      }

      if (!rawText) {
        throw new Error('Empty response text from AI provider');
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
      if (attempt === maxAttempts || err.name === 'AbortError' || err.message?.includes('TIMEOUT')) {
        if (env.nodeEnv !== 'test') {
          console.warn(`[AIService] AI enrichment failed (${err.message}); falling back to rules plan.`);
        }
        return null;
      }
      // Brief pause before retry
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return null;
}
