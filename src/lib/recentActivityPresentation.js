export function getRecentActivityViewState({ loading, error, activities }) {
  if (loading) return "loading";
  if (error) return "error";
  return activities.length === 0 ? "empty" : "success";
}

export function startRecentActivityPolling(
  fetchActivities,
  documentRef,
  windowRef,
  pauseActivities,
) {
  const poll = () => {
    if (documentRef.visibilityState === "visible") {
      fetchActivities();
    }
  };
  const handleVisibilityChange = () => {
    if (documentRef.visibilityState === "visible") {
      fetchActivities();
    } else {
      pauseActivities?.();
    }
  };
  const interval = windowRef.setInterval(poll, 30_000);
  documentRef.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    windowRef.clearInterval(interval);
    documentRef.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
