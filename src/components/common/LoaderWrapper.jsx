"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashLoader from "./SplashLoader";

const SESSION_KEY = "fcr-splash-shown";

export default function LoaderWrapper({ children }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);

    if (alreadyShown) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "true");
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <AnimatePresence>
        <SplashLoader />
      </AnimatePresence>
    );
  }

  return children;
}
