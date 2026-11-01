import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // GitHub Pages 向けの静的書き出し
  output: "export",
  // /gallery を gallery/index.html として書き出す（GitHub Pages で確実に開けるように）
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages ではリポジトリ名の下に置かれる（deploy.yml で /photographer を渡す）
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
