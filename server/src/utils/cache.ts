const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;

const parseCache = new Map<string, { result: unknown; expiresAt: number }>();

export function getFromCache(hash: string): unknown | null {
  const entry = parseCache.get(hash);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    parseCache.delete(hash);
    return null;
  }
  return entry.result;
}

export function saveToCache(hash: string, result: unknown): void {
  if (parseCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = parseCache.keys().next().value;
    if (oldestKey) parseCache.delete(oldestKey);
  }
  parseCache.set(hash, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}