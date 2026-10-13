import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Sunday Clóset — Catálogo Exclusivo",
  description: "Curaduría vintage y piezas únicas seleccionadas a mano.",
  manifest: "/manifest.json",
  referrer: "no-referrer",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sunday Clóset",
  },
  icons: {
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark overflow-x-hidden max-w-full w-full">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-slate-950 text-slate-100 antialiased min-h-screen overflow-x-hidden max-w-full w-full`}
      >
        {children}
      </body>
    </html>
  );
}
