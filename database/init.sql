-- ============================================================================
-- FCR_DATABASE.sql
-- Single source of truth for the FCR (camera rentals) PostgreSQL schema.
--
-- WORKFLOW (read this every time you make a change):
--   1. Add new SQL to the bottom of SECTION 7 in this file (never edit history).
--   2. Run the new SQL manually in the Neon SQL Editor.
--   3. Apply this SQL file to your PostgreSQL database.
--   4. Commit this SQL file with your app changes.
--
-- Every statement here is written to be safely re-run (idempotent):
--   - CREATE TABLE ... IF NOT EXISTS
--   - CREATE INDEX ... IF NOT EXISTS
--   - ADD COLUMN ... IF NOT EXISTS
--   - Constraints added via DO $$ ... $$ guards that check pg_constraint first
--   - No DROP TABLE / TRUNCATE / DELETE anywhere in this file, ever.
--
-- IMPORTANT NOTE ON IDs (read before running on a DB that already has data):
--   The original schema used generated defaults such as cuid() in application
--   code, which are not available in plain PostgreSQL. To make the database
--   the real source of truth, this script gives each
--   `id` column a genuine DB-side default: gen_random_uuid() (via pgcrypto).
--   This does NOT touch any existing rows or existing cuid-format ids --
--   it only applies to rows inserted after this script runs. Existing rows
--   keep their existing cuid strings and continue to work normally, because
--   the column type is still TEXT, not the native UUID type.
-- ============================================================================


