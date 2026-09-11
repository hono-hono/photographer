import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "hono | Photographer",
    template: "%s | hono",
  },
  description:
    "写真家 hono のポートフォリオサイト。人の面影や物語を感じる風景から、大切な人との時間まで、心が動いた瞬間を写真として残しています。",
  keywords: ["写真", "フォトグラファー", "ポートフォリオ", "家族写真", "hono"],
  authors: [{ name: "hono" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title: "hono | Photographer",
    description:
      "写真家 hono のポートフォリオサイト。心が動いた瞬間を写真として残しています。",
    siteName: "hono",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${cormorant.variable} ${notoSansJP.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
