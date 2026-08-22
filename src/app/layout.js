import "./globals.css";

export const metadata = {
  title: "Homatri — Achha Khao. Ghar Ka Khao.",
  description: "A managed tiffin and home-food platform built around trusted homemakers. Delivering authentic, healthy home-cooked meals right to your doorstep.",
  keywords: ["Homatri", "Home Food", "Tiffin Service", "Ghansoli Tiffin", "Authentic Home Meals", "Navi Mumbai Home Food"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        {children}
      </body>
    </html>
  );
}
