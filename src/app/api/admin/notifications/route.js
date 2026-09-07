import { NextResponse } from "next/server";
import {
  getAllNotifications,
  getNotificationCounts,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/adminNotificationService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/notifications
 * Fetch all notifications for admin panel
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const [notifications, counts] = await Promise.all([
      getAllNotifications(limit),
      getNotificationCounts(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: notifications,
        counts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/notifications
 * Mark notification as read or delete
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action is required" },
        { status: 400 },
      );
    }

    if (action === "mark-read") {
      if (!notificationId) {
        return NextResponse.json(
          { success: false, message: "Notification ID is required" },
          { status: 400 },
        );
      }

      const notification = await markNotificationAsRead(notificationId);

      return NextResponse.json(
        {
          success: true,
          data: notification,
          message: "Notification marked as read",
        },
        { status: 200 },
      );
    } else if (action === "mark-all-read") {
      const notifications = await markAllNotificationsAsRead();

      return NextResponse.json(
        {
          success: true,
          data: notifications,
          message: "All notifications marked as read",
        },
        { status: 200 },
      );
    } else if (action === "delete") {
      if (!notificationId) {
        return NextResponse.json(
          { success: false, message: "Notification ID is required" },
          { status: 400 },
        );
      }

      const notification = await deleteNotification(notificationId);

      return NextResponse.json(
        {
          success: true,
          data: notification,
          message: "Notification deleted",
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification",
      },
      { status: 500 },
    );
  }
}
