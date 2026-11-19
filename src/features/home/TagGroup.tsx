"use client";

import Link from "next/link";
import { useState } from "react";
import { JustifiedRows } from "@/components/photo/JustifiedRows";
import { Lightbox } from "@/components/photo/Lightbox";
import { PhotoTile } from "@/components/photo/PhotoTile";
import { fixedRows } from "@/lib/rows";
import { tagGalleryHref } from "@/lib/works";
import type { ThemeTag, Work } from "@/types/content";
import styles from "./TagGroup.module.css";

/** タグ1つ分。PC は4枚を1行、SP は2枚ずつ。押すと拡大表示、「すべて見る」で Gallery の絞り込みへ */
export function TagGroup({ theme, works }: { theme: ThemeTag; works: Work[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const photos = works.map((w) => w.photo);
  const headingId = `theme-${theme.slug}`;

  return (
    <section aria-labelledby={headingId}>
      <div className={styles.head}>
        <h3 id={headingId} className={styles.heading}>
          <span className={styles.hash} aria-hidden="true">
            #
          </span>
          {theme.name}
          {theme.en && <span className={styles.en}>{theme.en}</span>}
        </h3>
        <Link href={tagGalleryHref(theme.slug)} className={styles.more}>
          すべて見る<span aria-hidden="true"> →</span>
          <span className="visually-hidden">（{theme.name}の写真）</span>
        </Link>
      </div>
      <JustifiedRows
        className={styles.rows}
        ratios={photos.map((p) => p.width / p.height)}
        pc={fixedRows(works.length, [4])}
        sp={fixedRows(works.length, [2])}
      >
        {works.map((w, i) => (
          <PhotoTile
            key={w.slug}
            photo={w.photo}
            label={`${w.photo.alt}を拡大して見る`}
            onClick={() => setIndex(i)}
          />
        ))}
      </JustifiedRows>
      <Lightbox photos={photos} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </section>
  );
}
