export function getHeroMarqueeVisibilityState({ settings = {}, items = [] }) {
  const isEnabled = settings?.isEnabled !== false;
  const activeItems = (items || []).filter((item) => item?.isActive !== false);

  if (!isEnabled) {
    return { isVisible: false, reason: "disabled" };
  }

  if (!activeItems.length) {
    return { isVisible: false, reason: "empty" };
  }

  return { isVisible: true, reason: "visible" };
}
