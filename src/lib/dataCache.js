const DEFAULT_TTL_MS = 30_000;
const GLOBAL_CACHE_KEY = "__fcrDataCacheState__";

const getCacheState = () => {
  const globalScope = globalThis;

  if (!globalScope[GLOBAL_CACHE_KEY]) {
    globalScope[GLOBAL_CACHE_KEY] = {
      cacheStore: new Map(),
      inflightRequests: new Map(),
    };
  }

  return globalScope[GLOBAL_CACHE_KEY];
};

const getCacheStore = () => getCacheState().cacheStore;
const getInflightRequests = () => getCacheState().inflightRequests;

const normalizeCacheKey = (value) => {
  if (!value) {
    return "default";
  }

  if (typeof value !== "string") {
    return String(value);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "default";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    try {
      const parsedUrl = new URL(trimmedValue);
      return `${parsedUrl.pathname}${parsedUrl.search}` || parsedUrl.pathname;
    } catch {
      return trimmedValue;
    }
  }

  return trimmedValue;
};

const getCacheEntry = (cacheKey) => {
  const entry = getCacheStore().get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    getCacheStore().delete(cacheKey);
    return null;
  }

  return entry;
};

// Shared in-memory cache used by the API routes and the client-side fetch hook.
export function getCachedValue(cacheKey) {
  const normalizedCacheKey = normalizeCacheKey(cacheKey);
  const entry = getCacheEntry(normalizedCacheKey);

  if (entry) {
    console.info("[CACHE] hit", { cacheKey: normalizedCacheKey });
    return entry.value;
  }

  console.info("[CACHE] miss", { cacheKey: normalizedCacheKey });
  return null;
}

export function setCachedValue(cacheKey, value, ttlMs = DEFAULT_TTL_MS) {
  const normalizedCacheKey = normalizeCacheKey(cacheKey);
  getCacheStore().set(normalizedCacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
    ttlMs,
  });
}

export function invalidateCache(cacheKey) {
  if (!cacheKey) {
    return;
  }

  const normalizedKey = normalizeCacheKey(cacheKey);
  getCacheStore().delete(normalizedKey);
  getInflightRequests().delete(normalizedKey);
}

export function invalidateCachePrefix(prefix) {
  if (!prefix) {
    getCacheStore().clear();
    getInflightRequests().clear();
    return;
  }

  const normalizedPrefix = normalizeCacheKey(prefix);

  for (const cacheKey of Array.from(getCacheStore().keys())) {
    if (
      cacheKey === normalizedPrefix ||
      cacheKey.startsWith(normalizedPrefix)
    ) {
      getCacheStore().delete(cacheKey);
    }
  }

  for (const cacheKey of Array.from(getInflightRequests().keys())) {
    if (
      cacheKey === normalizedPrefix ||
      cacheKey.startsWith(normalizedPrefix)
    ) {
      getInflightRequests().delete(cacheKey);
    }
  }
}

export async function fetchJsonWithCache(input, init = {}, options = {}) {
  const method = (init?.method || "GET").toUpperCase();
  const enableCache = options.enableCache !== false && method === "GET";
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const forceRefresh = options.forceRefresh === true;
  const cacheKey = normalizeCacheKey(options.cacheKey || input);

  if (enableCache && !forceRefresh) {
    const cachedValue = getCachedValue(cacheKey);
    if (cachedValue !== null) {
      return {
        ok: true,
        status: 200,
        data: cachedValue,
        cached: true,
        response: null,
      };
    }
  }

  const inflightPromise = getInflightRequests().get(cacheKey);
  if (inflightPromise) {
    return inflightPromise;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(input, {
        ...init,
        cache: "no-store",
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (enableCache && response.ok && !forceRefresh) {
        setCachedValue(cacheKey, payload, ttlMs);
      }

      return {
        ok: response.ok,
        status: response.status,
        data: payload,
        cached: false,
        response,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        data: null,
        cached: false,
        response: null,
        error,
      };
    } finally {
      getInflightRequests().delete(cacheKey);
    }
  })();

  getInflightRequests().set(cacheKey, requestPromise);
  return requestPromise;
}

export async function prefetchJson(input, init = {}, options = {}) {
  return fetchJsonWithCache(input, init, {
    ...options,
    enableCache: true,
  });
}
