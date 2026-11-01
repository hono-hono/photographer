import type { Metadata, Viewport } from "next";
// フォントはサイト自身から配信する（Google への通信なし）。使う太さだけ読み込む
import "@fontsource/noto-serif-jp/400.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  // basePath は Next.js が自動で足すので、ここはドメインだけにする
  metadataBase: new URL(new URL(SITE_URL).origin),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: { card: "summary_large_image" },
  // 共有用の画像とアイコンは src/app/ の opengraph-image.png・icon.png・apple-icon.png から自動で設定される
};

export const viewport: Viewport = {
  themeColor: "#F7F7F6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a href="#main" className="skip-link">
          本文へ移動
        </a>
        <Header />
        <div id="main" style={{ flex: "1 0 auto" }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
