import type { Category, CategoryDef } from "@/lib/categories";

export type Photo = {
  /** サイトに同梱した縮小済み画像のパス（basePath なし。例: /photos/xxx.jpg） */
  src: string;
  /** ビルド時に画像から自動取得 */
  width: number;
  height: number;
  alt: string;
  /** 一覧用の小さい写真（長辺1200px）。元が小さいときはない */
  thumb?: { src: string; width: number };
};

export type Work = {
  slug: string;
  category: Category;
  /** Themes のタグのスラッグ */
  tags: string[];
  photo: Photo;
};

/** トップの Themes（撮り続けている被写体）。Kuroco のタグ */
export type ThemeTag = {
  /** URL に使う値（Gallery の ?tag=） */
  slug: string;
  /** 日本語名（例: 廃墟） */
  name: string;
  /** 英語名（例: Ruins） */
  en: string;
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
  /** Themes のタグ（Kuroco の並び順。作品が1件もないタグは除く） */
  themes: ThemeTag[];
  works: Work[];
  /** MVに出す作品のスラッグ（表示順、ちょうど10件） */
  mainVisual: string[];
  profile: Profile;
  achievements: AchievementGroup[];
};
