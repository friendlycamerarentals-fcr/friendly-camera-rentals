export const PACKAGE_INCLUDES_LIMITS = Object.freeze({
  maxItems: 30,
  maxNameLength: 80,
  minQuantity: 1,
  maxQuantity: 99,
});

const {
  maxItems: MAX_ITEMS,
  maxNameLength: MAX_NAME_LENGTH,
  minQuantity: MIN_QUANTITY,
  maxQuantity: MAX_QUANTITY,
} = PACKAGE_INCLUDES_LIMITS;

const parsePackageIncludes = (input) => {
  if (input == null) {
    return { valid: true, items: [] };
  }

  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      return {
        valid: false,
        errors: ["Package includes must be a valid JSON array."],
      };
    }

    if (input == null) {
      return { valid: true, items: [] };
    }
  }

  if (!Array.isArray(input)) {
    return {
      valid: false,
      errors: ["Package includes must be an array."],
    };
  }

  return { valid: true, items: input };
};

const toQuantity = (value) => {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return MIN_QUANTITY;
  }

  let numericValue;
  try {
    numericValue = Number(value);
  } catch {
    return MIN_QUANTITY;
  }

  if (!Number.isFinite(numericValue)) {
    return MIN_QUANTITY;
  }

  return Math.min(
    MAX_QUANTITY,
    Math.max(MIN_QUANTITY, Math.trunc(numericValue)),
  );
};

export function normalizePackageIncludes(input) {
  const parsed = parsePackageIncludes(input);
  if (!parsed.valid) {
    return [];
  }

  const normalized = [];
  const itemsByName = new Map();

  for (const item of parsed.items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const name =
      typeof item.name === "string"
        ? item.name.trim().slice(0, MAX_NAME_LENGTH)
        : "";
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    const quantity = toQuantity(item.quantity);
    const existing = itemsByName.get(key);

    if (existing) {
      existing.quantity = Math.min(
        MAX_QUANTITY,
        existing.quantity + quantity,
      );
    } else if (normalized.length < MAX_ITEMS) {
      const entry = { name, quantity };
      normalized.push(entry);
      itemsByName.set(key, entry);
    }
  }

  return normalized;
}

export function validatePackageIncludes(input) {
  const parsed = parsePackageIncludes(input);
  if (!parsed.valid) {
    return { valid: false, errors: parsed.errors };
  }

  const errors = [];
  const uniqueNames = new Set();

  parsed.items.forEach((item, index) => {
    const itemNumber = index + 1;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`Item ${itemNumber} must be an object.`);
      return;
    }

    if (typeof item.name !== "string") {
      errors.push(`Item ${itemNumber} name must be text.`);
      return;
    }

    const name = item.name.trim();
    if (!name) {
      return;
    }

    if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Item ${itemNumber} name cannot exceed ${MAX_NAME_LENGTH} characters.`);
    }
    uniqueNames.add(name.toLowerCase());

    const rawQuantity = item.quantity;
    if (
      rawQuantity == null ||
      (typeof rawQuantity === "string" && rawQuantity.trim() === "")
    ) {
      return;
    }

    let quantity;
    try {
      quantity = Number(rawQuantity);
    } catch {
      quantity = Number.NaN;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < MIN_QUANTITY ||
      quantity > MAX_QUANTITY
    ) {
      errors.push(
        `Item ${itemNumber} quantity must be a whole number from ${MIN_QUANTITY} to ${MAX_QUANTITY}.`,
      );
    }
  });

  if (uniqueNames.size > MAX_ITEMS) {
    errors.push(`Package includes cannot contain more than ${MAX_ITEMS} unique items.`);
  }

  return { valid: errors.length === 0, errors };
}

export function mergePackageIncludes(existingValue, body) {
  if (Object.hasOwn(body || {}, "packageIncludes")) {
    return normalizePackageIncludes(body.packageIncludes);
  }

  return existingValue;
}
