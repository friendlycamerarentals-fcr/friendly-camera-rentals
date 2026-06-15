"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import SplashLoader from "./SplashLoader";

export default function LoaderWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <SplashLoader />}</AnimatePresence>

      {!loading && children}
    </>
  );
}
