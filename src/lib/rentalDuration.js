export const DURATION_UNITS = {
  HOURS: "Hours",
  DAYS: "Days",
};

export const DURATION_LIMITS = {
  [DURATION_UNITS.HOURS]: { min: 1, max: 720 }, // up to 30 days in hours
  [DURATION_UNITS.DAYS]: { min: 1, max: 90 }, // up to 90 days
};

const WEEK_IN_DAYS = 7;

/**
 * Parse a predefined pricing key ("1hr", "3hrs", "2day", "5days", "1week")
 * into a normalized { value, unit } duration, or null when unrecognized.
 */
export function parsePricingKey(key) {
  const match = /^(\d+)\s*(hr|hrs|hour|hours|day|days|week|weeks)$/i.exec(
    String(key || "").trim(),
  );
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isInteger(value) || value <= 0) return null;
  const unitWord = match[2].toLowerCase();
  if (unitWord.startsWith("hr")) {
    return { value, unit: DURATION_UNITS.HOURS };
  }
  if (unitWord.startsWith("week")) {
    return { value: value * WEEK_IN_DAYS, unit: DURATION_UNITS.DAYS };
  }
  return { value, unit: DURATION_UNITS.DAYS };
}

/**
 * Human-readable duration, e.g. "24 Hours", "5 Days".
 */
export function formatDuration({ value, unit }) {
  const num = Number(value);
  if (!Number.isFinite(num) || !unit) return "";
  return `${num} ${unit}`;
}

/**
 * Validate a custom duration against sensible application limits.
 * Returns { ok: true, value, unit, display } or { ok: false, message }.
 */
export function validateCustomDuration(rawObject = {}) {
  const value = Number(rawObject.value);
  const unit =
    rawObject.unit === DURATION_UNITS.HOURS ? DURATION_UNITS.HOURS : DURATION_UNITS.DAYS;

  if (rawObject.value == null || !Number.isFinite(value)) {
    return { ok: false, message: "Enter a numeric custom duration." };
  }
  const limits = DURATION_LIMITS[unit];
  if (!Number.isInteger(value) || value < limits.min || value > limits.max) {
    return {
      ok: false,
      message: `Custom duration must be a whole number between ${limits.min} and ${limits.max} ${unit === DURATION_UNITS.HOURS ? "hours" : "days"}.`,
    };
  }
  return { ok: true, value, unit, display: formatDuration({ value, unit }) };
}

export function validateSharedRentalDuration(rawObject = {}) {
  if (rawObject.type === "standard") {
    const key = String(rawObject.key || "").trim();
    const parsed = parsePricingKey(key);
    if (!parsed) {
      return { ok: false, message: "Select a valid shared rental duration." };
    }
    return {
      ok: true,
      duration: {
        type: "standard",
        key,
        value: parsed.value,
        unit: parsed.unit,
        display: formatDuration(parsed),
      },
    };
  }

  if (rawObject.type === "custom") {
    if (
      ![DURATION_UNITS.HOURS, DURATION_UNITS.DAYS].includes(rawObject.customUnit)
    ) {
      return { ok: false, message: "Choose Hours or Days for the shared duration." };
    }
    const customDuration = validateCustomDuration({
      value: rawObject.customValue,
      unit: rawObject.customUnit,
    });
    if (!customDuration.ok) return customDuration;
    return {
      ok: true,
      duration: {
        type: "custom",
        value: customDuration.value,
        unit: customDuration.unit,
        display: customDuration.display,
      },
    };
  }

  return { ok: false, message: "Choose one shared rental duration." };
}

/**
 * Round monetary amounts through paise (integer) math.
 */
export function toPaise(amount) {
  return Math.round(Number(amount || 0) * 100);
}
export function fromPaise(paise) {
  return Math.round(Number(paise || 0)) / 100;
}
export function sumPaise(values = []) {
  return values.reduce((total, value) => total + toPaise(value), 0);
}

export function getDurationListingPrice(product, duration) {
  if (duration?.type !== "standard" || !duration.key) return "";
  const price = Number(product?.pricing?.[duration.key]);
  return Number.isFinite(price) && price > 0
    ? String(fromPaise(toPaise(price)))
    : "";
}

export function updatePricesForSharedDuration(items, productsById, duration) {
  return items.map((item) => ({
    ...item,
    price: item.priceCustom
      ? item.price
      : getDurationListingPrice(productsById[item.productId], duration),
  }));
}
