import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['msnodesqlv8', 'mssql'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
