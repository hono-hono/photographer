/** 作品のカテゴリ（Gallery のタブ）。Kuroco の「作品」の category の値と同じ */
export const CATEGORIES = ["works", "family", "anniversary"] as const;
export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = Category | "all";

export const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "works", label: "Works" },
  { value: "family", label: "Family" },
  { value: "anniversary", label: "Anniversary" },
];

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

/** URL の ?category= の値を検証する。不正な値や指定なしは all */
export function parseCategoryFilter(value: string | null | undefined): CategoryFilter {
  return isCategory(value) ? value : "all";
}

/** 実績の区分。サイトでの並び順もこの順に固定する */
export const ACHIEVEMENT_GROUPS = [
  { key: "awards", label: "受賞・選出" },
  { key: "talks", label: "講演・活動" },
  { key: "qualifications", label: "資格" },
] as const;
export type AchievementGroupKey = (typeof ACHIEVEMENT_GROUPS)[number]["key"];
