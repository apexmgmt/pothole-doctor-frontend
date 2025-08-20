import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

import localFont from "next/font/local";
const ClashGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/ClashGrotesk-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ClashGrotesk-Semibold.woff2",
      weight: "600",
      style: "medium",
    },
    {
      path: "../public/fonts/ClashGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata = {
  title: "The Pothole Doctors - Professional Road Repair Services",
  description:
    "Expert pothole repair, crack sealing, and asphalt maintenance services. Building strong foundations with quality craftsmanship.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-global">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
