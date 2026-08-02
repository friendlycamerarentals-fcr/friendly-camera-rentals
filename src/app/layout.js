import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BookingFlowProvider } from "@/context/BookingFlowContext";
import LoaderWrapper from "@/components/common/LoaderWrapper";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { initializeHeroMarqueeSchema } from "@/lib/heroMarquee";

export const metadata = {
  title: "Friendly Camera Rentals",
  description: "Rent • Buy • Sell Professional Camera Equipment",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default async function RootLayout({ children }) {
  try {
    await initializeHeroMarqueeSchema();
  } catch (error) {
    console.warn(
      "[LAYOUT] Hero marquee schema bootstrap skipped",
      error.message,
    );
  }

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
