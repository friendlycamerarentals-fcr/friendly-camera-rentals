import { query } from "@/db/query";

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

let heroMarqueeSchemaBootstrapPromise = null;

export async function ensureHeroMarqueeTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS "HeroMarquee" (
      "id" TEXT PRIMARY KEY,
      "text" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "display_order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "HeroMarqueeSettings" (
      "id" TEXT PRIMARY KEY,
      "isEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    INSERT INTO "HeroMarqueeSettings" ("id", "isEnabled")
    VALUES ('global', TRUE)
    ON CONFLICT ("id") DO NOTHING
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS "idx_heromarquee_active"
    ON "HeroMarquee" ("isActive")
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS "idx_heromarquee_display_order"
    ON "HeroMarquee" ("display_order")
  `);
}

export async function initializeHeroMarqueeSchema() {
  if (!heroMarqueeSchemaBootstrapPromise) {
    heroMarqueeSchemaBootstrapPromise = ensureHeroMarqueeTable().catch(
      (error) => {
        console.error("[HERO_MARQUEE_INIT]", error);
        throw error;
      },
    );
  }

  return heroMarqueeSchemaBootstrapPromise;
}
