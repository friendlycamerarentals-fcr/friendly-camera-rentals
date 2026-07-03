"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBookingFlow } from "@/context/BookingFlowContext";

const fieldCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white " +
  "placeholder:text-zinc-500 outline-none transition-colors duration-200 " +
  "focus:border-amber-400/60 focus:bg-white/8 hover:border-white/20";

const initialFormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  address: "",
  customerId: "",
};

const PROFILE_DRAFT_KEY = "fcr-profile-draft";
const PROFILE_REDIRECT_SOURCE_KEY = "fcr-profile-redirect-source";

const readDraftProfile = () => {
  if (typeof window === "undefined") return null;

  try {
    const savedDraft = window.sessionStorage.getItem(PROFILE_DRAFT_KEY);
    return savedDraft ? JSON.parse(savedDraft) : null;
  } catch {
    return null;
  }
};

const persistDraftProfile = (data) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(data));
};

const clearDraftProfile = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_DRAFT_KEY);
};

const clearPendingRedirect = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("fcr-pending-booking");
  window.sessionStorage.removeItem(PROFILE_REDIRECT_SOURCE_KEY);
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, profileLoading, loadProfile } = useAuth();
  const { closeProfile } = useBookingFlow();
  const [formData, setFormData] = useState(initialFormState);
  const [savedProfile, setSavedProfile] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.email) return;

    const hasLoadedProfile = Boolean(
      profile?.email && profile.email === user.email,
    );

    if (!hasLoadedProfile) {
      loadProfile(user.email);
    }
  }, [loadProfile, profile?.email, user?.email]);

  useEffect(() => {
    const savedDraft = readDraftProfile();
    if (savedDraft) {
      window.requestAnimationFrame(() => {
        setFormData(savedDraft);
        setSavedProfile(savedDraft);
      });
      return;
    }

    const nextFormData = {
      fullName: profile?.name || "",
      email: user?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
      customerId: profile?.customerId || "",
    };

    const frameId = window.requestAnimationFrame(() => {
      setFormData((prev) =>
        prev.fullName === nextFormData.fullName &&
        prev.phoneNumber === nextFormData.phoneNumber &&
        prev.address === nextFormData.address &&
        prev.customerId === nextFormData.customerId
          ? prev
          : nextFormData,
      );
      setSavedProfile((prev) =>
        prev.fullName === nextFormData.fullName &&
        prev.phoneNumber === nextFormData.phoneNumber &&
        prev.address === nextFormData.address &&
        prev.customerId === nextFormData.customerId
          ? prev
          : nextFormData,
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [
    profile?.name,
    profile?.phoneNumber,
    profile?.address,
    profile?.customerId,
    user?.email,
  ]);

  const handleChange = (field) => (e) => {
    const nextValue = e.target.value;
    setFormData((prev) => {
      const nextData = { ...prev, [field]: nextValue };
      persistDraftProfile(nextData);
      return nextData;
    });
  };

  const handleClose = () => {
    clearPendingRedirect();
    closeProfile();

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleCancel = () => {
    setFormData(savedProfile);
    persistDraftProfile(savedProfile);
  };

  const hasChanges = useMemo(
    () =>
      formData.fullName !== savedProfile.fullName ||
      formData.phoneNumber !== savedProfile.phoneNumber ||
      formData.address !== savedProfile.address,
    [
      formData.address,
      formData.fullName,
      formData.phoneNumber,
      savedProfile.address,
      savedProfile.fullName,
      savedProfile.phoneNumber,
    ],
  );

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required.");
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required.");
      return;
    }
    if (!user?.email) {
      toast.error("Please log in first.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email,
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save profile.");
      }

      const refreshedProfile = await loadProfile(user.email, { force: true });
      const nextFormData = {
        fullName: refreshedProfile?.name || formData.fullName.trim(),
        email: user.email || "",
        phoneNumber: refreshedProfile?.phoneNumber || "",
        address: refreshedProfile?.address || "",
        customerId: refreshedProfile?.customerId || formData.customerId || "",
      };

      setFormData(nextFormData);
      setSavedProfile(nextFormData);
      clearDraftProfile();
      toast.success("Profile updated successfully.");

      const pending = localStorage.getItem("fcr-pending-booking");
      if (pending) {
        clearPendingRedirect();
        closeProfile();
        window.dispatchEvent(new Event("resume-pending-booking"));

        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <main className="min-h-[70vh] px-4 py-16 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl justify-center">
        <div className="w-full rounded-2xl border border-white/10 bg-black/60 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-sm uppercase tracking-[0.35em] text-[#F5A623]">
                Account Settings
              </p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Your Profile
              </h1>
              <p className="text-sm text-zinc-400 sm:text-base">
                Keep your account details up to date for rentals and bookings.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close profile"
              className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">
                Customer ID
              </label>
              <input
                type="text"
                value={formData.customerId}
                readOnly
                className={`${fieldCls} cursor-not-allowed bg-white/5 text-zinc-400`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                placeholder="Enter your full name"
                className={fieldCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                placeholder="Your Google email"
                className={`${fieldCls} cursor-not-allowed bg-white/5 text-zinc-400`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                placeholder="10-digit mobile number"
                className={fieldCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-400">
                Address
              </label>
              <textarea
                rows={4}
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="Enter your current or permanent address"
                className={`${fieldCls} resize-none`}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="rounded-2xl bg-[#F5A623] px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
