"use client";

import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { X, Mail } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ open, onClose, onLoginSuccess }) {
  const { login } = useAuth();

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogin = async () => {
    try {
      const result = await login();
      // ensure any pending booking flow resumes
      onLoginSuccess?.(result?.user || null);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        /* Backdrop */
        <motion.div
          key="login-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0 }}
          className="z-[1000] flex min-h-screen w-screen items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border-[#F5A623]/50 border bg-zinc-950  shadow-[0_0_60px_rgba(245,166,35,0.15)]"
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Login to FCR</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="cursor-pointer rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="mb-7 text-sm text-zinc-400">
                Sign in to manage rentals and bookings.
              </p>

              {/* Google */}
              <button
                onClick={handleLogin}
                className="mb-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white py-4 font-medium text-black shadow-md transition hover:bg-zinc-100 active:scale-[0.98]"
              >
                <FcGoogle size={22} />
                Continue with Google
              </button>

              {/* Email coming soon */}
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-white/10 py-4 text-sm text-zinc-500"
              >
                <Mail size={18} />
                Login with Email and Password (Coming Soon)
              </button>

              {/* Footer */}
              <p className="mt-6 text-center text-xs text-zinc-600">
                By continuing, you agree to our{" "}
                <span className="cursor-pointer text-zinc-400 underline underline-offset-2 transition hover:text-white">
                  Terms
                </span>{" "}
                &amp;{" "}
                <span className="cursor-pointer text-zinc-400 underline underline-offset-2 transition hover:text-white">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
