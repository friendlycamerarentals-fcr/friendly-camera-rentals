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
  LogOut,
  X,
  Package,
  Gift,
  Megaphone,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { title: "Rentals", href: "/admin/rentals", icon: Camera },
  { title: "Rental Products", href: "/admin/rental-products", icon: Package },
  { title: "Buy Products", href: "/admin/buy", icon: ShoppingBag },
  { title: "Sell Requests", href: "/admin/sell-requests", icon: IndianRupee },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Rewards", href: "/admin/rewards", icon: Gift },
  { title: "Testimonials", href: "/admin/testimonials", icon: Star },
  { title: "Hero Marquee", href: "/admin/hero-marquee", icon: Megaphone },
];

function SidebarTooltip({ label, show, children }) {
  if (!show) return children;

  return (
    <div className="group relative flex w-full items-center justify-center">
      {children}
      <span className="pointer-events-none absolute left-full ml-2 hidden rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-100 shadow-lg lg:group-hover:block">
        {label}
      </span>
    </div>
  );
}

function SidebarContent({
  pathname,
  closeSidebar,
  handleLogout,
  collapsed,
  toggleCollapsed,
}) {
  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Branding/header */}
      <div
        className={`border-b border-white/10 transition-all duration-300 ${collapsed ? "p-3" : "p-6"}`}
      >
        <div className="flex items-start justify-between">
          {/* Left: logo + text (expanded) or centered logo (collapsed) */}
          {collapsed ? (
            <div className="flex items-center justify-center w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5A623]/15">
                <span className="text-2xl">📸</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5A623]/15">
                <span className="text-2xl">📸</span>
              </div>

              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[#F5A623] whitespace-nowrap">
                  FCR Admin
                </h1>
                {/* <p className="mt-1 text-sm text-zinc-500">
                  Friendly Camera Rentals
                </p> */}
              </div>
            </div>
          )}

          {/* Right: collapse toggle and mobile close (top-right) */}
          <div className="flex items-start gap-2 pr-3">
            {!collapsed && (
              <button
                onClick={closeSidebar}
                className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
              >
                <X size={18} />
              </button>
            )}

            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden md:inline-flex rounded-xl p-2 text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
            >
              {collapsed ? (
                <ChevronsRight size={18} />
              ) : (
                <ChevronsLeft size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav
        className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "px-2 py-3" : "space-y-2 p-3"}`}
      >
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <SidebarTooltip
                key={item.href}
                label={item.title}
                show={collapsed}
              >
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  aria-label={item.title}
                  className={`group flex items-center transition-all duration-300 h-12 ${
                    collapsed ? "justify-center px-3" : "px-4"
                  } ${
                    active
                      ? "bg-[#F5A623] text-black shadow-[0_0_30px_rgba(245,166,35,0.25)] rounded-xl"
                      : "text-zinc-400 hover:bg-white/5 hover:rounded-full"
                  }`}
                >
                  <Icon
                    size={22}
                    className={`${active ? "text-black" : "text-zinc-400 group-hover:text-white"} shrink-0`}
                  />

                  {!collapsed && (
                    <span className="ml-3 text-sm font-medium leading-none">
                      {item.title}
                    </span>
                  )}
                </Link>
              </SidebarTooltip>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div
        className={`border-t border-white/10 transition-all duration-300 ${collapsed ? "p-2" : "p-4"}`}
      >
        <SidebarTooltip label="Logout" show={collapsed}>
          <button
            onClick={handleLogout}
            className={`flex w-full items-center justify-center rounded-2xl border border-red-500/20 text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? "px-3 py-3" : "gap-2 py-3"}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </SidebarTooltip>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("admin-sidebar-collapsed");
    return stored === "true";
  });

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-admin-sidebar", handleOpen);
    return () => window.removeEventListener("open-admin-sidebar", handleOpen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      collapsed ? "80px" : "240px",
    );
  }, [collapsed]);

  const closeSidebar = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen border-r border-white/10 bg-zinc-950 transition-all duration-300 ease-out md:flex md:flex-col ${collapsed ? "w-20" : "w-60"}`}
      >
        <SidebarContent
          pathname={pathname}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-70 h-screen w-60 transform border-r border-white/10 bg-zinc-950 transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent
          pathname={pathname}
          closeSidebar={closeSidebar}
          handleLogout={handleLogout}
          collapsed={false}
          toggleCollapsed={() => setCollapsed((v) => !v)}
        />
      </aside>
    </>
  );
}
