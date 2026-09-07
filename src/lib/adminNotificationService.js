import { query } from "@/db/query";

/**
 * Create a notification for admin
 */
export async function createAdminNotification({
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
}) {
  try {
    const rows = await query(
      `INSERT INTO "AdminNotification" ("type", "title", "message", "relatedId", "relatedType")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [type, title, message, relatedId, relatedType],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[CREATE_NOTIFICATION]", error);
    return null;
  }
}

/**
 * Get all unread notifications (newest first)
 */
export async function getUnreadNotifications() {
  try {
    const rows = await query(
      `SELECT * FROM "AdminNotification" WHERE "read" = FALSE ORDER BY "createdAt" DESC`,
    );
    return rows || [];
  } catch (error) {
    console.error("[GET_UNREAD_NOTIFICATIONS]", error);
    return [];
  }
}

/**
 * Get all notifications (newest first)
 */
export async function getAllNotifications(limit = 50) {
  try {
    const rows = await query(
      `SELECT * FROM "AdminNotification" ORDER BY "createdAt" DESC LIMIT $1`,
      [limit],
    );
    return rows || [];
  } catch (error) {
    console.error("[GET_ALL_NOTIFICATIONS]", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const rows = await query(
      `UPDATE "AdminNotification" SET "read" = TRUE WHERE "id" = $1 RETURNING *`,
      [notificationId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[MARK_NOTIFICATION_READ]", error);
    return null;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    const rows = await query(
      `UPDATE "AdminNotification" SET "read" = TRUE WHERE "read" = FALSE RETURNING *`,
    );
    return rows || [];
  } catch (error) {
    console.error("[MARK_ALL_NOTIFICATIONS_READ]", error);
    return [];
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
  try {
    const rows = await query(
      `DELETE FROM "AdminNotification" WHERE "id" = $1 RETURNING *`,
      [notificationId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("[DELETE_NOTIFICATION]", error);
    return null;
  }
}

/**
 * Get notification count by read status
 */
export async function getNotificationCounts() {
  try {
    const rows = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE "read" = FALSE) as unread_count,
        COUNT(*) as total_count
       FROM "AdminNotification"`,
    );
    const result = rows[0];
    return {
      unreadCount: Number(result?.unread_count || 0),
      totalCount: Number(result?.total_count || 0),
    };
  } catch (error) {
    console.error("[GET_NOTIFICATION_COUNTS]", error);
    return { unreadCount: 0, totalCount: 0 };
  }
}
