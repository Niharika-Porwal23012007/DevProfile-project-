import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive tokens (e.g. GitHub OAuth tokens) at rest using AES-256-GCM
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = Buffer.from(config.tokenEncryptionKey.padEnd(64, '0').slice(0, 64), 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Combine iv + tag + ciphertext into a safe hex package
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt tokens stored in database
 */
export function decryptToken(encryptedPackage: string): string {
  if (!encryptedPackage) return '';
  const parts = encryptedPackage.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  const key = Buffer.from(config.tokenEncryptionKey.padEnd(64, '0').slice(0, 64), 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Hash an API key for safe database storage (SHA-256)
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new secure personal API key for VS Code extension
 */
export function generateApiKey(): string {
  return `devprof_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Generate a cryptographically secure random state string for OAuth
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(16).toString('hex');
}
