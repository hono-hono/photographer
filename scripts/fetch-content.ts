/**
 * ビルドの直前に実行する（npm run build の prebuild）。設計書 8章。
 *
 * 1. Kuroco API から作品・実績・プロフィールを取得する（KUROCO_API_TOKEN がなければ dummy-photos/ を使う）
 * 2. 写真をダウンロードして長辺2400pxに縮小し、public/photos/ に保存する。幅と高さもここで読み取る
 * 3. ページが読み込むデータを .content/content.json に書き出す
 *
 * 問題（MVが10件でない、代替テキストが空など）があれば、内容を表示してビルドを止める。
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fetchAchievements, fetchProfile, fetchWorks, kurocoConfigFromEnv } from "../src/lib/kuroco/client";
import {
  mapAchievements,
  mapProfile,
  mapWorks,
  pickMainVisual,
  type ProfileSource,
  type WorkSource,
} from "../src/lib/kuroco/mappers";
import type { AchievementGroup, Photo, SiteContent, Work } from "../src/types/content";
import { loadDummy } from "./dummy-content";

const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, ".content", "content.json");
const CACHE_JSON = path.join(ROOT, ".content", "images.json");
const PHOTO_DIR = path.join(ROOT, "public", "photos");
const LONG_EDGE = 2400;
const QUALITY = 80;
const CONCURRENCY = 4;

type ImageCache = Record<string, { version: string; width: number; height: number }>;

async function main() {
  const config = kurocoConfigFromEnv();
  const required = process.env.KUROCO_REQUIRED === "true";

  let works: WorkSource[];
  let profile: ProfileSource;
  let achievements: AchievementGroup[];
  let source: SiteContent["source"];
  const errors: string[] = [];

  if (config) {
    console.log(`[content] Kuroco から取得します: ${config.baseUrl}/rcms-api/${config.apiId}/`);
    const [rawWorks, rawAchievements, rawProfile] = await Promise.all([
      fetchWorks(config),
      fetchAchievements(config),
      fetchProfile(config),
    ]);
    const w = mapWorks(rawWorks);
    const a = mapAchievements(rawAchievements);
    const p = mapProfile(rawProfile);
    errors.push(...w.errors, ...a.errors, ...p.errors);
    works = w.works;
    achievements = a.groups;
    profile = p.profile!;
    source = "kuroco";
  } else {
    if (required) {
      fail(["KUROCO_API_TOKEN が設定されていません（GitHub の Settings → Secrets に登録してください）"]);
    }
    console.warn("[content] KUROCO_API_TOKEN がないため、dummy-photos/ のダミーデータで作ります");
    ({ works, profile, achievements } = loadDummy());
    source = "dummy";
  }

  const mv = pickMainVisual(works ?? []);
  errors.push(...mv.errors);
  if (errors.length) fail(errors);

  await mkdir(path.join(PHOTO_DIR, "works"), { recursive: true });
  await mkdir(path.join(PHOTO_DIR, "profile"), { recursive: true });
  const cache = await readCache();
  const nextCache: ImageCache = {};
  let processed = 0;

  const toPhoto = async (key: string, url: string, version: string, alt: string): Promise<Photo> => {
    const file = path.join(PHOTO_DIR, `${key}.jpg`);
    const hit = cache[key];
    let size: { width: number; height: number };
    if (hit && hit.version === version && existsSync(file)) {
      size = hit;
    } else {
      size = await resizeTo(await loadImage(url), file);
      processed += 1;
    }
    nextCache[key] = { version, ...size };
    const v = createHash("sha1").update(version).digest("hex").slice(0, 8);
    return { src: `/photos/${key}.jpg?v=${v}`, width: size.width, height: size.height, alt };
  };

  const siteWorks: Work[] = await mapLimit(works, CONCURRENCY, async (w) => ({
    slug: w.slug,
    category: w.category,
    photo: await toPhoto(`works/${w.slug}`, w.imageUrl, w.version, w.alt),
  }));
  const portrait = await toPhoto("profile/portrait", profile.portraitUrl, profile.version, profile.portraitAlt);

  await removeStale(nextCache);

  const content: SiteContent = {
    source,
    generatedAt: new Date().toISOString(),
    works: siteWorks,
    mainVisual: mv.slugs,
    profile: { lead: profile.lead, history: profile.history, portrait },
    achievements,
  };
  await mkdir(path.dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(content, null, 2));
  await writeFile(CACHE_JSON, JSON.stringify(nextCache, null, 2));
  console.log(
    `[content] 作品 ${siteWorks.length} 件（MV ${mv.slugs.length} 件）、実績 ${achievements.reduce((n, g) => n + g.items.length, 0)} 行。写真の縮小 ${processed} 枚（残りは前回のものを使用）`,
  );
}

async function loadImage(url: string): Promise<Buffer> {
  if (!/^https?:\/\//.test(url)) return readFile(url);
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (attempt >= 3) throw new Error(`写真をダウンロードできませんでした (${res.status}): ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function resizeTo(input: Buffer, file: string) {
  const info = await sharp(input)
    .rotate() // 縦横の向き情報（EXIF）を反映
    .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(file);
  return { width: info.width, height: info.height };
}

async function readCache(): Promise<ImageCache> {
  try {
    return JSON.parse(await readFile(CACHE_JSON, "utf8")) as ImageCache;
  } catch {
    return {};
  }
}

/** 削除・スラッグ変更された作品の古い写真を消す */
async function removeStale(keep: ImageCache) {
  for (const dir of ["works", "profile"]) {
    for (const name of await readdir(path.join(PHOTO_DIR, dir))) {
      const key = `${dir}/${name.replace(/\.jpg$/, "")}`;
      if (!keep[key]) await rm(path.join(PHOTO_DIR, dir, name));
    }
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

function fail(errors: string[]): never {
  console.error("\n[content] Kuroco のデータに問題があるため、ビルドを止めました。\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

main().catch((error) => {
  console.error("[content] データの取得に失敗しました");
  console.error(error);
  process.exit(1);
});
