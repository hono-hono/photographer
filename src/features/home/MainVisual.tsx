"use client";

import { useCallback, useEffect, useState } from "react";
import { Lightbox } from "@/components/photo/Lightbox";
import { withBase } from "@/lib/site";
import type { Work } from "@/types/content";
import styles from "./MainVisual.module.css";

/** 1枚を見せる時間（ミリ秒） */
const INTERVAL = 6000;

/**
 * 画面幅いっぱいの MV（2026-11-19 のデザイン）。
 * - 写真は切らずに全体を見せる（余った部分は濃いグレー）
 * - 6秒ごとにゆっくり切り替え。点を押すとその写真へ
 * - マウスを乗せている間・キーボードで触っている間・タブが裏にある間・
 *   「動きを減らす」設定のときは自動で切り替えない
 * - 写真を押すと拡大表示（前後移動は MV の写真の中だけ）
 */
export function MainVisual({ works }: { works: Work[] }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = works.map((w) => w.photo);
  const count = works.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const paused = hovered || focused || reduced || lightbox !== null || count < 2;

  // current を依存に入れて、点を押したときも6秒数え直す
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) setCurrent((c) => (c + 1) % count);
    }, INTERVAL);
    return () => window.clearTimeout(t);
  }, [paused, current, count]);

  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
  }, []);

  if (count === 0) return null;

  return (
    <section
      className={styles.mv}
      aria-roledescription="カルーセル"
      aria-label="代表作"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div className={styles.slides}>
        {works.map((w, i) => {
          const active = i === current;
          return (
            <button
              key={w.slug}
              type="button"
              className={styles.slide}
              data-active={active || undefined}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              aria-label={`${w.photo.alt}を拡大して見る（${i + 1} / ${count}）`}
              onClick={() => setLightbox(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 静的書き出しのため */}
              <img
                className={styles.img}
                src={withBase(w.photo.src)}
                srcSet={
                  w.photo.thumb
                    ? `${withBase(w.photo.thumb.src)} ${w.photo.thumb.width}w, ${withBase(w.photo.src)} ${w.photo.width}w`
                    : undefined
                }
                sizes={w.photo.thumb ? "100vw" : undefined}
                alt=""
                width={w.photo.width}
                height={w.photo.height}
                // 1枚目はすぐ、2枚目以降は後から読む
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                decoding="async"
              />
            </button>
          );
        })}
      </div>

      {count > 1 && (
        <div className={styles.dots}>
          {works.map((w, i) => (
            <button
              key={w.slug}
              type="button"
              className={styles.dot}
              aria-label={`${i + 1}枚目の写真を表示`}
              aria-current={i === current || undefined}
              onClick={() => setCurrent(i)}
            >
              <span className={styles.bar} />
            </button>
          ))}
        </div>
      )}

      <Lightbox photos={photos} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
