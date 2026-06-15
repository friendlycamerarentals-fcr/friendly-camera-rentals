import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";
import LoaderWrapper from "@/components/common/LoaderWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Friendly Camera Rentals",
  description: "Rent • Buy • Sell Professional Camera Equipment",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} bg-black text-white antialiased`}
      >
        <CartProvider>
          <LoaderWrapper>
            <Navbar />

            <main className="min-h-screen pt-20">{children}</main>

            <FloatingWhatsApp />
            <Footer />

            <Toaster
              position="top-center"
              richColors
              closeButton
              duration={3000}
              theme="dark"
            />
          </LoaderWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
