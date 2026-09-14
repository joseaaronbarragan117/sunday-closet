import type { NextConfig } from "next";

const isExport = process.env.OUTPUT_MODE === 'export';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: isExport ? 'export' : undefined,
  basePath: basePath ? basePath : undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: [
    '192.168.1.21',
    '192.168.1.21:3003',
    'localhost',
    'localhost:3003',
    '127.0.0.1',
    '127.0.0.1:3003',
  ],
};

export default nextConfig;
