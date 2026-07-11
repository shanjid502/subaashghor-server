import crypto from 'crypto';
import config from '../config';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  config.jwt_access_secret ||
  'fallback_secret_32_characters_long_!!!';

// Ensure the key is exactly 32 bytes
const getKey = (): Buffer => {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
};

/**
 * Encrypts plain text using AES-256-CBC
 */
export const encrypt = (text: string): string => {
  if (!text || text === '********') return text;

  // If it's already encrypted (has the colon delimiter and is a hex string), don't encrypt again
  if (text.includes(':') && text.split(':').length === 2) {
    return text;
  }

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    return text;
  }
};

/**
 * Decrypts text if it is encrypted. Returns original text if decryption fails or if it's not encrypted.
 */
export const decrypt = (text: string): string => {
  if (!text || text === '********') return text;

  const parts = text.split(':');
  if (parts.length !== 2) {
    return text; // Not encrypted
  }

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');

    // Validate IV size
    if (iv.length !== 16) {
      return text;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    // Return original string if decryption fails (e.g. during initial migration)
    return text;
  }
};
