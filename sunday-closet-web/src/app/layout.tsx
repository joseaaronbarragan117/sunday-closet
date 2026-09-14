// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSlideOver from "@/components/cart/CartSlideOver";

export const metadata: Metadata = {
  title: "Sunday Clóset — Moda Circular & Piezas Curadas",
  description: "Tienda online de piezas únicas curadas de alta selección. Moda minimalista, vintage e irrepetible.",
  keywords: ["sunday closet", "ropa segunda selección", "moda minimalista", "vintage", "moda circular"],
  openGraph: {
    title: "Sunday Clóset",
    description: "Piezas únicas de alta selección. Cuando se va, se va.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-[#F7F6F2] text-[#1F1F1F] font-body selection:bg-[#C2A78C]/20">
        <Navbar />
        <CartSlideOver />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
