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
    // ✅ 빌드 시 ESLint 에러 무시
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;