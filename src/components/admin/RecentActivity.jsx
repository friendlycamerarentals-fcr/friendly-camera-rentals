"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  IndianRupee,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  getRecentActivityViewState,
  startRecentActivityPolling,
} from "@/lib/recentActivityPresentation";

const ACTIVITY_ICONS = {
  rental_booking: Camera,
  testimonial_pending: Star,
  sell_request: IndianRupee,
  product_sold: ShoppingBag,
};

function formatRelativeTime(timestamp) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return "Just now";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays === 1) return "Yesterday";
  return `${elapsedDays} days ago`;
}

function ActivitySkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-label="Loading recent activity">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[72px] animate-pulse rounded-2xl bg-white/5"
        />
      ))}
    </div>
  );
}

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestRef = useRef(null);
  const requestSequenceRef = useRef(0);
  const viewState = getRecentActivityViewState({
    loading,
    error,
    activities,
  });

  const fetchActivities = useCallback(async () => {
    if (
      document.visibilityState === "hidden" ||
      requestRef.current !== null
    ) {
      return;
    }

    const controller = new AbortController();
    const requestSequence = ++requestSequenceRef.current;
    requestRef.current = controller;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard/activity", {
        cache: "no-store",
        signal: controller.signal,
      });
      const result = await response.json();

      if (!response.ok || !result.success || !Array.isArray(result.activities)) {
        throw new Error(result.message || "Failed to fetch recent activity");
      }

      if (requestSequence === requestSequenceRef.current) {
        setActivities(result.activities);
      }
    } catch (fetchError) {
      if (
        fetchError.name !== "AbortError" &&
        requestSequence === requestSequenceRef.current
      ) {
        setError("Recent activity could not be loaded.");
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        if (requestSequence === requestSequenceRef.current) {
          setLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchActivities, 0);
    const stopPolling = startRecentActivityPolling(
      fetchActivities,
      document,
      window,
      () => {
        requestSequenceRef.current += 1;
        requestRef.current?.abort();
        requestRef.current = null;
        setLoading(false);
      },
    );

    return () => {
      stopPolling();
      window.clearTimeout(initialFetch);
      requestSequenceRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [fetchActivities]);

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-8"
    >
      <h2
        id="recent-activity-heading"
        className="text-2xl font-semibold text-white"
      >
        Recent Activity
      </h2>

      {viewState === "loading" ? (
        <ActivitySkeleton />
      ) : viewState === "error" ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-zinc-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchActivities}
            className="mt-3 font-medium text-[#F5A623] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : viewState === "empty" ? (
        <p
          aria-live="polite"
          className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-zinc-400"
        >
          No recent activity yet.
        </p>
      ) : (
        <ol className="mt-6 space-y-3" aria-live="polite">
          {activities.slice(0, 10).map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Camera;
            const exactTime = new Date(activity.timestamp);

            return (
              <li
                key={activity.id}
                className="flex min-w-0 items-start gap-3 rounded-2xl bg-white/5 p-3 text-zinc-300 sm:gap-4 sm:p-4"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5A623]/10 text-[#F5A623]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {activity.title}
                  </p>
                  <p className="mt-1 break-words text-sm text-zinc-400">
                    {activity.description}
                  </p>
                  <time
                    className="mt-2 block text-xs text-zinc-500"
                    dateTime={activity.timestamp}
                    title={exactTime.toLocaleString()}
                    aria-label={`Activity occurred ${exactTime.toLocaleString()}`}
                  >
                    {formatRelativeTime(activity.timestamp)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