-- ============================================================================
-- SECTION 1: DATABASE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RentalProduct
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "RentalProduct" (
    "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name"           TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "category"       TEXT NOT NULL,
    "brand"          TEXT NOT NULL,
    "model"          TEXT NOT NULL,
    "description"    TEXT,
    "megapixels"     TEXT,
    "batteries"      INTEGER NOT NULL DEFAULT 0,
    "available"      BOOLEAN NOT NULL DEFAULT TRUE,
    "image"          TEXT,
    "images"         JSONB,
    "pricing"        JSONB,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "rentalPrice"    JSONB,
    "specifications" JSONB,
    "display_order"  INTEGER NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- BuyProduct
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "BuyProduct" (
    "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name"           TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "brand"          TEXT NOT NULL,
    "model"          TEXT NOT NULL,
    "category"       TEXT NOT NULL,
    "condition"      TEXT,
    "warranty"       TEXT,
    "status"         TEXT NOT NULL DEFAULT 'In Stock',
    "description"    TEXT,
    "image"          TEXT,
    "images"         JSONB,
    "price"          DOUBLE PRECISION NOT NULL,
    "discountPrice"  DOUBLE PRECISION,
    "specifications" JSONB,
    "accessories"    JSONB,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "display_order"  INTEGER NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- SellRequest
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SellRequest" (
    "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName"       TEXT NOT NULL,
    "mobile"         TEXT NOT NULL,
    "email"          TEXT,
    "city"           TEXT NOT NULL,
    "category"       TEXT NOT NULL,
    "brand"          TEXT NOT NULL,
    "model"          TEXT NOT NULL,
    "purchaseYear"   TEXT,
    "warrantyStatus" TEXT,
    "expectedPrice"  DOUBLE PRECISION,
    "condition"      TEXT NOT NULL,
    "accessories"    TEXT,
    "description"    TEXT,
    "images"         JSONB,
    "status"         TEXT NOT NULL DEFAULT 'pending',
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- ServiceBooking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "ServiceBooking" (
    "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName"    TEXT NOT NULL,
    "phone"       TEXT NOT NULL,
    "shootType"   TEXT NOT NULL,
    "eventDate"   TEXT NOT NULL,
    "eventTime"   TEXT,
    "location"    TEXT NOT NULL,
    "description" TEXT,
    "message"     TEXT,
    "notes"       TEXT,
    "status"      TEXT NOT NULL DEFAULT 'pending',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Customer
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Customer" (
    "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "customerId"   TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "profileImage" TEXT,
    "phoneNumber"  TEXT,
    "address"      TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- RentalRequest
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "RentalRequest" (
    "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "requestId"      TEXT NOT NULL,
    "customerId"     TEXT,
    "userId"         TEXT,
    "fullName"       TEXT NOT NULL,
    "email"          TEXT,
    "phone"          TEXT NOT NULL,
    "address"        TEXT,
    "productId"      TEXT NOT NULL,
    "productName"    TEXT NOT NULL,
    "productImage"   TEXT,
    "rentalDuration" TEXT NOT NULL,
    "quantity"       INTEGER NOT NULL DEFAULT 1,
    "rentalPrice"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount"    DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bookingDate"    TEXT NOT NULL,
    "pickupTime"     TEXT,
    "notes"          TEXT,
    "status"         TEXT NOT NULL DEFAULT 'Pending',
    "paymentStatus"  TEXT NOT NULL DEFAULT 'Pending',
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Testimonial
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name"        TEXT NOT NULL,
    "designation" TEXT,
    "image"       TEXT,
    "rating"      INTEGER NOT NULL DEFAULT 5,
    "review"      TEXT NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'pending',
    "featured"    BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Reward
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Reward" (
    "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "rewardId"         TEXT NOT NULL,
    "customerId"       TEXT NOT NULL,
    "customerName"     TEXT NOT NULL,
    "contactNumber"    TEXT NOT NULL,
    "rentalRequestId"  TEXT NOT NULL,
    "rentalDate"       TEXT NOT NULL,
    "rewardPercentage" INTEGER NOT NULL DEFAULT 10,
    "rewardAmount"     DOUBLE PRECISION,
    "status"           TEXT NOT NULL DEFAULT 'Active',
    "expireDate"       TIMESTAMP(3) NOT NULL,
    "appliedRentalId"  TEXT,
    "appliedDate"      TIMESTAMP(3),
    "usedDate"         TIMESTAMP(3),
    "expiredDate"      TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT now(),
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT now()
);


-- ============================================================================
-- SECTION 3: PRIMARY KEYS / UNIQUE CONSTRAINTS / FOREIGN KEYS / INDEXES
-- (Primary keys are already declared inline above. Everything below is
--  added separately so it can be safely re-run and extended over time.)
-- ============================================================================

-- ---- Unique constraints ----------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RentalProduct_slug_key') THEN
        ALTER TABLE "RentalProduct" ADD CONSTRAINT "RentalProduct_slug_key" UNIQUE ("slug");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BuyProduct_slug_key') THEN
        ALTER TABLE "BuyProduct" ADD CONSTRAINT "BuyProduct_slug_key" UNIQUE ("slug");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Customer_customerId_key') THEN
        ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerId_key" UNIQUE ("customerId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Customer_email_key') THEN
        ALTER TABLE "Customer" ADD CONSTRAINT "Customer_email_key" UNIQUE ("email");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RentalRequest_requestId_key') THEN
        ALTER TABLE "RentalRequest" ADD CONSTRAINT "RentalRequest_requestId_key" UNIQUE ("requestId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reward_rewardId_key') THEN
        ALTER TABLE "Reward" ADD CONSTRAINT "Reward_rewardId_key" UNIQUE ("rewardId");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reward_rentalRequestId_key') THEN
        ALTER TABLE "Reward" ADD CONSTRAINT "Reward_rentalRequestId_key" UNIQUE ("rentalRequestId");
    END IF;
END $$;

-- ---- Foreign keys -----------------------------------------------------------
-- NOTE: "productId" on RentalRequest is intentionally NOT a foreign key.
-- It can point to either "RentalProduct" or "BuyProduct" (polymorphic
-- reference), and Postgres foreign keys can only target one table. Enforce
-- that relationship at the application layer, or split into two nullable
-- columns (rentalProductId / buyProductId) if you want DB-level enforcement
-- later -- see SECTION 8 for a non-breaking migration path.
--
-- Existing constraints use NOT VALID so they attach without scanning/failing
-- on any pre-existing rows that don't satisfy them yet. Run the VALIDATE
-- CONSTRAINT statements only after you've confirmed existing data is clean.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RentalRequest_customerId_fkey') THEN
        ALTER TABLE "RentalRequest"
            ADD CONSTRAINT "RentalRequest_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
            ON DELETE SET NULL ON UPDATE CASCADE
            NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reward_rentalRequestId_fkey') THEN
        ALTER TABLE "Reward"
            ADD CONSTRAINT "Reward_rentalRequestId_fkey"
            FOREIGN KEY ("rentalRequestId") REFERENCES "RentalRequest"("requestId")
            ON DELETE RESTRICT ON UPDATE CASCADE
            NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Reward_appliedRentalId_fkey') THEN
        ALTER TABLE "Reward"
            ADD CONSTRAINT "Reward_appliedRentalId_fkey"
            FOREIGN KEY ("appliedRentalId") REFERENCES "RentalRequest"("requestId")
            ON DELETE SET NULL ON UPDATE CASCADE
            NOT VALID;
    END IF;
END $$;

-- Once you've confirmed there's no bad data, run these once (safe to re-run):
-- ALTER TABLE "RentalRequest" VALIDATE CONSTRAINT "RentalRequest_customerId_fkey";
-- ALTER TABLE "Reward" VALIDATE CONSTRAINT "Reward_rentalRequestId_fkey";
-- ALTER TABLE "Reward" VALIDATE CONSTRAINT "Reward_appliedRentalId_fkey";

-- ---- Indexes ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "idx_rentalproduct_category"      ON "RentalProduct" ("category");
CREATE INDEX IF NOT EXISTS "idx_rentalproduct_available"     ON "RentalProduct" ("available");
CREATE INDEX IF NOT EXISTS "idx_rentalproduct_display_order" ON "RentalProduct" ("display_order");

CREATE INDEX IF NOT EXISTS "idx_buyproduct_category"      ON "BuyProduct" ("category");
CREATE INDEX IF NOT EXISTS "idx_buyproduct_status"        ON "BuyProduct" ("status");
CREATE INDEX IF NOT EXISTS "idx_buyproduct_display_order" ON "BuyProduct" ("display_order");

CREATE INDEX IF NOT EXISTS "idx_sellrequest_status"     ON "SellRequest" ("status");
CREATE INDEX IF NOT EXISTS "idx_sellrequest_created_at" ON "SellRequest" ("createdAt");

CREATE INDEX IF NOT EXISTS "idx_servicebooking_status"     ON "ServiceBooking" ("status");
CREATE INDEX IF NOT EXISTS "idx_servicebooking_event_date" ON "ServiceBooking" ("eventDate");

CREATE INDEX IF NOT EXISTS "idx_customer_phone_number" ON "Customer" ("phoneNumber");

CREATE INDEX IF NOT EXISTS "idx_rentalrequest_status"         ON "RentalRequest" ("status");
CREATE INDEX IF NOT EXISTS "idx_rentalrequest_payment_status" ON "RentalRequest" ("paymentStatus");
CREATE INDEX IF NOT EXISTS "idx_rentalrequest_customer_id"    ON "RentalRequest" ("customerId");
CREATE INDEX IF NOT EXISTS "idx_rentalrequest_product_id"     ON "RentalRequest" ("productId");
CREATE INDEX IF NOT EXISTS "idx_rentalrequest_created_at"     ON "RentalRequest" ("createdAt");

CREATE INDEX IF NOT EXISTS "idx_testimonial_status"   ON "Testimonial" ("status");
CREATE INDEX IF NOT EXISTS "idx_testimonial_featured" ON "Testimonial" ("featured");

CREATE INDEX IF NOT EXISTS "idx_reward_status"      ON "Reward" ("status");
CREATE INDEX IF NOT EXISTS "idx_reward_customer_id" ON "Reward" ("customerId");
CREATE INDEX IF NOT EXISTS "idx_reward_expire_date" ON "Reward" ("expireDate");


-- ============================================================================
-- SECTION 4: FUNCTIONS (ID GENERATORS)
-- ============================================================================

-- ---- Sequences --------------------------------------------------------------
-- These START WITH values match the requested formats:
--   Customer:       FCR-C10000, FCR-C10001, ...
--   RentalRequest:  FCR-R100001, FCR-R100002, ...
--   Reward:         RWD-100001, RWD-100002, ...
--
-- IMPORTANT: if these tables already contain rows created by app-level ID
-- generation, run the "fast-forward" block right after creating each
-- sequence (below) so newly generated IDs never collide with existing ones.

CREATE SEQUENCE IF NOT EXISTS "customer_id_seq" START WITH 10000 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS "rental_request_id_seq" START WITH 100001 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS "reward_id_seq" START WITH 100001 INCREMENT BY 1;

-- One-time fast-forward guard so the sequence starts safely past any
-- existing hand-generated IDs. Safe to re-run (it only ever moves forward).
DO $$
DECLARE
    max_customer_num BIGINT;
    max_rental_num    BIGINT;
    max_reward_num    BIGINT;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace("customerId", '\D', '', 'g'), '')::BIGINT), 0)
      INTO max_customer_num FROM "Customer";
    IF max_customer_num >= 10000 THEN
        PERFORM setval('"customer_id_seq"', max_customer_num + 1, false);
    END IF;

    SELECT COALESCE(MAX(NULLIF(regexp_replace("requestId", '\D', '', 'g'), '')::BIGINT), 0)
      INTO max_rental_num FROM "RentalRequest";
    IF max_rental_num >= 100001 THEN
        PERFORM setval('"rental_request_id_seq"', max_rental_num + 1, false);
    END IF;

    SELECT COALESCE(MAX(NULLIF(regexp_replace("rewardId", '\D', '', 'g'), '')::BIGINT), 0)
      INTO max_reward_num FROM "Reward";
    IF max_reward_num >= 100001 THEN
        PERFORM setval('"reward_id_seq"', max_reward_num + 1, false);
    END IF;
