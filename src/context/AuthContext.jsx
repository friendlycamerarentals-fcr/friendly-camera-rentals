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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
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

      const requestPromise = (async () => {
        try {
          const apiUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/api/profile`
              : "/api/profile";

          const result = await fetchJsonWithCache(
            apiUrl,
            {
              headers: {
                "Content-Type": "application/json",
                "x-user-email": userEmail,
              },
            },
            { cacheKey: `/api/profile:${normalizedEmail}`, ttlMs: 60_000 },
          );

          if (!result.ok) {
            console.error("Profile load HTTP error:", result.status);
            clearProfileState();
            return null;
          }

          const payload = result.data;
          if (payload && payload.success) {
            const nextProfile = payload.data || null;
            profileRef.current = nextProfile;
            profileEmailRef.current = nextProfile?.email
              ? nextProfile.email.toLowerCase()
              : normalizedEmail;
            setProfile(nextProfile);
            return nextProfile;
          }
        } catch (error) {
          console.error("Profile load failed:", error);
        }

        clearProfileState();
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
      try {
        const apiUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/api/customers`
            : "/api/customers";

        const response = await fetch(apiUrl, {
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
          console.error("Customer sync HTTP error:", response.status);
          return null;
        }

        const result = await response.json();
        if (result && result.success) {
          syncedCustomerEmailRef.current = normalizedEmail;
          invalidateCachePrefix("/api/profile");
          return result.data;
        }

        return null;
      } catch (error) {
        console.error("Customer sync failed:", error);
        return null;
      } finally {
        if (syncCustomerInFlightRef.current?.email === normalizedEmail) {
          syncCustomerInFlightRef.current = null;
        }
      }
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

      // Create / Update Customer
      await syncCustomer(user);

      await loadProfile(user.email, { force: true });
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
        await syncCustomer(nextUser);
        await loadProfile(nextUser.email, { force: false });
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
