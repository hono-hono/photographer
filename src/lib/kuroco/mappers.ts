import {
  ACHIEVEMENT_GROUPS,
  ALL_FILTER,
  CATEGORY_SLUG_PATTERN,
  type Category,
  type CategoryDef,
} from "@/lib/categories";
import type { AchievementGroup } from "@/types/content";
import type { KurocoAchievement, KurocoCategory, KurocoProfile, KurocoWork } from "./types";

/**
 * Kuroco の生データ → サイト用のデータへの変換と検査。
 * 問題があれば errors に「何が・どの作品で」を日本語で入れる。errors が1件でもあればビルドを止める。
 */

/** 写真を縮小する前の作品データ（画像はまだ Kuroco のURL） */
export type WorkSource = {
  slug: string;
  category: Category;
  alt: string;
  imageUrl: string;
  /** 画像が変わったかどうかの判定に使う */
  version: string;
  mvOrder: number | null;
};

export type ProfileSource = {
  lead: string;
  history: string;
  portraitUrl: string;
  portraitAlt: string;
  version: string;
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MV_COUNT = 10;

/** Kuroco のテキストは HTML の文字参照で返ることがあるので、元の文字に戻す */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const clean = (v: unknown): string => (typeof v === "string" ? decodeEntities(v).trim() : "");

function imageUrlOf(file: KurocoWork["photo"]): string {
  return file?.url_org || file?.url || "";
}

function toOrder(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Kuroco の作品カテゴリ → サイトのタブ。並び順は Kuroco の表示順（大きい順）、同じなら登録順 */
export function mapCategories(raw: KurocoCategory[]): {
  categories: (CategoryDef & { id: number })[];
  errors: string[];
} {
  const errors: string[] = [];
  const seen = new Set<string>();
  const sorted = [...raw].sort(
    (a, b) =>
      (Number(b.category_weight) || 0) - (Number(a.category_weight) || 0) ||
      Number(a.topics_category_id) - Number(b.topics_category_id),
  );
  const categories: (CategoryDef & { id: number })[] = [];
  for (const c of sorted) {
    const label = clean(c.category_nm);
    const slug = clean(c.slug);
    const name = `カテゴリ「${label || c.topics_category_id}」`;
    if (!label) errors.push(`${name}: カテゴリ名が空です`);
    if (!slug) errors.push(`${name}: スラッグが空です（URL に使うので、英数字で入れてください。例: works）`);
    else if (!CATEGORY_SLUG_PATTERN.test(slug))
      errors.push(`${name}: スラッグ「${slug}」は英数字とアンダースコアだけにしてください`);
    else if (slug === ALL_FILTER.slug)
      errors.push(`${name}: スラッグ「all」は「すべて」のタブで使うので、別の名前にしてください`);
    else if (seen.has(slug)) errors.push(`${name}: スラッグ「${slug}」が他のカテゴリと重複しています`);
    if (slug) seen.add(slug);
    if (label && slug && CATEGORY_SLUG_PATTERN.test(slug) && slug !== ALL_FILTER.slug) {
      categories.push({ id: Number(c.topics_category_id), slug, label });
    }
  }
  if (raw.length === 0)
    errors.push("作品のカテゴリが1つもありません（［コンテンツ定義］→「作品」の［カテゴリ］で作ってください）");
  return { categories, errors };
}

export function mapWorks(
  raw: KurocoWork[],
  categories: { id: number; slug: Category }[],
): { works: WorkSource[]; errors: string[] } {
  const errors: string[] = [];
  const works: WorkSource[] = [];
  const seen = new Set<string>();
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));

  for (const item of raw) {
    const label = `作品「${clean(item.subject) || item.topics_id}」(topics_id ${item.topics_id})`;
    const slug = clean(item.slug);
    const categoryId = Number(item.contents_type);
    const category = slugById.get(categoryId);
    const alt = clean(item.alt);
    const imageUrl = imageUrlOf(item.photo);

    if (!slug) errors.push(`${label}: スラッグが空です`);
    else if (!SLUG_PATTERN.test(slug))
      errors.push(`${label}: スラッグ「${slug}」は英小文字・数字・ハイフンだけにしてください`);
    else if (seen.has(slug)) errors.push(`${label}: スラッグ「${slug}」が他の作品と重複しています`);
    if (!category) {
      errors.push(
        item.contents_type
          ? `${label}: カテゴリ「${clean(item.contents_type_nm) || categoryId}」が使えません（非公開か、スラッグが入っていない可能性があります）`
          : `${label}: カテゴリが選ばれていません`,
      );
    }
    if (!alt) errors.push(`${label}: 代替テキストが空です`);
    if (!imageUrl) errors.push(`${label}: 写真が登録されていません`);

    if (slug) seen.add(slug);
    if (!slug || !SLUG_PATTERN.test(slug) || !category || !alt || !imageUrl) continue;

    works.push({
      slug,
      category,
      alt,
      imageUrl,
      version: `${imageUrl}|${item.update_ymdhi ?? ""}`,
      mvOrder: item.mv ? toOrder(item.mv_order) : null,
    });
  }
  return { works, errors };
}

