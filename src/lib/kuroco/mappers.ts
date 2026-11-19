import {
  ACHIEVEMENT_GROUPS,
  ALL_FILTER,
  CATEGORY_SLUG_PATTERN,
  type Category,
  type CategoryDef,
} from "@/lib/categories";
import type { AchievementGroup } from "@/types/content";
import type { KurocoAchievement, KurocoCategory, KurocoMainVisual, KurocoProfile, KurocoTag, KurocoWork } from "./types";

/**
 * Kuroco の生データ → サイト用のデータへの変換と検査。
 * 問題があれば errors に「何が・どの作品で」を日本語で入れる。errors が1件でもあればビルドを止める。
 */

/** 写真を縮小する前の作品データ（画像はまだ Kuroco のURL） */
export type WorkSource = {
  /** Kuroco の topics_id（MV から作品を探すのに使う） */
  id: number;
  slug: string;
  category: Category;
  /** Themes のタグのスラッグ */
  tags: string[];
  alt: string;
  imageUrl: string;
  /** 画像が変わったかどうかの判定に使う */
  version: string;
};

/** MV の1件（コンテンツ定義「MV」）。workId は選んだ作品の topics_id */
export type MainVisualEntry = { label: string; workId: number | null };

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
    errors.push("作品のカテゴリが1つもありません（［コンテンツ定義］→「作品」の行の［カテゴリ設定］で作ってください）");
  return { categories, errors };
}

/** Kuroco のタグ（Themes） → サイトのテーマ。並び順はタグの並び順（大きい順）、同じなら ID 順 */
export function mapTags(raw: KurocoTag[]): { tags: { id: number; slug: string; name: string; en: string }[]; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const weight = (t: KurocoTag) => Number(t.weight ?? t.tag_weight ?? 0) || 0;
  const sorted = [...raw].sort((a, b) => weight(b) - weight(a) || Number(a.tag_id) - Number(b.tag_id));
  const tags: { id: number; slug: string; name: string; en: string }[] = [];
  for (const t of sorted) {
    const name = clean(t.tag_nm);
    const slug = clean(t.ext_col_02 ?? "");
    const en = clean(t.ext_col_01 ?? "");
    const label = `タグ「${name || t.tag_id}」`;
    if (!slug) errors.push(`${label}: 項目2（スラッグ）が空です（URL に使うので、英小文字で入れてください。例: ruins）`);
    else if (!SLUG_PATTERN.test(slug)) errors.push(`${label}: スラッグ「${slug}」は英小文字・数字・ハイフンだけにしてください`);
    else if (seen.has(slug)) errors.push(`${label}: スラッグ「${slug}」がほかのタグと重複しています`);
    if (!slug || !SLUG_PATTERN.test(slug) || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ id: Number(t.tag_id), slug, name, en });
  }
  return { tags, errors };
}

export function mapWorks(
  raw: KurocoWork[],
  categories: { id: number; slug: Category; label?: string }[],
  tags: { id: number; slug: string }[] = [],
): { works: WorkSource[]; errors: string[] } {
  const tagSlugById = new Map(tags.map((t) => [t.id, t.slug]));
  const errors: string[] = [];
  const works: WorkSource[] = [];
  const seen = new Set<string>();
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  const labelById = new Map(categories.map((c) => [c.id, c.label]));

  for (const item of raw) {
    const label = `作品「${clean(item.subject) || item.topics_id}」(topics_id ${item.topics_id})`;
    const slug = clean(item.slug);
    const categoryId = Number(item.contents_type);
    const category = slugById.get(categoryId);
    // 代替テキストは任意。空のときは「hono の写真（カテゴリ名）」で補う
    const alt = clean(item.alt) || `hono の写真（${labelById.get(categoryId) ?? "作品"}）`;
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
    if (!imageUrl) errors.push(`${label}: 写真が登録されていません`);

    if (slug) seen.add(slug);
    if (!slug || !SLUG_PATTERN.test(slug) || !category || !imageUrl) continue;

    works.push({
      id: Number(item.topics_id),
      slug,
      category,
      tags: (item.tags ?? [])
        .map((t) => tagSlugById.get(Number(t.tag_id)))
        .filter((s): s is string => Boolean(s)),
      alt,
      imageUrl,
      version: `${imageUrl}|${item.update_ymdhi ?? ""}`,
    });
  }
  return { works, errors };
}

export function mapMainVisual(raw: KurocoMainVisual[]): MainVisualEntry[] {
  return raw.map((item) => {
    const id = Number(item.work?.module_id);
    return {
      label: clean(item.subject) || `topics_id ${item.topics_id}`,
      workId: Number.isFinite(id) && id > 0 ? id : null,
    };
  });
}

/**
 * MV の作品を、コンテンツ定義「MV」に登録した順で並べる。
 * ちょうど10件で、どれも公開中の作品を選んでいて、同じ作品が重なっていないこと。
 */
export function pickMainVisual(
  entries: MainVisualEntry[],
  works: Pick<WorkSource, "id" | "slug">[],
): { slugs: string[]; errors: string[] } {
  const errors: string[] = [];
  if (entries.length !== MV_COUNT) {
    errors.push(
      `MV が ${entries.length} 件です。ちょうど ${MV_COUNT} 件にしてください（［コンテンツ定義］→「MV」の一覧）`,
    );
  }
  const slugById = new Map(works.map((w) => [w.id, w.slug]));
  const slugs: string[] = [];
  for (const e of entries) {
    const slug = e.workId === null ? undefined : slugById.get(e.workId);
    if (e.workId === null) errors.push(`MV「${e.label}」: 作品が選ばれていません`);
    else if (!slug) errors.push(`MV「${e.label}」: 選んだ作品が非公開か、使えない状態です`);
    else if (slugs.includes(slug)) errors.push(`MV「${e.label}」: 同じ作品（${slug}）がほかの MV でも選ばれています`);
    else slugs.push(slug);
  }
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
