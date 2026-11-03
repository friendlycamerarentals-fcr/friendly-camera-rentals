import test from "node:test";
import assert from "node:assert/strict";
import {
  getRecentActivityViewState,
  startRecentActivityPolling,
} from "./recentActivityPresentation.js";

test("selects loading, error, empty, and success activity states", () => {
  assert.equal(
    getRecentActivityViewState({
      loading: true,
      error: "",
      activities: [],
    }),
    "loading",
  );
  assert.equal(
    getRecentActivityViewState({
      loading: false,
      error: "Fetch failed",
      activities: [],
    }),
    "error",
  );
  assert.equal(
    getRecentActivityViewState({ loading: false, error: "", activities: [] }),
    "empty",
  );
  assert.equal(
    getRecentActivityViewState({
      loading: false,
      error: "",
      activities: [{ id: "real-event" }],
    }),
    "success",
  );
});

test("polls only while visible and cleans up its interval and listener", () => {
  let visibilityListener;
  let intervalCallback;
  let intervalCleared = false;
  let listenerRemoved = false;
  let fetchCount = 0;
  let pauseCount = 0;
  const documentRef = {
    visibilityState: "visible",
    addEventListener(_type, callback) {
      visibilityListener = callback;
    },
    removeEventListener(_type, callback) {
      listenerRemoved = callback === visibilityListener;
    },
  };
  const windowRef = {
    setInterval(callback, delay) {
      assert.equal(delay, 30_000);
      intervalCallback = callback;
      return 1;
    },
    clearInterval(id) {
      intervalCleared = id === 1;
    },
  };
  const cleanup = startRecentActivityPolling(
    () => {
      fetchCount += 1;
    },
    documentRef,
    windowRef,
    () => {
      pauseCount += 1;
    },
  );

  intervalCallback();
  assert.equal(fetchCount, 1);
  documentRef.visibilityState = "hidden";
  intervalCallback();
  visibilityListener();
  assert.equal(fetchCount, 1);
  assert.equal(pauseCount, 1);
  documentRef.visibilityState = "visible";
  visibilityListener();
  assert.equal(fetchCount, 2);

  cleanup();
  assert.equal(intervalCleared, true);
  assert.equal(listenerRemoved, true);
});
