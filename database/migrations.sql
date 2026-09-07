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

