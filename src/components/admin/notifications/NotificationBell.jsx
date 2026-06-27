"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationBell({ onClick }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative rounded-full p-2 text-white hover:bg-white/10 cursor-pointer"
    >
      <Bell size={22} />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
