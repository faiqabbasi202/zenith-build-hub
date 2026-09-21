/**
 * In-Memory Server Cache Layer for Fast Rendering
 * 
 * Provides sub-millisecond data retrieval for SSR and server functions,
 * reducing repeated database queries to Supabase with TTL and
 * stale-while-revalidate (SWR) background refreshes.
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  swrMs: number;
  isFetching?: boolean;
}

// Global cache store on server / runtime instance
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Retrieves data from cache or computes and caches it.
 * 
 * @param key Unique cache key
 * @param fetcher Async function producing the data
 * @param ttlMs Time in ms data is completely fresh (default 2 minutes)
 * @param swrMs Time in ms stale data can be served while background revalidating (default 10 minutes)
 */
export async function getOrSetServerCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 120_000,
  swrMs = 600_000,
): Promise<T> {
  const now = Date.now();
  const existing = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (existing) {
    const age = now - existing.cachedAt;

    // 1. Fresh: return cached data immediately (< 1ms)
    if (age < existing.ttlMs) {
      return existing.data;
    }

    // 2. Stale-while-revalidate: return stale data immediately and refresh in background
    if (age < existing.swrMs) {
      if (!existing.isFetching) {
        existing.isFetching = true;
        // Background revalidation
        fetcher()
          .then((freshData) => {
            cacheStore.set(key, {
              data: freshData,
              cachedAt: Date.now(),
              ttlMs,
              swrMs,
              isFetching: false,
            });
          })
          .catch((err) => {
            console.error(`[ServerCache] Background refresh failed for ${key}:`, err);
            existing.isFetching = false;
          });
      }
      return existing.data;
    }
  }

  // 3. Expired or not cached: fetch synchronously
  try {
    const freshData = await fetcher();
    cacheStore.set(key, {
      data: freshData,
      cachedAt: Date.now(),
      ttlMs,
      swrMs,
      isFetching: false,
    });
    return freshData;
  } catch (error) {
    // If fetching fails but we have stale data, fall back to stale data rather than crashing
    if (existing) {
      console.warn(`[ServerCache] Fetch failed for ${key}, falling back to stale data:`, error);
      return existing.data;
    }
    throw error;
  }
}

/**
 * Invalidate cache entries by key, prefix, or clear all.
 * Call this when records are created, edited, or deleted in the admin panel.
 */
export function invalidateServerCache(pattern?: string): void {
  if (!pattern) {
    cacheStore.clear();
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key === pattern || key.startsWith(pattern) || key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Returns current cache statistics for monitoring / debugging
 */
export function getServerCacheStats(): { size: number; keys: string[] } {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}
