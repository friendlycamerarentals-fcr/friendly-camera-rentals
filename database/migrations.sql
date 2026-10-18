-- SQL-first schema change log
--
-- Workflow:
--   1. Update this file for every schema change.
--   2. Run the SQL in the Neon SQL Editor.
--   3. Keep changes idempotent where possible.
--   4. Do not use Prisma migrations.
--
-- Add new schema changes below this line.

CREATE TABLE IF NOT EXISTS "AdminNotification" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "message"     TEXT NOT NULL,
  "relatedId"   TEXT,
  "relatedType" TEXT,
  "read"        BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_adminnotification_read"
  ON "AdminNotification" ("read");

CREATE INDEX IF NOT EXISTS "idx_adminnotification_created_at"
  ON "AdminNotification" ("createdAt");

CREATE INDEX IF NOT EXISTS "idx_adminnotification_type"
  ON "AdminNotification" ("type");

CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "set_updated_at" ON "AdminNotification";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "AdminNotification"
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- Preserve duplicate reward history while retaining the oldest active reward.
WITH ranked_active_rewards AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "customerId" ORDER BY "createdAt" ASC, "id" ASC
  ) AS rank
  FROM "Reward"
  WHERE "status" = 'Active'
)
UPDATE "Reward" reward
SET "status" = 'Expired', "expiredDate" = COALESCE("expiredDate", NOW())
FROM ranked_active_rewards ranked
WHERE reward."id" = ranked."id" AND ranked.rank > 1;

-- Only one unconsumed reward may exist for a customer at a time.
CREATE UNIQUE INDEX IF NOT EXISTS "Reward_one_active_per_customer_idx"
  ON "Reward" ("customerId") WHERE "status" = 'Active';

-- Add reward-related columns to RentalRequest for reward application flow.
ALTER TABLE "RentalRequest"
  ADD COLUMN IF NOT EXISTS "rewardId" TEXT;

ALTER TABLE "RentalRequest"
  ADD COLUMN IF NOT EXISTS "rewardDiscount" DOUBLE PRECISION;

-- Ensure timestamp columns always receive a default for new rows.
ALTER TABLE "RentalRequest"
  ALTER COLUMN "createdAt" SET DEFAULT now();

ALTER TABLE "RentalRequest"
  ALTER COLUMN "updatedAt" SET DEFAULT now();

UPDATE "RentalRequest"
SET "createdAt" = COALESCE("createdAt", NOW()),
    "updatedAt" = COALESCE("updatedAt", NOW())
WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;

-- Preserve the base rent separately from the final payable amount. Existing
-- reward-applied rows can be reconstructed from the paired stored discount.
ALTER TABLE "RentalRequest" ADD COLUMN IF NOT EXISTS "originalAmount" DOUBLE PRECISION;
ALTER TABLE "RentalRequest" ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "RentalRequest" ADD COLUMN IF NOT EXISTS "advanceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "RentalRequest"
SET "originalAmount" = "totalAmount" + COALESCE("rewardDiscount", 0)
WHERE "originalAmount" IS NULL;

-- Reclassify only legacy confirmation-time redemptions with exact audit links.
-- The old confirmation handler wrote usedDate and appliedDate together.
UPDATE "Reward" reward
SET "status" = 'Applied',
    "usedDate" = NULL
FROM "RentalRequest" rental
WHERE reward."status" = 'Used'
  AND reward."appliedRentalId" = rental."requestId"
  AND reward."rewardId" = rental."rewardId"
  AND reward."appliedDate" IS NOT NULL
  AND reward."usedDate" = reward."appliedDate"
  AND rental."status" IN ('Pending', 'Confirmed', 'Approved', 'Picked Up', 'Returned')
  AND NOT EXISTS (
    SELECT 1 FROM "Reward" other_reward
    WHERE other_reward."customerId" = reward."customerId"
      AND other_reward."id" <> reward."id"
      AND other_reward."status" IN ('Active', 'Applied')
  );

-- Release matching legacy reservations for cancelled/rejected rentals.
UPDATE "Reward" reward
SET "status" = CASE WHEN reward."expireDate" >= NOW() THEN 'Active' ELSE 'Expired' END,
    "appliedRentalId" = NULL,
    "usedDate" = NULL,
    "expiredDate" = CASE
      WHEN reward."expireDate" < NOW() THEN COALESCE(reward."expiredDate", NOW())
      ELSE NULL
    END
FROM "RentalRequest" rental
WHERE reward."status" = 'Used'
  AND reward."appliedRentalId" = rental."requestId"
  AND reward."rewardId" = rental."rewardId"
  AND reward."appliedDate" IS NOT NULL
  AND reward."usedDate" = reward."appliedDate"
  AND rental."status" IN ('Cancelled', 'Rejected')
  AND (
    reward."expireDate" < NOW()
    OR NOT EXISTS (
      SELECT 1 FROM "Reward" other_reward
      WHERE other_reward."customerId" = reward."customerId"
        AND other_reward."id" <> reward."id"
        AND other_reward."status" IN ('Active', 'Applied')
    )
  );

-- Enforce at most one available or reserved reward per customer when the
-- existing data permits it; otherwise leave duplicates for manual review.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Reward"
    WHERE "status" IN ('Active', 'Applied')
    GROUP BY "customerId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Skipped reward reservation index: duplicate Active/Applied rewards require review.';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS "Reward_one_unconsumed_per_customer_idx"
      ON "Reward" ("customerId")
      WHERE "status" IN ('Active', 'Applied');
  END IF;
END $$;

-- Used rewards with incomplete or mismatched rental links are intentionally
-- left unchanged for manual review.

