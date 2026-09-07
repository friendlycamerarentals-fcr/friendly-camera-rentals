import pg from "pg";

const { Pool } = pg;

// Neon PostgreSQL connection pool for Next.js App Router and Vercel deployments.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const isNeon =
  connectionString?.includes("neon.tech") ||
  connectionString?.includes("neonpostgresql");

const pool = connectionString
  ? new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isNeon
        ? {
            rejectUnauthorized: false,
          }
        : false,
      application_name: "fcr-app",
    })
  : null;

if (pool) {
  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error);
  });

  process.on("exit", () => {
    pool.end().catch((error) => {
      console.error("Failed to close PostgreSQL pool on exit:", error);
    });
  });
}

export function isDatabaseConfigured() {
  return Boolean(connectionString);
}

export default pool;
