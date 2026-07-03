import { randomBytes } from 'crypto';

/**
 * Generates a unique Event ID for deduplication between
 * the Facebook Browser Pixel and the Server-Side Conversions API (CAPI).
 * Format: `evt_<timestamp>_<8-random-bytes-hex>`
 */
export const generateEventId = (): string => {
  const ts = Date.now().toString(36);
  const rand = randomBytes(8).toString('hex');
  return `evt_${ts}_${rand}`;
};
