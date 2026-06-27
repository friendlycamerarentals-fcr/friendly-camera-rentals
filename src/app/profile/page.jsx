"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, profileLoading, loadProfile } = useAuth();
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
    if (user?.email) {
      loadProfile(user.email);
    }
  }, [user?.email, loadProfile]);

  useEffect(() => {
    const nextFormData = {
      fullName: profile?.name || "",
      email: user?.email || "",
      phoneNumber: profile?.phoneNumber || "",
      address: profile?.address || "",
      customerId: profile?.customerId || "",
    };

    const frameId = window.requestAnimationFrame(() => {
      setFormData(nextFormData);
      setSavedProfile(nextFormData);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [profile, user?.email]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCancel = () => {
    setFormData(savedProfile);
  };

  const hasChanges =
    formData.fullName !== savedProfile.fullName ||
    formData.phoneNumber !== savedProfile.phoneNumber ||
    formData.address !== savedProfile.address;

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

      const refreshedProfile = await loadProfile(user.email);
      const nextFormData = {
        fullName: refreshedProfile?.name || formData.fullName.trim(),
        email: user.email || "",
        phoneNumber: refreshedProfile?.phoneNumber || "",
        address: refreshedProfile?.address || "",
        customerId: refreshedProfile?.customerId || formData.customerId || "",
      };

      setFormData(nextFormData);
      setSavedProfile(nextFormData);
      toast.success("Profile updated successfully.");

      const pending = localStorage.getItem("fcr-pending-booking");
      if (pending) {
        localStorage.removeItem("fcr-pending-booking");
        window.dispatchEvent(new Event("resume-pending-booking"));
        router.push("/");
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
          <div className="mb-8 space-y-2 text-center sm:text-left">
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
