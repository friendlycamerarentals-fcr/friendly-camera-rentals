export function getNextRewardId(
  lastRewardId,
  prefix = "FCR-R",
  startNumber = 100001,
) {
  if (!lastRewardId) {
    return `${prefix}${startNumber}`;
  }

  const lastNumber = Number(lastRewardId.slice(prefix.length));
  if (!Number.isSafeInteger(lastNumber) || lastNumber < startNumber) {
    throw new Error("The latest Reward ID is invalid.");
  }

  return `${prefix}${String(lastNumber + 1).padStart(6, "0")}`;
}

export function validateManualRewardInput({
  customerRecordId,
  rewardAmount,
  generatedAt,
}) {
  if (typeof customerRecordId !== "string" || !customerRecordId.trim()) {
    return { ok: false, message: "Select an existing customer." };
  }

  const amountString = String(rewardAmount ?? "").trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(amountString)) {
    return {
      ok: false,
      message: "Enter a positive amount with no more than 2 decimal places.",
    };
  }

  const amount = Number(amountString);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "Reward amount must be greater than zero." };
  }

  if (
    typeof generatedAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(generatedAt)
  ) {
    return { ok: false, message: "Select a valid reward start date." };
  }

  const date = new Date(`${generatedAt}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== generatedAt
  ) {
    return { ok: false, message: "Select a valid reward start date." };
  }

  return { ok: true, amount };
}
