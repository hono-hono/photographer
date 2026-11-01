"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { JustifiedRows } from "@/components/photo/JustifiedRows";
import { PhotoTile } from "@/components/photo/PhotoTile";
import { CATEGORY_FILTERS, parseCategoryFilter, type CategoryFilter } from "@/lib/categories";
import { rememberGallery, takeGalleryScroll } from "@/lib/navigation";
import { GALLERY_TARGET, groupRows } from "@/lib/rows";
import { filterWorks, workHref } from "@/lib/works";
import type { Work } from "@/types/content";
import styles from "./GalleryTabs.module.css";

/**
 * Gallery のタブと写真の並び（設計書 7.3）。
 * - URL の ?category= と連動する（押すたびに履歴は増やさず、置き換える）
 * - 切り替えは演出なしで、瞬時に絞り込む
 * - ARIA の tablist / tab / tabpanel。←→ でタブ間を移動、Home / End で先頭・末尾へ
 */
export function GalleryTabs({ works }: { works: Work[] }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [ready, setReady] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 静的に書き出した HTML は All の状態。ブラウザで URL を読んでから絞り込む
  useLayoutEffect(() => {
    setFilter(parseCategoryFilter(new URLSearchParams(window.location.search).get("category")));
    setReady(true);
  }, []);

  // 作品詳細からブラウザの戻るで帰ってきたら、スクロール位置を戻す
  useEffect(() => {
    if (!ready) return;
    const y = takeGalleryScroll();
    if (y !== null) requestAnimationFrame(() => window.scrollTo(0, y));
  }, [ready]);

  const select = (next: CategoryFilter, focus = false) => {
    setFilter(next);
    const url = new URL(window.location.href);
    url.searchParams.set("category", next);
    window.history.replaceState(window.history.state, "", url);
    if (focus) tabRefs.current[CATEGORY_FILTERS.findIndex((t) => t.value === next)]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = CATEGORY_FILTERS.length - 1;
    const to =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (to === null) return;
    e.preventDefault();
    select(CATEGORY_FILTERS[to].value, true);
  };

  const shown = filterWorks(works, filter);
  const ratios = shown.map((w) => w.photo.width / w.photo.height);

  return (
    <>
      <div role="tablist" aria-label="カテゴリ" className={styles.tablist}>
        {CATEGORY_FILTERS.map((tab, i) => {
          const selected = tab.value === filter;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${tab.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="gallery-panel"
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => select(tab.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id="gallery-panel"
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        className={styles.panel}
        data-ready={ready || undefined}
      >
        {shown.length === 0 ? (
          <p className={styles.empty}>まだ写真がありません。</p>
        ) : (
          <JustifiedRows
            key={filter}
            ratios={ratios}
            pc={groupRows(ratios, GALLERY_TARGET.pc)}
            sp={groupRows(ratios, GALLERY_TARGET.sp)}
          >
            {shown.map((w, i) => (
              <PhotoTile
                key={w.slug}
                photo={w.photo}
                label={`${w.photo.alt}（作品のページへ）`}
                href={workHref(w.slug, filter)}
                priority={i < 4}
                onClick={rememberGallery}
              />
            ))}
          </JustifiedRows>
        )}
      </div>
      <noscript>
        <style>{`#gallery-panel{visibility:visible!important}`}</style>
      </noscript>
    </>
  );
}
