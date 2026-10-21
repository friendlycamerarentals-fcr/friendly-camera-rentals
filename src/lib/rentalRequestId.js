import { query } from "@/db/query";

/**
 * Generate the next FCR-R###### rental request ID.
 *
 * Recent request IDs are inspected so manually generated IDs from before the
 * sequence-based totals are never collided with. Safe against duplicates via
 * the unique constraint on "RentalRequest"."requestId" plus per-thread use.
 */
export function buildRequestId(idNumber) {
  return `FCR-R${String(idNumber).padStart(6, "0")}`;
}

export async function generateNextRequestId() {
  const requestRows = await query(
    `SELECT "requestId" FROM "RentalRequest" WHERE "requestId" LIKE 'FCR-R%' ORDER BY "requestId" DESC LIMIT 50`,
  );

  const numericSequences = requestRows
    .map((item) => String(item.requestId).match(/^FCR-R(\d{6})$/)?.[1])
    .filter(Boolean)
    .map(Number);

  const lastSequence = numericSequences.length ? Math.max(...numericSequences) : NaN;
  const nextSequence = Number.isInteger(lastSequence)
    ? Math.max(lastSequence + 1, 100001)
    : 100001;

  return buildRequestId(nextSequence);
}
