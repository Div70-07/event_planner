import { generateRulesPlan } from '../services/rulesEngine/index.js';
import { enrichPlanWithGemini } from '../services/geminiService.js';
import { planCache } from '../services/cache.js';

/**
 * POST /api/plan
 * Generates an event plan with deterministic rules and optional Gemini AI enrichment.
 */
export async function createPlan(req, res, next) {
  try {
    const validatedInput = req.body;

    // 1. Generate complete rules-based plan
    const rulesPlan = generateRulesPlan(validatedInput);

    // 2. Check in-memory cache for prior AI enrichment
    const cacheKey = planCache.generateKey(validatedInput);
    let aiEnrichment = planCache.get(cacheKey);

    // 3. If not cached, attempt single Gemini enrichment call
    if (!aiEnrichment) {
      aiEnrichment = await enrichPlanWithGemini(validatedInput, rulesPlan);
      if (aiEnrichment) {
        planCache.set(cacheKey, aiEnrichment);
      }
    }

    // 4. Return enriched or rules-only plan with non-blocking fallback indicator
    if (aiEnrichment) {
      return res.status(200).json({
        aiEnhanced: true,
        plan: {
          ...rulesPlan,
          ai: aiEnrichment,
        },
      });
    }

    return res.status(200).json({
      aiEnhanced: false,
      aiNotice: 'AI enrichment currently unavailable. Complete rules-based plan returned.',
      plan: {
        ...rulesPlan,
        ai: null,
      },
    });
  } catch (error) {
    return next(error);
  }
}
