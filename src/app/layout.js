import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BookingFlowProvider } from "@/context/BookingFlowContext";
import LoaderWrapper from "@/components/common/LoaderWrapper";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

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
