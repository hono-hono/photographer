import type { Category, CategoryFilter } from "./categories";

type HasCategory = { slug: string; category: Category };

export function filterWorks<T extends HasCategory>(works: T[], filter: CategoryFilter): T[] {
  return filter === "all" ? works : works.filter((w) => w.category === filter);
}

/**
 * 同じカテゴリの中で前後の作品を返す（端では null。ループしない）。
 * 見ている作品がそのカテゴリに入っていなければ All の中で探す。
 */
export function getNeighbors<T extends HasCategory>(
  works: T[],
  slug: string,
  filter: CategoryFilter,
): { prev: T | null; next: T | null; filter: CategoryFilter } {
  let effective = filter;
  let list = filterWorks(works, effective);
  let index = list.findIndex((w) => w.slug === slug);
  if (index === -1 && effective !== "all") {
    effective = "all";
    list = works;
    index = list.findIndex((w) => w.slug === slug);
  }
  if (index === -1) return { prev: null, next: null, filter: effective };
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
    filter: effective,
  };
}

/** 作品詳細のURL（basePath なし。next/link や router に渡す） */
export function workHref(slug: string, filter: CategoryFilter): string {
  return `/gallery/${slug}${filter === "all" ? "" : `?category=${filter}`}`;
}

export function galleryHref(filter: CategoryFilter): string {
  return `/gallery?category=${filter}`;
}
