import { z } from 'zod';

/**
 * Strict Zod schema for validating the Gemini AI enrichment JSON payload.
 * AI may ONLY enrich qualitative fields (summary, themes, tips, vendor advice, risks).
 * It cannot alter budget amounts, totals, dates, or rules engine allocations.
 */
export const aiEnrichmentSchema = z.object({
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(800, 'Summary cannot exceed 800 characters'),

  themeIdeas: z
    .array(z.string().min(3).max(150))
    .min(1, 'At least 1 theme idea required')
    .max(8, 'At most 8 theme ideas allowed'),

  personalisedTips: z
    .array(z.string().min(5).max(300))
    .min(1, 'At least 1 personalised tip required')
    .max(8, 'At most 8 tips allowed'),

  vendorSuggestions: z
    .array(
      z.object({
        type: z.string().min(2).max(100),
        advice: z.string().min(5).max(300),
      })
    )
    .min(1, 'At least 1 vendor suggestion required')
    .max(8, 'At most 8 vendor suggestions allowed'),

  risks: z
    .array(
      z.object({
        risk: z.string().min(5).max(200),
        mitigation: z.string().min(5).max(300),
      })
    )
    .min(1, 'At least 1 risk mitigation required')
    .max(8, 'At most 8 risk items allowed'),
});
