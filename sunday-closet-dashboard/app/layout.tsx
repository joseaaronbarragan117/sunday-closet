import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Sunday Clóset — Admin Hub',
  description: 'Panel de control privado de inventario, POS y drops para Sunday Clóset',
  manifest: '/manifest.json',
  referrer: 'no-referrer',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sunday Admin',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-slate-950 text-slate-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
