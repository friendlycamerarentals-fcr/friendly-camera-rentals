import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BookingFlowProvider } from "@/context/BookingFlowContext";
import LoaderWrapper from "@/components/common/LoaderWrapper";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

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
      <body className="bg-black text-white antialiased">
        <AuthProvider>
          <CartProvider>
            <BookingFlowProvider>
              <LoaderWrapper>
                <LayoutWrapper>{children}</LayoutWrapper>

                <Toaster
                  position="top-center"
                  richColors
                  closeButton
                  duration={3000}
                  theme="dark"
                />
              </LoaderWrapper>
            </BookingFlowProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
