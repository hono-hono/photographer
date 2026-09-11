import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages 向けの静的エクスポート
  output: "export",
  images: {
    unoptimized: true,
  },
  // リポジトリ名に合わせて変更してください（ユーザーサイトの場合は空文字）
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
