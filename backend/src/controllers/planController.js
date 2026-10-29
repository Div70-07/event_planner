import { generateRulesPlan } from '../services/rulesEngine/index.js';

/**
 * POST /api/plan
 * Generates an event plan based on deterministic business rules.
 */
export async function createPlan(req, res, next) {
  try {
    const validatedInput = req.body;

    // Generate rules-only plan
    const rulesPlan = generateRulesPlan(validatedInput);

    return res.status(200).json({
      aiEnhanced: false,
      plan: rulesPlan,
    });
  } catch (error) {
    return next(error);
  }
}
