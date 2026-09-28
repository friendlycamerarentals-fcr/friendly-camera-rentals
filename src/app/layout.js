import "./globals.css";
import Script from "next/script";
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
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({
                'gtm.start': new Date().getTime(),
                event:'gtm.js'
              });

              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';

              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P67MRQHH');
          `}
        </Script>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P67MRQHH"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          />
        </noscript>

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
