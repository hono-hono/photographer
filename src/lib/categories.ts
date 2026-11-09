/**
 * 作品のカテゴリ（Gallery のタブ）。
 * 種類・表示名・並び順は Kuroco の「作品」の標準カテゴリで管理する（コードには持たない）。
 * URL の ?category= にはカテゴリのスラッグを使う。
 */
export type Category = string;
export type CategoryFilter = Category | "all";

export type CategoryDef = {
  /** URL に使う値（Kuroco のカテゴリのスラッグ） */
  slug: string;
  /** タブの表示名（Kuroco のカテゴリ名） */
  label: string;
};

export const ALL_FILTER = { slug: "all", label: "All" } as const;

/** Kuroco のカテゴリのスラッグとして使える形（英数字・アンダースコア。all は予約） */
export const CATEGORY_SLUG_PATTERN = /^[A-Za-z0-9_]+$/;

/** URL の ?category= の値を検証する。知らない値や指定なしは all */
export function parseCategoryFilter(value: string | null | undefined, categories: CategoryDef[]): CategoryFilter {
  return value && categories.some((c) => c.slug === value) ? value : "all";
}

/** 実績の区分。サイトでの並び順もこの順に固定する */
export const ACHIEVEMENT_GROUPS = [
  { key: "awards", label: "受賞・選出" },
  { key: "talks", label: "講演・活動" },
  { key: "qualifications", label: "資格" },
] as const;
export type AchievementGroupKey = (typeof ACHIEVEMENT_GROUPS)[number]["key"];
