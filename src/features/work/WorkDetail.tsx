"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { PhotoViewer } from "@/components/photo/PhotoViewer";
import { parseCategoryFilter, type CategoryFilter } from "@/lib/categories";
import { cameFromGallery } from "@/lib/navigation";
import { withBase } from "@/lib/site";
import { galleryHref, getNeighbors, workHref } from "@/lib/works";
import type { Work } from "@/types/content";
import styles from "./WorkDetail.module.css";

/**
 * 作品詳細（設計書 7.4）。写真だけを大きく見せる。
 * - 前後移動は見ているカテゴリの中だけ。履歴は積まずに置き換える（何枚見ても戻る1回で Gallery へ）
 * - 「← Gallery」は Gallery から来たならブラウザの戻ると同じ動き（タブとスクロール位置が戻る）
 */
export function WorkDetail({ work, works }: { work: Work; works: Work[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [fromGallery, setFromGallery] = useState(false);

  useLayoutEffect(() => {
    setFilter(parseCategoryFilter(new URLSearchParams(window.location.search).get("category")));
    setFromGallery(cameFromGallery());
  }, []);

  const { prev, next, filter: effective } = getNeighbors(works, work.slug, filter);
  const go = (target: Work | null) =>
    target ? () => router.replace(workHref(target.slug, effective), { scroll: false }) : null;
  const onPrev = go(prev);
  const onNext = go(next);

  // 隣の作品のページと写真を先に読み込んでおく
  useEffect(() => {
    for (const w of [prev, next]) {
      if (!w) continue;
      router.prefetch(workHref(w.slug, effective));
      new Image().src = withBase(w.photo.src);
    }
  }, [prev, next, effective, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  return (
    <main className={styles.main}>
      <h1 className="visually-hidden">{work.photo.alt}</h1>
      <div className={styles.back}>
        <Link
          href={galleryHref(effective)}
          className={styles.backLink}
          onClick={(e) => {
            if (fromGallery && window.history.length > 1) {
              e.preventDefault();
              router.back();
            }
          }}
        >
          <span aria-hidden="true">←</span>Gallery
        </Link>
      </div>
      <div className={styles.viewer}>
        <PhotoViewer photo={work.photo} onPrev={onPrev} onNext={onNext} tone="light" />
      </div>
    </main>
  );
}
