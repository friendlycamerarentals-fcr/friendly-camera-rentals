import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminLayout({ children }) {
  return (
    <NotificationProvider>
      <div className="admin-panel flex h-screen overflow-hidden bg-black text-white">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin-left] duration-300 ease-out md:ml-(--admin-sidebar-width)">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
