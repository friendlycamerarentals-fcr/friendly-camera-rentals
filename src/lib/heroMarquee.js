export const heroMarqueeSelectColumns = [
  '"id"',
  '"text"',
  '"isActive"',
  '"display_order"',
  '"createdAt"',
  '"updatedAt"',
];

export const heroMarqueeSettingsSelectColumns = [
  '"id"',
  '"isEnabled"',
  '"createdAt"',
  '"updatedAt"',
];

export const normalizeHeroMarqueeText = (value = "") =>
  value.replace(/\s+/g, " ").trim();
