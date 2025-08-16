import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // 배포 시 ESLint 무시
  },
  typescript: {
    ignoreBuildErrors: true, // 타입 에러도 무시
  },
};

export default nextConfig;