END $$;

-- ---- Generator functions ----------------------------------------------------

CREATE OR REPLACE FUNCTION fn_generate_customer_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'FCR-C' || nextval('"customer_id_seq"')::TEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_generate_rental_request_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'FCR-R' || nextval('"rental_request_id_seq"')::TEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_generate_reward_id() RETURNS TEXT AS $$
BEGIN
    RETURN 'RWD-' || nextval('"reward_id_seq"')::TEXT;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- ---- 5a. Auto-generate business IDs on insert -------------------------------

CREATE OR REPLACE FUNCTION trg_set_customer_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."customerId" IS NULL OR NEW."customerId" = '' THEN
        NEW."customerId" := fn_generate_customer_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "before_insert_customer_id" ON "Customer";
CREATE TRIGGER "before_insert_customer_id"
    BEFORE INSERT ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION trg_set_customer_id();


CREATE OR REPLACE FUNCTION trg_set_rental_request_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."requestId" IS NULL OR NEW."requestId" = '' THEN
        NEW."requestId" := fn_generate_rental_request_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "before_insert_rental_request_id" ON "RentalRequest";
CREATE TRIGGER "before_insert_rental_request_id"
    BEFORE INSERT ON "RentalRequest"
    FOR EACH ROW EXECUTE FUNCTION trg_set_rental_request_id();


