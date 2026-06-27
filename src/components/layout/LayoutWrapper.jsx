"use client";

import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-20">{children}</main>

      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
