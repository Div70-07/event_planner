import { z } from 'zod';
import {
  EVENT_TYPES,
  PRIORITIES,
  DIETARY_OPTIONS,
  VENUE_PREFERENCES,
  FUNCTION_ADDONS,
} from '../config/eventConfig.js';

/**
 * Helper to get today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Strict Zod schema for POST /api/plan requests.
 * Enforces field types, boundaries, date validity, and disallows unknown fields.
 */
export const planRequestSchema = z
  .object({
    eventType: z.enum(EVENT_TYPES, {
      errorMap: () => ({
        message: `eventType must be one of: ${EVENT_TYPES.join(', ')}`,
      }),
    }),

    eventName: z
      .string({ required_error: 'eventName is required' })
      .trim()
      .min(1, 'eventName cannot be empty')
      .max(100, 'eventName cannot exceed 100 characters'),

    eventDate: z
      .string({ required_error: 'eventDate is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'eventDate must be in YYYY-MM-DD format')
      .refine((dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const parsed = new Date(year, month - 1, day);
        return (
          parsed.getFullYear() === year &&
          parsed.getMonth() === month - 1 &&
          parsed.getDate() === day
        );
      }, 'eventDate must be a valid calendar date')
      .refine((dateStr) => {
        const today = getTodayDateString();
        return dateStr >= today;
      }, 'eventDate cannot be in the past'),

    guestCount: z
      .number({ required_error: 'guestCount is required' })
      .int('guestCount must be an integer')
      .min(1, 'guestCount must be at least 1')
      .max(2000, 'guestCount cannot exceed 2000'),

    budget: z
      .number({ required_error: 'budget is required' })
      .positive('budget must be a positive amount')
      .max(1_000_000_000, 'budget cannot exceed 1,000,000,000'),

    currency: z.literal('INR').default('INR'),

    city: z
      .string({ required_error: 'city is required' })
      .trim()
      .min(1, 'city cannot be empty')
      .max(100, 'city cannot exceed 100 characters'),

    venuePreference: z.enum(VENUE_PREFERENCES).default('either'),

    priorities: z.array(z.enum(PRIORITIES)).default([]),

    dietary: z.array(z.enum(DIETARY_OPTIONS)).default(['none']),

    functionAddons: z.array(z.enum(FUNCTION_ADDONS)).default([]),

    notes: z
      .string()
      .max(500, 'notes cannot exceed 500 characters')
      .optional()
      .default(''),
  })
  .strict({
    message: 'Unknown fields are not allowed',
  });
