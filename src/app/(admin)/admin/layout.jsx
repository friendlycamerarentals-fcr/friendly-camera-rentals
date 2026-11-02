import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { NotificationProvider } from "@/context/NotificationContext";

export const viewport = {
  viewportFit: "cover",
};

export default function AdminLayout({ children }) {
  return (
    <NotificationProvider>
      <div className="admin-panel relative flex h-dvh min-h-0 min-w-0 overflow-hidden bg-black text-white">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden transition-[padding-left] duration-300 ease-out md:pl-[var(--admin-sidebar-width)]">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main
            data-admin-main
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="mx-auto min-w-0 max-w-7xl px-[calc(1rem+env(safe-area-inset-left))] py-4 pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
