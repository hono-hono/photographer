"use client";

import { withBase } from "@/lib/site";
import type { Photo } from "@/types/content";
import styles from "./PhotoViewer.module.css";

type Props = {
  photo: Photo;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  /** 拡大表示は暗い面、作品詳細は通常の背景 */
  tone: "light" | "dark";
};

/**
 * 写真を画面の高さに収めて大きく表示する（縦位置も横位置も切らない）。
 * PC は写真の左右に矢印、SP は写真の下に Prev / Next。切り替えの演出はなし。
 * 矢印キーは親（Lightbox / WorkDetail）で受け取る。
 */
export function PhotoViewer({ photo, onPrev, onNext, tone }: Props) {
  return (
    <div className={`${styles.viewer} ${tone === "dark" ? styles.dark : styles.light}`}>
      <ArrowButton direction="prev" onClick={onPrev} />
      <div className={styles.stage} data-photo-stage>
        {/* eslint-disable-next-line @next/next/no-img-element -- 静的書き出しのため */}
        <img
          key={photo.src}
          className={styles.img}
          src={withBase(photo.src)}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          decoding="async"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        />
      </div>
      <ArrowButton direction="next" onClick={onNext} />
      <div className={styles.spNav}>
        <button type="button" className={styles.textButton} onClick={onPrev ?? undefined} disabled={!onPrev}>
          <span aria-hidden="true">← </span>Prev<span className="visually-hidden">（前の写真）</span>
        </button>
        <button type="button" className={styles.textButton} onClick={onNext ?? undefined} disabled={!onNext}>
          Next<span aria-hidden="true"> →</span>
          <span className="visually-hidden">（次の写真）</span>
        </button>
      </div>
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: "prev" | "next"; onClick: (() => void) | null }) {
  const d = direction === "prev" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19";
  return (
    <button
      type="button"
      className={styles.arrow}
      aria-label={direction === "prev" ? "前の写真" : "次の写真"}
      onClick={onClick ?? undefined}
      disabled={!onClick}
    >
      <svg
        aria-hidden="true"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </button>
  );
}
