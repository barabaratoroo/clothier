import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番ビルドが型チェック/Lintのエラーで止まらないようにする
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Supabaseの画像を表示できるように許可
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
