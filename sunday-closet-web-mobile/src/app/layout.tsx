import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
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
    statusBarStyle: "default",
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
    <html lang="es" className="overflow-x-hidden max-w-full w-full">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-[#FFFFFF] text-[#000000] antialiased min-h-screen overflow-x-hidden max-w-full w-full`}
      >
        {children}
      </body>
    </html>
  );
}
