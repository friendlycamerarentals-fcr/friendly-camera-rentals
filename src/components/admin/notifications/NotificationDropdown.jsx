"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationDropdown() {
  const { notifications, markAsRead } = useNotifications();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    /*
     * Position strategy:
     * - `right-0`  anchors to the bell button's right edge on all screens
     * - `w-screen sm:w-96` fills viewport width on mobile, fixed 384px on sm+
     * - `max-w-[calc(100vw-2rem)]` stops it from ever touching screen edges
     * - No `left-0` so it doesn't over-extend to the left on mobile
     */
    <div
      className="
        absolute -right-18 top-12
        z-[999]
        w-screen max-w-[calc(100vw-2rem)]
        sm:w-96 sm:max-w-[384px]
        rounded-2xl
        border border-white/10
        bg-zinc-950
        shadow-[0_8px_40px_rgba(0,0,0,0.6)]
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#F5A623]" />
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-[#F5A623]/20 px-2 py-0.5 text-[11px] font-semibold text-[#F5A623]">
            {unread} new
          </span>
        )}
      </div>

      {/* Body */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Bell size={28} className="text-zinc-700" />
          <p className="text-sm text-zinc-500">No notifications yet</p>
        </div>
      ) : (
        <div className="max-h-[60vh] divide-y divide-white/5 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`cursor-pointer px-4 py-3 transition-colors ${
                n.read
                  ? "hover:bg-white/5"
                  : "bg-[#F5A623]/8 hover:bg-[#F5A623]/12"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Unread dot */}
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.read ? "bg-transparent" : "bg-[#F5A623]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-zinc-400">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-600">
                    {n.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-white/10 px-4 py-2.5">
          <button className="text-xs text-zinc-500 transition hover:text-[#F5A623]">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
