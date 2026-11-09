import type { Category, CategoryDef } from "@/lib/categories";

export type Photo = {
  /** サイトに同梱した縮小済み画像のパス（basePath なし。例: /photos/xxx.jpg） */
  src: string;
  /** ビルド時に画像から自動取得 */
  width: number;
  height: number;
  alt: string;
};

export type Work = {
  slug: string;
  category: Category;
  photo: Photo;
};

export type Profile = {
  lead: string;
  history: string;
  portrait: Photo;
};

export type Achievement = { date?: string; text: string };
export type AchievementGroup = { key: string; label: string; items: Achievement[] };

/** ビルド前のスクリプトが書き出し、ページが読み込むデータ一式 */
export type SiteContent = {
  source: "kuroco" | "dummy";
  generatedAt: string;
  /** Gallery のタブ（Kuroco のカテゴリの表示順。作品が1件もないカテゴリは除く） */
  categories: CategoryDef[];
  works: Work[];
  /** MVに出す作品のスラッグ（表示順、ちょうど10件） */
  mainVisual: string[];
  profile: Profile;
  achievements: AchievementGroup[];
};
