import pool, { isDatabaseConfigured } from "./connection.js";

const normalizeSql = (sql) => String(sql).replace(/\s+/g, " ").trim();

const logQuery = (event, { sql, params, durationMs, rowCount, error }) => {
  const payload = {
    event,
    durationMs,
    sql: normalizeSql(sql),
    paramCount: Array.isArray(params) ? params.length : 0,
    rowCount,
  };

  if (error) {
    console.error("[PG] Query failed", { ...payload, message: error.message });
    return;
  }

  console.info("[PG] Query completed", payload);
};

const executeQuery = async (client, sql, params = []) => {
  const startedAt = Date.now();

  try {
    const result = await client.query(sql, params);
    logQuery("query", {
      sql,
      params,
      durationMs: Date.now() - startedAt,
      rowCount: result?.rowCount ?? result?.rows?.length ?? 0,
    });
    return result;
  } catch (error) {
    logQuery("query", {
      sql,
      params,
      durationMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
};

// Central SQL wrapper for the PostgreSQL-backed app.
// All application queries should use this module instead of calling the pool directly.
export async function query(sql, params = []) {
  if (!isDatabaseConfigured() || !pool) {
    console.warn(
      "[PG] Database is not configured; returning empty rows for query.",
      {
        sql: normalizeSql(sql),
        paramCount: Array.isArray(params) ? params.length : 0,
      },
    );
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
      console.error("[PG] Transaction rollback failed", {
        message: rollbackError.message,
      });
    }

    throw error;
  } finally {
    client.release();
  }
}