/** MVの作品を「MVの順番」で並べる。ちょうど10件で、順番が重複していないこと */
export function pickMainVisual(works: Pick<WorkSource, "slug" | "mvOrder">[]): { slugs: string[]; errors: string[] } {
  const errors: string[] = [];
  const picked = works.filter((w) => w.mvOrder !== null);
  const flagged = picked.length;

  if (flagged !== MV_COUNT) {
    errors.push(
      `MVに使う作品が ${flagged} 件あります。ちょうど ${MV_COUNT} 件にしてください（「MVに使う」と「MVの順番」を確認）`,
    );
  }
  const byOrder = new Map<number, string[]>();
  for (const w of picked) byOrder.set(w.mvOrder!, [...(byOrder.get(w.mvOrder!) ?? []), w.slug]);
  for (const [order, slugs] of byOrder) {
    if (slugs.length > 1) errors.push(`MVの順番 ${order} が重複しています: ${slugs.join(", ")}`);
  }

  const slugs = [...picked].sort((a, b) => a.mvOrder! - b.mvOrder!).map((w) => w.slug);
  return { slugs, errors };
}

export function mapAchievements(raw: KurocoAchievement[]): { groups: AchievementGroup[]; errors: string[] } {
  const errors: string[] = [];
  const groups: AchievementGroup[] = ACHIEVEMENT_GROUPS.map((g) => ({ key: g.key, label: g.label, items: [] }));
  for (const item of raw) {
    const text = clean(item.subject);
    const group = groups.find((g) => g.key === item.group?.key);
    if (!text) {
      errors.push(`実績 (topics_id ${item.topics_id}): 内容が空です`);
      continue;
    }
    if (!group) {
      errors.push(
        `実績「${text}」: 区分「${item.group?.key ?? "（空）"}」が受賞・選出 / 講演・活動 / 資格のどれでもありません`,
      );
      continue;
    }
    const date = clean(item.period);
    group.items.push(date ? { date, text } : { text });
  }
  return { groups: groups.filter((g) => g.items.length > 0), errors };
}

export function mapProfile(raw: KurocoProfile[]): { profile: ProfileSource | null; errors: string[] } {
  const item = raw[0];
  if (!item) return { profile: null, errors: ["プロフィールが1件も登録されていません"] };
  const errors: string[] = [];
  const lead = clean(item.lead);
  const history = clean(item.history);
  const portraitUrl = imageUrlOf(item.portrait);
  const portraitAlt = clean(item.portrait_alt);
  if (!lead) errors.push("プロフィール: リード文が空です");
  if (!history) errors.push("プロフィール: 写真歴が空です");
  if (!portraitUrl) errors.push("プロフィール: ポートレートが登録されていません");
  if (!portraitAlt) errors.push("プロフィール: ポートレートの代替テキストが空です");
  if (errors.length) return { profile: null, errors };
  return {
    profile: { lead, history, portraitUrl, portraitAlt, version: `${portraitUrl}|${item.update_ymdhi ?? ""}` },
    errors,
  };
}
