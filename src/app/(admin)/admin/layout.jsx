import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { NotificationProvider } from "@/context/NotificationContext";

export default function AdminLayout({ children }) {
  return (
    <NotificationProvider>
      <div className="min-h-screen overflow-hidden bg-black text-white">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex min-h-screen flex-col lg:ml-60">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
