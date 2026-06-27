"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  Star,
  Users,
  Settings,
  LogOut,
  X,
  Package,
  Store,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  {
    title: "Rentals",
    href: "/admin/rentals",
    icon: Camera,
  },

  // Rental Products CRUD
  {
    title: "Rental Products",
    href: "/admin/rental-products",
    icon: Package,
  },

  {
    title: "Buy Products",
    href: "/admin/buy",
    icon: ShoppingBag,
  },

  {
    title: "Sell Requests",
    href: "/admin/sell-requests",
    icon: IndianRupee,
  },

  {
    title: "Service Bookings",
    href: "/admin/services",
    icon: CalendarDays,
  },

  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },

  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: Star,
  },
];

function SidebarContent({ pathname, closeSidebar, handleLogout }) {
  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F5A623]">📸 FCR Admin</h1>

            <p className="mt-1 text-sm text-zinc-500">
              Friendly Camera Rentals
            </p>
          </div>

          <button
            onClick={closeSidebar}
            className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? "bg-[#F5A623] text-black shadow-[0_0_30px_rgba(245,166,35,0.25)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className="transition-transform group-hover:scale-110"
              />

              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 py-3 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    window.addEventListener("open-admin-sidebar", handleOpen);

    return () => {
      window.removeEventListener("open-admin-sidebar", handleOpen);
    };
  }, []);

  const closeSidebar = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-60 border-r border-white/10 bg-zinc-950 lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Overlay */}
      {open && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-screen w-60 transform border-r border-white/10 bg-zinc-950 transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          pathname={pathname}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
        />
      </aside>
    </>
  );
}
