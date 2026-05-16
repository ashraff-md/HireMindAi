import type { NextConfig } from "next";

const backendDev =
  process.env.BACKEND_DEV_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendDev}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