CREATE OR REPLACE FUNCTION trg_set_reward_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."rewardId" IS NULL OR NEW."rewardId" = '' THEN
        NEW."rewardId" := fn_generate_reward_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "before_insert_reward_id" ON "Reward";
CREATE TRIGGER "before_insert_reward_id"
    BEFORE INSERT ON "Reward"
    FOR EACH ROW EXECUTE FUNCTION trg_set_reward_id();


-- ---- 5b. Auto-update "updatedAt" on every UPDATE ----------------------------

CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "set_updated_at" ON "RentalProduct";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "RentalProduct"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "BuyProduct";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "BuyProduct"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "SellRequest";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "SellRequest"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "ServiceBooking";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "ServiceBooking"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "Customer";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "Customer"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "RentalRequest";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "RentalRequest"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "Testimonial";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "Testimonial"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS "set_updated_at" ON "Reward";
CREATE TRIGGER "set_updated_at" BEFORE UPDATE ON "Reward"
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- Note: DROP TRIGGER IF EXISTS + CREATE TRIGGER is the standard idempotent
-- pattern for triggers in Postgres (there's no CREATE TRIGGER IF NOT EXISTS).
-- This never drops a table or any data -- only the trigger definition itself.


-- ---- 5c. Auto-create a Reward when a rental's status becomes 'Completed' ---

CREATE OR REPLACE FUNCTION trg_create_reward_on_completion() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."status" = 'Completed' AND (OLD."status" IS DISTINCT FROM 'Completed') THEN
        IF NOT EXISTS (
            SELECT 1 FROM "Reward" WHERE "rentalRequestId" = NEW."requestId"
        ) THEN
            INSERT INTO "Reward" (
                "rewardId", "customerId", "customerName", "contactNumber",
                "rentalRequestId", "rentalDate", "rewardPercentage",
                "rewardAmount", "status", "expireDate"
            ) VALUES (
                fn_generate_reward_id(),
                COALESCE(NEW."customerId", ''),
                NEW."fullName",
                NEW."phone",
                NEW."requestId",
                NEW."bookingDate",
                10,
                ROUND((NEW."totalAmount" * 10 / 100)::NUMERIC, 2)::FLOAT8,
                'Active',
                now() + INTERVAL '3 months'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "after_rental_completed_create_reward" ON "RentalRequest";
CREATE TRIGGER "after_rental_completed_create_reward"
    AFTER UPDATE ON "RentalRequest"
    FOR EACH ROW EXECUTE FUNCTION trg_create_reward_on_completion();


-- ---- 5d. Expire rewards after 3 months --------------------------------------
-- A trigger can only fire on an actual DB write (INSERT/UPDATE/DELETE) -- it
-- cannot fire purely because time has passed. So this is implemented as a
-- callable function, meant to run on a schedule (see options below).

CREATE OR REPLACE FUNCTION fn_expire_rewards() RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE "Reward"
       SET "status" = 'Expired',
           "expiredDate" = now()
     WHERE "status" = 'Active'
       AND "expireDate" < now();

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Option A (preferred on Neon): call fn_expire_rewards() from your app's
-- existing cron / serverless scheduled function (e.g. a Vercel Cron Job
-- hitting an API route once a day) that runs: SELECT fn_expire_rewards();
--
-- Option B (only if pg_cron is enabled on your Neon plan):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('expire-rewards-daily', '0 0 * * *', 'SELECT fn_expire_rewards();');


-- ============================================================================
-- SECTION 6: VIEWS (ADMIN DASHBOARD REPORTS)
-- ============================================================================

CREATE OR REPLACE VIEW "view_admin_dashboard_summary" AS
SELECT
    (SELECT COUNT(*) FROM "RentalProduct" WHERE "available" = TRUE)          AS available_rental_products,
    (SELECT COUNT(*) FROM "BuyProduct" WHERE "status" = 'In Stock')          AS in_stock_buy_products,
    (SELECT COUNT(*) FROM "RentalRequest" WHERE "status" = 'Pending')        AS pending_rental_requests,
    (SELECT COUNT(*) FROM "RentalRequest" WHERE "status" = 'Completed')      AS completed_rentals,
    (SELECT COUNT(*) FROM "SellRequest" WHERE "status" = 'pending')         AS pending_sell_requests,
    (SELECT COUNT(*) FROM "ServiceBooking" WHERE "status" = 'pending')      AS pending_service_bookings,
    (SELECT COUNT(*) FROM "Testimonial" WHERE "status" = 'pending')         AS pending_testimonials,
    (SELECT COUNT(*) FROM "Reward" WHERE "status" = 'Active')               AS active_rewards,
    (SELECT COALESCE(SUM("totalAmount"), 0) FROM "RentalRequest"
       WHERE "paymentStatus" = 'Paid')                                     AS total_paid_revenue;

CREATE OR REPLACE VIEW "view_rental_revenue_by_month" AS
SELECT
    date_trunc('month', "createdAt")                AS month,
    COUNT(*)                                          AS total_requests,
    COUNT(*) FILTER (WHERE "status" = 'Completed')    AS completed_requests,
    COALESCE(SUM("totalAmount") FILTER (WHERE "paymentStatus" = 'Paid'), 0) AS revenue
FROM "RentalRequest"
GROUP BY date_trunc('month', "createdAt")
ORDER BY month DESC;

CREATE OR REPLACE VIEW "view_top_rental_products" AS
SELECT
    "productId",
    "productName",
    COUNT(*)                                       AS times_booked,
    COALESCE(SUM("totalAmount"), 0)                AS total_revenue
FROM "RentalRequest"
GROUP BY "productId", "productName"
ORDER BY times_booked DESC;

CREATE OR REPLACE VIEW "view_customer_reward_summary" AS
SELECT
    c."id"          AS customer_db_id,
    c."customerId",
    c."name",
    c."email",
    COUNT(r."id") FILTER (WHERE r."status" = 'Active')  AS active_rewards,
    COUNT(r."id") FILTER (WHERE r."status" = 'Used')     AS used_rewards,
    COUNT(r."id") FILTER (WHERE r."status" = 'Expired')  AS expired_rewards,
    COALESCE(SUM(r."rewardAmount") FILTER (WHERE r."status" = 'Active'), 0) AS active_reward_value
FROM "Customer" c
LEFT JOIN "Reward" r ON r."customerId" = c."id"
GROUP BY c."id", c."customerId", c."name", c."email";


-- ============================================================================
-- SECTION 7: FUTURE UPDATES GO HERE
-- ============================================================================
-- Rules for every future change, forever:
--   - Never write CREATE TABLE for a table that already exists above.
--     Use ALTER TABLE ... ADD COLUMN IF NOT EXISTS instead.
--   - Never write DROP TABLE, TRUNCATE, or DELETE FROM without an explicit,
--     separate, human-approved migration -- this file is not the place for it.
--   - New tables: CREATE TABLE IF NOT EXISTS.
--   - New columns: ALTER TABLE "TableName" ADD COLUMN IF NOT EXISTS "col" TYPE;
--   - New indexes: CREATE INDEX IF NOT EXISTS.
--   - New/changed functions: CREATE OR REPLACE FUNCTION.
--   - New/changed triggers: DROP TRIGGER IF EXISTS ... ; CREATE TRIGGER ...
--   - After running any block below in Neon: apply the SQL changes to your database.
--
-- Example template for your next change:
--
-- ALTER TABLE "RentalProduct" ADD COLUMN IF NOT EXISTS "sku" TEXT;
-- CREATE INDEX IF NOT EXISTS "idx_rentalproduct_sku" ON "RentalProduct" ("sku");
--
-- (Add new dated entries below this line as your schema evolves.)