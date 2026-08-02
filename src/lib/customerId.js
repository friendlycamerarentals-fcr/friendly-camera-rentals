import { query } from "@/db/query";

const CUSTOMER_ID_PREFIX = "FCR-C";
const CUSTOMER_ID_START_NUMBER = 10000;

export function parseCustomerId(customerId) {
  if (!customerId) return null;

  const match = String(customerId).match(/^FCR-C(\d+)$/i);
  if (match) {
    return Number(match[1]);
  }

  const legacyMatch = String(customerId).match(/^RCR-C(\d+)$/i);
  if (legacyMatch) {
    return Number(legacyMatch[1]);
  }

  return null;
}

export function formatCustomerId(number) {
  return `${CUSTOMER_ID_PREFIX}${number}`;
}

// Use a single SQL query instead of scanning every customer row in JavaScript.
export async function getNextCustomerId() {
  const rows = await query(
    `SELECT COALESCE(
      MAX(CAST(regexp_replace("customerId", '^[A-Za-z]+-C', '') AS INTEGER)),
      $1
    ) AS "nextNumber"
    FROM "Customer"
    WHERE "customerId" ~ '^[A-Za-z]+-C[0-9]+$'`,
    [CUSTOMER_ID_START_NUMBER],
  );

  const nextNumber =
    Number(rows[0]?.nextNumber ?? CUSTOMER_ID_START_NUMBER) + 1;
  return formatCustomerId(nextNumber);
}
