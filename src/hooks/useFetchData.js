import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const { immediate = true, onSuccess = null, onError = null } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(
    async (showLoadingState = true) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        if (showLoadingState) {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success || Array.isArray(result.data)) {
          const newData = Array.isArray(result.data)
            ? result.data
            : result.data || [];
          setData(newData);

          if (onSuccess) {
            onSuccess(newData);
          }
        } else {
          throw new Error(result.message || "Failed to fetch data");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          if (onError) {
            onError(err);
          }
        }
      } finally {
        if (showLoadingState) {
          setLoading(false);
        }
      }
    },
    [url, onSuccess, onError],
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

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData, // For optimistic updates
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

    if (refetch) {
      if (refetchDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, refetchDelay));
      }
      await refetch(false); // false = don't show loading state
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
      // Optimistic update
      const previousData = data;
      setData(updateFn(data));

      // Sync with server
      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Revert on error
          setData(previousData);
          throw new Error(result.message || "Operation failed");
        }

        // Refetch to ensure consistency
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
        // Already reverted, just show error
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
