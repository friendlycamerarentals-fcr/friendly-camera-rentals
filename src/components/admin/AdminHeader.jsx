"use client";

import { useState } from "react";
import { CalendarDays, User, Menu, X } from "lucide-react";

import NotificationBell from "./notifications/NotificationBell";
import NotificationDropdown from "./notifications/NotificationDropdown";

export default function AdminHeader() {
  const [openNotifications, setOpenNotifications] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("open-admin-sidebar"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            onClick={openSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white md:text-2xl">
              Admin Dashboard
            </h2>

            <p className="hidden text-xs text-zinc-400 sm:block md:text-sm">
              Manage Friendly Camera Rentals
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Date */}
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 xl:flex">
            <CalendarDays size={18} className="text-[#F5A623]" />

            <span className="whitespace-nowrap text-sm text-zinc-300">
              {currentDate}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            {openNotifications ? (
              <button
                onClick={() => setOpenNotifications(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40"
              >
                <X size={18} className="text-red-400" />
              </button>
            ) : (
              <div className="cursor-pointer">
                <NotificationBell onClick={() => setOpenNotifications(true)} />
              </div>
            )}

            {openNotifications && <NotificationDropdown />}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623]/10 md:h-10 md:w-10">
              <User size={18} className="text-[#F5A623]" />
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">Administrator</p>

              <p className="text-xs text-zinc-400">admin@fcr.in</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
