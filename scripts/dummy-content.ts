/**
 * KUROCO_API_TOKEN がないとき（手元での確認用）に使うダミーのデータ。
 * 写真は dummy-photos/、文章はサイト仕様書 5.4 で決めた文面（Kuroco に登録したものと同じ）。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { AchievementGroup } from "../src/types/content";
import type { ProfileSource, WorkSource } from "../src/lib/kuroco/mappers";
import type { CategoryDef } from "../src/lib/categories";

type Manifest = {
  works: { slug: string; category: string; file: string; alt: string }[];
  mainVisual: string[];
  portrait: { file: string; alt: string };
};

const DIR = path.join(process.cwd(), "dummy-photos");

const DUMMY_CATEGORIES: CategoryDef[] = [
  { slug: "works", label: "Works" },
  { slug: "family", label: "Family" },
  { slug: "anniversary", label: "Anniversary" },
];

export function loadDummy(): {
  categories: CategoryDef[];
  works: WorkSource[];
  profile: ProfileSource;
  achievements: AchievementGroup[];
} {
  const manifest = JSON.parse(readFileSync(path.join(DIR, "manifest.json"), "utf8")) as Manifest;
  const works: WorkSource[] = manifest.works.map((w) => {
    if (!DUMMY_CATEGORIES.some((c) => c.slug === w.category))
      throw new Error(`dummy-photos: カテゴリが不正です (${w.slug})`);
    const mvIndex = manifest.mainVisual.indexOf(w.slug);
    return {
      slug: w.slug,
      category: w.category,
      alt: w.alt,
      imageUrl: path.join(DIR, w.file),
      version: `dummy|${w.file}`,
      mvOrder: mvIndex === -1 ? null : mvIndex + 1,
    };
  });

  return {
    categories: DUMMY_CATEGORIES,
    works,
    profile: {
      lead: "そこにいた人の気配や、営まれていた暮らしを想像できる風景に惹かれています。写真を見る人にも、その場所に流れていた時間を感じてもらえたらうれしいです。",
      history:
        "2013年に撮影を始めました。派手な絶景よりも、廃線や廃墟、古い建物に残された空気や物語を、静かに記録することを大切にしています。",
      portraitUrl: path.join(DIR, manifest.portrait.file),
      portraitAlt: manifest.portrait.alt,
      version: `dummy|${manifest.portrait.file}`,
    },
    achievements: [
      {
        key: "awards",
        label: "受賞・選出",
        items: [
          { date: "2025年5月", text: "第63回 富士フイルムフォトコンテスト 最終選考通過" },
          { date: "2023年10月", text: "若手写真家支援写真展 2023年度/2025年度 ファイナリスト" },
          { text: "OM・新人写真家発掘プロジェクト・ライムライト ファイナリスト" },
          { text: "第23回全動物写真コンテスト 準優秀賞" },
          { text: "GANREF TODAY'S PHOTO 選出" },
        ],
      },
      {
        key: "talks",
        label: "講演・活動",
        items: [
          { date: "現在", text: "カメラのキタムラ写真教室 岡山版 現役アシスタント" },
          { date: "2023年12月", text: "OM SYSTEM GALLERY 刻景 × 私の未来は（講演）" },
        ],
      },
      { key: "qualifications", label: "資格", items: [{ text: "フォトマスター検定 2級" }] },
    ],
  };
}
