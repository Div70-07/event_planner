import crypto from 'crypto';

/**
 * In-memory cache with TTL support and deterministic request hashing.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Generates a deterministic SHA-256 hash key from a normalized plan request.
   */
  generateKey(input = {}) {
    const normalized = {
      eventType: (input.eventType || '').trim().toLowerCase(),
      eventName: (input.eventName || '').trim().toLowerCase(),
      eventDate: input.eventDate || '',
      guestCount: input.guestCount || 0,
      budget: input.budget || 0,
      city: (input.city || '').trim().toLowerCase(),
      venuePreference: input.venuePreference || 'either',
      priorities: [...(input.priorities || [])].sort(),
      dietary: [...(input.dietary || [])].sort(),
      functionAddons: [...(input.functionAddons || [])].sort(),
      notes: (input.notes || '').trim().toLowerCase(),
    };

    const str = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * Retrieves an item from the cache if not expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Sets an item in cache with a TTL (default: 10 minutes).
   */
  set(key, value, ttlMs = 10 * 60 * 1000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Checks if an unexpired key exists.
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clears all cache entries.
   */
  clear() {
    this.store.clear();
  }
}

export const planCache = new MemoryCache();
