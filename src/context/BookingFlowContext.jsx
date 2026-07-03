"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const BookingFlowContext = createContext(null);

export function BookingFlowProvider({ children }) {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [restoreCartAfterProfile, setRestoreCartAfterProfile] = useState(false);

  const openCart = useCallback(() => {
    setIsCartVisible(true);
    setIsProfileVisible(false);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartVisible(false);
  }, []);

  const openProfile = useCallback((options = {}) => {
    const { restoreCartAfterProfile: restoreCart = false, pending = false } =
      options;

    setIsCartVisible(false);
    setIsProfileVisible(true);
    setRestoreCartAfterProfile(restoreCart);
    setPendingBooking(Boolean(pending));
  }, []);

  const closeProfile = useCallback(() => {
    const shouldRestoreCart = restoreCartAfterProfile;
    setIsProfileVisible(false);
    setIsCartVisible(shouldRestoreCart);
    setRestoreCartAfterProfile(false);
  }, [restoreCartAfterProfile]);

  const beginPendingBooking = useCallback((options = {}) => {
    const { restoreCartAfterProfile: restoreCart = false } = options;
    setPendingBooking(true);
    setRestoreCartAfterProfile(restoreCart);
  }, []);

  const clearPendingBooking = useCallback(() => {
    setPendingBooking(false);
    setRestoreCartAfterProfile(false);
  }, []);

  const completePendingBooking = useCallback(() => {
    setPendingBooking(false);
    setRestoreCartAfterProfile(false);
    setIsProfileVisible(false);
    setIsCartVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      isCartVisible,
      isProfileVisible,
      pendingBooking,
      restoreCartAfterProfile,
      openCart,
      closeCart,
      openProfile,
      closeProfile,
      beginPendingBooking,
      clearPendingBooking,
      completePendingBooking,
    }),
    [
      isCartVisible,
      isProfileVisible,
      pendingBooking,
      restoreCartAfterProfile,
      openCart,
      closeCart,
      openProfile,
      closeProfile,
      beginPendingBooking,
      clearPendingBooking,
      completePendingBooking,
    ],
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);

  if (!context) {
    throw new Error("useBookingFlow must be used within a BookingFlowProvider");
  }

  return context;
}
