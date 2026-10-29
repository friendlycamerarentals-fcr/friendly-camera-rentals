"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { auth } from "@/lib/firebase";
import { fetchJsonWithCache, invalidateCachePrefix } from "@/lib/dataCache";

const AuthContext = createContext();
const AUTH_REQUEST_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AUTH_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const profileRef = useRef(null);
  const profileEmailRef = useRef(null);
  const inFlightProfileRequestsRef = useRef(new Map());
  const loginInFlightRef = useRef(false);
  const authUserKeyRef = useRef(null);
  const syncedCustomerEmailRef = useRef(null);
  const syncCustomerInFlightRef = useRef(null);

  const clearProfileState = useCallback(() => {
    profileRef.current = null;
    profileEmailRef.current = null;
    syncedCustomerEmailRef.current = null;
    syncCustomerInFlightRef.current = null;
    authUserKeyRef.current = null;
    setProfile(null);
    setProfileLoading(false);
    setProfileError(null);
  }, []);

  const loadProfile = useCallback(
    async (userEmail, options = {}) => {
      const { force = false } = options;

      if (!userEmail) {
        clearProfileState();
        return null;
      }

      const normalizedEmail = userEmail.toLowerCase();
      const cachedProfile = profileRef.current;
      const cachedEmail = profileEmailRef.current;

      if (!force && cachedProfile && cachedEmail === normalizedEmail) {
        return cachedProfile;
      }

      const inFlightRequest =
        inFlightProfileRequestsRef.current.get(normalizedEmail);
      if (!force && inFlightRequest) {
        return inFlightRequest;
      }

      setProfileLoading(true);
      setProfileError(null);

      const requestPromise = (async () => {
        try {
          const apiUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/api/profile`
              : "/api/profile";

          for (let attempt = 1; attempt <= 2; attempt += 1) {
            const controller = new AbortController();
            const timeoutId = setTimeout(
              () => controller.abort(),
              AUTH_REQUEST_TIMEOUT_MS,
            );

            try {
              const result = await fetchJsonWithCache(
                apiUrl,
                {
                  signal: controller.signal,
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-email": userEmail,
                  },
                },
                {
                  cacheKey: `/api/profile:${normalizedEmail}`,
                  ttlMs: 60_000,
                },
              );

              if (result.ok) {
                const payload = result.data;
                if (
                  payload?.success &&
                  payload.data &&
                  typeof payload.data === "object" &&
                  payload.data.customerId &&
                  payload.data.email
                ) {
                  const nextProfile = payload.data || null;
                  profileRef.current = nextProfile;
                  profileEmailRef.current = nextProfile?.email
                    ? nextProfile.email.toLowerCase()
                    : normalizedEmail;
                  setProfile(nextProfile);
                  return nextProfile;
                }

                console.error("[AUTH_PROFILE_LOAD]", {
                  outcome: "missing_customer_data",
                  attempt,
                });
                break;
              }

              console.error("[AUTH_PROFILE_LOAD]", {
                outcome: "http_error",
                status: result.status,
                attempt,
              });
              if (result.status < 500 && result.status !== 0) break;
            } finally {
              clearTimeout(timeoutId);
            }
          }
        } catch (error) {
          console.error("[AUTH_PROFILE_LOAD]", {
            outcome: "request_error",
            errorName: error.name,
          });
        }

        clearProfileState();
        setProfileError("Unable to load your saved customer profile.");
        return null;
      })();

      inFlightProfileRequestsRef.current.set(normalizedEmail, requestPromise);

      try {
        return await requestPromise;
      } finally {
        inFlightProfileRequestsRef.current.delete(normalizedEmail);
        setProfileLoading(false);
      }
    },
    [clearProfileState],
  );

  const syncCustomer = useCallback(async (userToSync) => {
    if (!userToSync?.email) return null;

    const normalizedEmail = userToSync.email.toLowerCase();

    if (syncedCustomerEmailRef.current === normalizedEmail) {
      return profileRef.current;
    }

    if (syncCustomerInFlightRef.current?.email === normalizedEmail) {
      return syncCustomerInFlightRef.current.promise;
    }

    const syncPromise = (async () => {
      const apiUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/customers`
          : "/api/customers";

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          const response = await fetchWithTimeout(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: userToSync.displayName || "Customer",
              email: userToSync.email,
              profileImage: userToSync.photoURL || "",
            }),
          });

          if (!response.ok) {
            console.error("[AUTH_CUSTOMER_SYNC]", {
              outcome: "http_error",
              status: response.status,
              attempt,
            });
            if (response.status < 500 || attempt === 2) return null;
            continue;
          }

          const result = await response.json();
          if (result?.success && result.data?.id && result.data?.customerId) {
            syncedCustomerEmailRef.current = normalizedEmail;
            invalidateCachePrefix("/api/profile");
            invalidateCachePrefix("/api/customers");
            return result.data;
          }

          console.error("[AUTH_CUSTOMER_SYNC]", {
            outcome: "invalid_response",
            status: response.status,
            success: result?.success === true,
            attempt,
          });
          return null;
        } catch (error) {
          console.error("[AUTH_CUSTOMER_SYNC]", {
            outcome: error.name === "AbortError" ? "timeout" : "request_error",
            errorName: error.name,
            attempt,
          });
          if (attempt === 2) return null;
        }
      }

      return null;
    })();

    syncCustomerInFlightRef.current = {
      email: normalizedEmail,
      promise: syncPromise,
    };

    return syncPromise;
  }, []);

  const login = async () => {
    if (loginInFlightRef.current) {
      throw new Error("Login already in progress");
    }

    loginInFlightRef.current = true;

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const customer = await syncCustomer(user);
      if (!customer) {
        const error = new Error(
          "We could not finish setting up your customer account. Please try again.",
        );
        error.code = "customer-sync-failed";
        throw error;
      }

      const loadedProfile = await loadProfile(user.email, { force: true });
      if (!loadedProfile) {
        const error = new Error(
          "We could not load your customer profile. Please try again.",
        );
        error.code = "profile-load-failed";
        throw error;
      }

      return result;
    } catch (error) {
      if (error.code === "auth/cancelled-popup-request") {
        console.warn("Login popup cancelled or already in progress");
      } else {
        console.error("Google Login Error:", error);
      }
      throw error;
    } finally {
      loginInFlightRef.current = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      clearProfileState();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      const nextUserKey = nextUser?.uid || nextUser?.email || "signed-out";

      if (authUserKeyRef.current === nextUserKey) {
        setLoading(false);
        return;
      }

      authUserKeyRef.current = nextUserKey;
      setUser(nextUser);

      if (nextUser) {
        const customer = await syncCustomer(nextUser);
        if (customer) {
          await loadProfile(nextUser.email, { force: false });
        } else {
          console.error("[AUTH_STATE_SYNC]", {
            outcome: "customer_sync_failed",
          });
        }
      } else {
        clearProfileState();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clearProfileState, loadProfile, syncCustomer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileComplete: Boolean(
          profile?.name?.trim() &&
          profile?.phoneNumber?.trim() &&
          profile?.address?.trim(),
        ),
        loading,
        profileLoading,
        profileError,
        login,
        logout,
        loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
