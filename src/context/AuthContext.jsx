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
} from "react";

import { auth } from "@/lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userEmail) => {
    if (!userEmail) return null;

    setProfileLoading(true);
    try {
      const apiUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/profile`
          : "/api/profile";

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          "x-user-email": userEmail,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Profile load HTTP error:", response.status);
        setProfile(null);
        return null;
      }

      const result = await response.json();
      if (result && result.success) {
        setProfile(result.data);
        return result.data;
      }
    } catch (error) {
      console.error("Profile load failed:", error);
    } finally {
      setProfileLoading(false);
    }
    setProfile(null);
    return null;
  }, []);

  const syncCustomer = useCallback(async (userToSync) => {
    if (!userToSync?.email) return null;

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
      return result && result.success ? result.data : null;
    } catch (error) {
      console.error("Customer sync failed:", error);
      return null;
    }
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      // Create / Update Customer
      await syncCustomer(user);

      await loadProfile(user.email);
      return result;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await syncCustomer(user);
        await loadProfile(user.email);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile, syncCustomer]);

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
