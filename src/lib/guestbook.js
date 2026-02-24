import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_INTERVAL_MS = 10_000;

const RATE_LIMIT_STATE = new Map();

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/g;

/**
 * @param {string | undefined | null} value
 */
export function sanitizeField(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(CONTROL_CHAR_REGEX, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * @param {string | null | undefined} rawLimit
 */
export function parseLimit(rawLimit) {
  const parsed = Number.parseInt(rawLimit ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

/**
 * @param {{name?: string; message?: string; locale?: string}} payload
 */
export function validateGuestbookInput(payload) {
  const name = sanitizeField(payload?.name);
  const message = sanitizeField(payload?.message);
  const locale = payload?.locale === 'en' ? 'en' : 'ko';

  if (!name || name.length > 20) {
    throw new Error('Name must be between 1 and 20 characters.');
  }

  if (!message || message.length > 300) {
    throw new Error('Message must be between 1 and 300 characters.');
  }

  return { name, message, locale };
}

/**
 * @param {{filePath: string}} options
 */
export function createGuestbookStore(options) {
  const filePath = options.filePath;

  return {
    /**
     * @param {{name: string; message: string; locale: 'ko'|'en'}} payload
     */
    async append(payload) {
      const normalized = validateGuestbookInput(payload);
      const entry = {
        id: crypto.randomUUID(),
        name: normalized.name,
        message: normalized.message,
        locale: normalized.locale,
        createdAt: new Date().toISOString(),
      };

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
      return entry;
    },

    /**
     * @param {number} limit
     */
    async listLatest(limit) {
      const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
      let contents = '';
      try {
        contents = await fs.readFile(filePath, 'utf8');
      } catch (error) {
        const code = /** @type {{code?: string}} */ (error)?.code;
        if (code === 'ENOENT') {
          return [];
        }
        throw error;
      }

      const lines = contents
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const items = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed?.id && parsed?.name && parsed?.message && parsed?.createdAt) {
            items.push(parsed);
          }
        } catch {
          // ignore broken lines
        }
      }

      return items.reverse().slice(0, safeLimit);
    },
  };
}

/**
 * @param {string} key
 */
export function isRateLimited(key) {
  const now = Date.now();
  const previous = RATE_LIMIT_STATE.get(key) ?? 0;
  if (now - previous < MIN_INTERVAL_MS) {
    return true;
  }
  RATE_LIMIT_STATE.set(key, now);
  return false;
}

export const guestbookDefaults = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MIN_INTERVAL_MS,
};
