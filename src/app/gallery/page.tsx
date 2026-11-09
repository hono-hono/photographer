import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryTabs } from "@/features/gallery/GalleryTabs";
import { getCategories, getWorks } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "写真家 hono の作品一覧。カテゴリごとに見られます。",
  alternates: { canonical: absoluteUrl("/gallery/") },
  openGraph: {
    title: "Gallery | hono",
    url: absoluteUrl("/gallery/"),
    images: [
      { url: absoluteUrl("/opengraph-image.png"), width: 1200, height: 630, alt: "hono — 写真家のポートフォリオ" },
    ],
  },
};

export default function GalleryPage() {
  return (
    <main className={styles.main}>
      <div className={styles.heading}>
        <SectionHeading level={1}>Gallery</SectionHeading>
      </div>
      <GalleryTabs works={getWorks()} categories={getCategories()} />
    </main>
  );
}
