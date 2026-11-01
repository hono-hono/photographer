import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { AchievementGroup, Profile, SiteContent, Work } from "@/types/content";

/**
 * ページがデータを受け取る唯一の窓口。
 * 中身は scripts/fetch-content.ts（ビルドの直前に実行）が書き出した .content/content.json。
 * 同じビルドの中で何度呼ばれても、ファイルを読むのは1回だけ。
 */
let cached: SiteContent | null = null;

function load(): SiteContent {
  if (cached) return cached;
  const file = path.join(process.cwd(), ".content", "content.json");
  try {
    cached = JSON.parse(readFileSync(file, "utf8")) as SiteContent;
  } catch {
    throw new Error(
      ".content/content.json がありません。先に `npm run content` を実行してください（npm run dev / build では自動で実行されます）",
    );
  }
  return cached;
}

export function getWorks(): Work[] {
  return load().works;
}

export function getWork(slug: string): Work | undefined {
  return load().works.find((w) => w.slug === slug);
}

export function getMainVisual(): Work[] {
  const works = load().works;
  return load()
    .mainVisual.map((slug) => works.find((w) => w.slug === slug))
    .filter((w): w is Work => Boolean(w));
}

export function getProfile(): Profile {
  return load().profile;
}

export function getAchievements(): AchievementGroup[] {
  return load().achievements;
}
