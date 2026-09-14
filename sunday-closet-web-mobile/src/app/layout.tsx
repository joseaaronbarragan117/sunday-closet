import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunday Clóset — Tienda Móvil",
  description: "Curaduría exclusiva de moda circular y piezas únicas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sunday Clóset",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F7F6F2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#1F1F1F]">
        {children}
      </body>
    </html>
  );
}
