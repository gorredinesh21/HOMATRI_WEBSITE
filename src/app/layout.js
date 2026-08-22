import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Homatri — Achha Khao. Ghar Ka Khao.",
  description: "A managed tiffin and home-food platform built around trusted homemakers. Delivering authentic, healthy home-cooked meals right to your doorstep.",
  keywords: ["Homatri", "Home Food", "Tiffin Service", "Ghansoli Tiffin", "Authentic Home Meals", "Navi Mumbai Home Food"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${outfit.variable} scroll-smooth`}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
