-- SQL-first schema change log
--
-- Workflow:
--   1. Update this file for every schema change.
--   2. Run the SQL in the Neon SQL Editor.
--   3. Keep changes idempotent where possible.
--   4. Do not use Prisma migrations.
--
-- Add new schema changes below this line.

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

