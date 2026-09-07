import pool, { isDatabaseConfigured } from "./connection.js";

const executeQuery = async (client, sql, params = []) => {
  return client.query(sql, params);
};

// Central SQL wrapper for the PostgreSQL-backed app.
// All application queries should use this module instead of calling the pool directly.
export async function query(sql, params = []) {
  if (!isDatabaseConfigured() || !pool) {
    return [];
  }

  const result = await executeQuery(pool, sql, params);
  return result.rows;
}

export async function getClient() {
  if (!isDatabaseConfigured() || !pool) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL or POSTGRES_URL to enable database access.",
    );
  }

  const client = await pool.connect();
  return client;
}

export async function transaction(callback) {
  const client = await getClient();

  try {
    await executeQuery(client, "BEGIN");
    const result = await callback(client);
    await executeQuery(client, "COMMIT");
    return result;
  } catch (error) {
    try {
      await executeQuery(client, "ROLLBACK");
    } catch (rollbackError) {
      console.error("Transaction rollback failed", {
        message: rollbackError.message,
      });
    }

    throw error;
  } finally {
    client.release();
  }
}
