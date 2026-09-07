import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchJsonWithCache,
  getCachedValue,
  invalidateCachePrefix,
} from "@/lib/dataCache";

const normalizeData = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const nestedData = payload.data;
    if (Array.isArray(nestedData)) {
      return nestedData;
    }

    if (nestedData && typeof nestedData === "object") {
      return nestedData;
    }

    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload || [];
};

/**
 * Custom hook for fetching data with automatic refetch capability
 * Handles real-time updates after CRUD operations without page refresh
 *
 * @param {string} url - API endpoint to fetch from
 * @param {object} options - Configuration options
 * @param {boolean} options.immediate - Fetch on mount (default: true)
 * @param {function} options.onSuccess - Callback on successful fetch
 * @param {function} options.onError - Callback on error
 * @returns {object} - { data, loading, error, refetch }
 */
export function useFetchData(url, options = {}) {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    initialData = [],
    cacheKey = url,
    ttlMs = 30_000,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const latestCallbacksRef = useRef({ onSuccess, onError });

  useEffect(() => {
    latestCallbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(
    async (showLoadingState = true) => {
      const cachedValue = getCachedValue(cacheKey);
      if (cachedValue !== null && !showLoadingState) {
        setData(normalizeData(cachedValue));
        return;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (showLoadingState) {
          setLoading(true);
        }
        setError(null);

        const result = await fetchJsonWithCache(
          url,
          { signal: controller.signal },
          { cacheKey, ttlMs },
        );

        if (!result.ok) {
          throw new Error(result.error?.message || `HTTP ${result.status}`);
        }

        const payload = result.data;

        if (
          payload &&
          typeof payload === "object" &&
          payload.success === false
        ) {
          throw new Error(payload.message || "Failed to fetch data");
        }

        const newData = normalizeData(payload);
        setData(newData);

        if (latestCallbacksRef.current.onSuccess) {
          latestCallbacksRef.current.onSuccess(newData);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          if (latestCallbacksRef.current.onError) {
            latestCallbacksRef.current.onError(err);
          }
        }
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    [url, onSuccess, onError, cacheKey, ttlMs],
  );

  /**
   * Refetch data (useful after CRUD operations)
   * By default, doesn't show loading state to avoid UI flicker
   */
  const refetch = useCallback(
    async (showLoadingState = false) => {
      return fetchData(showLoadingState);
    },
    [fetchData],
  );

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData(true);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, immediate, cacheKey, ttlMs]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}

/**
 * Utility function to handle CRUD operations with auto-refetch
 *
 * @param {string} url - API endpoint
 * @param {string} method - HTTP method (POST, PUT, DELETE)
 * @param {object} body - Request body
 * @param {function} refetch - Refetch function from useFetchData
 * @param {object} options - Additional options
 * @returns {object} - { response, success, error }
 */
export async function performCRUDOperation(
  url,
  method,
  body,
  refetch,
  options = {},
) {
  const {
    successMessage = "Operation successful",
    errorMessage = "Operation failed",
    showToast = true,
    refetchDelay = 200,
  } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || errorMessage);
    }

    if (showToast) {
      toast.success(successMessage);
    }

    if (url.includes("/api/buy-products")) {
      invalidateCachePrefix("/api/buy-products");
    }

    if (url.includes("/api/rental-products")) {
      invalidateCachePrefix("/api/rental-products");
    }

    if (url.includes("/api/testimonials")) {
      invalidateCachePrefix("/api/testimonials");
    }

    if (url.includes("/api/profile")) {
      invalidateCachePrefix("/api/profile");
    }

    if (refetch) {
      if (refetchDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, refetchDelay));
      }
      await refetch(false);
    }

    return {
      response: result,
      success: true,
      error: null,
    };
  } catch (error) {
    if (showToast) {
      toast.error(error.message || errorMessage);
    }

    return {
      response: null,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Optimistic update pattern
 * Update UI immediately, then sync with server
 */
export function useOptimisticUpdate(data, setData, refetch) {
  /**
   * Update data optimistically and confirm with server
   */
  const optimisticUpdate = useCallback(
    async (updateFn, url, method, body, options = {}) => {
      const previousData = data;
      setData(updateFn(data));

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setData(previousData);
          throw new Error(result.message || "Operation failed");
        }

        if (url.includes("/api/buy-products")) {
          invalidateCachePrefix("/api/buy-products");
        }

        if (url.includes("/api/rental-products")) {
          invalidateCachePrefix("/api/rental-products");
        }

        if (url.includes("/api/testimonials")) {
          invalidateCachePrefix("/api/testimonials");
        }

        if (url.includes("/api/profile")) {
          invalidateCachePrefix("/api/profile");
        }

        if (refetch) {
          if (options.refetchDelay > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, options.refetchDelay),
            );
          }
          await refetch(false);
        }

        if (options.showToast !== false) {
          toast.success(options.successMessage || "Updated successfully");
        }

        return { success: true, error: null };
      } catch (error) {
        if (options.showToast !== false) {
          toast.error(error.message || "Failed to update");
        }
        return { success: false, error: error.message };
      }
    },
    [data, setData, refetch],
  );

  return { optimisticUpdate };
}
