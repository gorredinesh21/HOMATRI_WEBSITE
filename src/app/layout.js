import { Figtree, Fraunces } from "next/font/google";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import GlobalOverlays from "@/components/GlobalOverlays";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata = {
  title: "Homatri — Achha Khao. Ghar Ka Khao.",
  description: "A managed tiffin and home-food platform built around trusted homemakers. Delivering authentic, healthy home-cooked meals right to your doorstep.",
  keywords: ["Homatri", "Home Food", "Tiffin Service", "Ghansoli Tiffin", "Authentic Home Meals", "Navi Mumbai Home Food"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable} scroll-smooth`}>
      <body className="font-sans">
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              {children}
              <GlobalOverlays />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
