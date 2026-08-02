import test from "node:test";
import assert from "node:assert/strict";
import { getHeroMarqueeVisibilityState } from "./heroMarqueeVisibility.js";

test("shows the marquee when enabled and items exist", () => {
  const state = getHeroMarqueeVisibilityState({
    settings: { isEnabled: true },
    items: [{ id: "1", text: "Hello" }],
  });

  assert.equal(state.isVisible, true);
  assert.equal(state.reason, "visible");
});

test("hides the marquee when disabled", () => {
  const state = getHeroMarqueeVisibilityState({
    settings: { isEnabled: false },
    items: [{ id: "1", text: "Hello" }],
  });

  assert.equal(state.isVisible, false);
  assert.equal(state.reason, "disabled");
});

test("hides the marquee when there are no items", () => {
  const state = getHeroMarqueeVisibilityState({
    settings: { isEnabled: true },
    items: [],
  });

  assert.equal(state.isVisible, false);
  assert.equal(state.reason, "empty");
});
