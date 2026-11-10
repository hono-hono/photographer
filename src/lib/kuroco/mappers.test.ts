import { describe, expect, it } from "vitest";
import { decodeEntities, mapAchievements, mapCategories, mapProfile, mapWorks, pickMainVisual } from "./mappers";
import type { KurocoWork } from "./types";

const work = (id: number, over: Partial<KurocoWork> = {}): KurocoWork => ({
  topics_id: id,
  subject: `作品${id}`,
  slug: `place-${String(id).padStart(2, "0")}`,
  contents_type: 15,
  photo: { url: `https://example.com/${id}.jpg` },
  alt: "説明",
  mv: false,
  mv_order: null,
  ...over,
});

const CATS = [
  { id: 15, slug: "works" },
  { id: 18, slug: "family" },
];

describe("mapCategories", () => {
  it("表示順（大きい順）に並べ、同じなら登録順", () => {
    const { categories, errors } = mapCategories([
      { topics_category_id: 19, category_nm: "Anniversary", slug: "anniversary", category_weight: 10 },
      { topics_category_id: 15, category_nm: "Works", slug: "works", category_weight: 30 },
      { topics_category_id: 18, category_nm: "Family", slug: "family", category_weight: 20 },
      { topics_category_id: 20, category_nm: "Travel", slug: "travel", category_weight: 10 },
    ]);
    expect(errors).toEqual([]);
    expect(categories.map((c) => c.slug)).toEqual(["works", "family", "anniversary", "travel"]);
    expect(categories[0]).toEqual({ id: 15, slug: "works", label: "Works" });
  });

  it("スラッグの空欄・形式・重複・all を知らせる", () => {
    const { errors } = mapCategories([
      { topics_category_id: 1, category_nm: "A", slug: "" },
      { topics_category_id: 2, category_nm: "B", slug: "b-c" },
      { topics_category_id: 3, category_nm: "C", slug: "all" },
      { topics_category_id: 4, category_nm: "D", slug: "dup" },
      { topics_category_id: 5, category_nm: "E", slug: "dup" },
    ]);
    expect(errors).toHaveLength(4);
  });

  it("カテゴリが1つもなければ知らせる", () => {
    expect(mapCategories([]).errors[0]).toMatch(/1つもありません/);
  });
});

describe("mapWorks", () => {
  it("正しい作品を変換する", () => {
    const { works, errors } = mapWorks([work(1, { mv: true, mv_order: 3 })], CATS);
    expect(errors).toEqual([]);
    expect(works[0]).toMatchObject({ slug: "place-01", category: "works", alt: "説明", mvOrder: 3 });
  });

  it("カテゴリ ID をスラッグに変える", () => {
    expect(mapWorks([work(1, { contents_type: 18 })], CATS).works[0].category).toBe("family");
  });

  it("カテゴリが選ばれていない作品を知らせる", () => {
    expect(mapWorks([work(1, { contents_type: null })], CATS).errors[0]).toMatch(/選ばれていません/);
  });

  it("代替テキストが空ならカテゴリ名で補う", () => {
    const { works, errors } = mapWorks([work(1, { alt: "  " })], CATS);
    expect(errors).toEqual([]);
    expect(works[0].alt).toMatch(/^hono の写真（.+）$/);
  });

  it("MVに使わない作品は順番を無視する", () => {
    expect(mapWorks([work(1, { mv: false, mv_order: 3 })], CATS).works[0].mvOrder).toBeNull();
  });

  it("スラッグの重複・形式、カテゴリ、写真の欠けを知らせる", () => {
    const { errors } = mapWorks(
      [
        work(1),
        work(2, { slug: "place-01" }),
        work(3, { slug: "Place 03" }),
        work(5, { contents_type: 99, contents_type_nm: "非公開" }),
        work(6, { photo: null }),
      ],
      CATS,
    );
    expect(errors).toHaveLength(4);
    expect(errors.join("\n")).toMatch(/重複/);
    expect(errors.join("\n")).toMatch(/英小文字/);
    expect(errors.join("\n")).toMatch(/カテゴリ/);
    expect(errors.join("\n")).toMatch(/写真/);
  });
});

describe("pickMainVisual", () => {
  const ten = Array.from({ length: 10 }, (_, i) => ({ slug: `s${i}`, mvOrder: 10 - i }));

  it("MVの順番で並べる", () => {
    const { slugs, errors } = pickMainVisual(ten);
    expect(errors).toEqual([]);
    expect(slugs[0]).toBe("s9");
  });

  it("10件でなければ知らせる", () => {
    expect(pickMainVisual(ten.slice(0, 9)).errors[0]).toMatch(/9 件/);
  });

  it("順番の重複を知らせる", () => {
    const dup = ten.map((w, i) => (i === 0 ? { ...w, mvOrder: 1 } : w));
    expect(pickMainVisual(dup).errors.join()).toMatch(/重複/);
  });
});

describe("mapAchievements", () => {
  it("区分ごとにまとめ、区分は決まった順に並べる", () => {
    const { groups, errors } = mapAchievements([
      { topics_id: 1, subject: "資格A", group: { key: "qualifications", label: "資格" } },
      { topics_id: 2, subject: "賞B", group: { key: "awards", label: "受賞・選出" }, period: "2025年5月" },
    ]);
    expect(errors).toEqual([]);
    expect(groups.map((g) => g.key)).toEqual(["awards", "qualifications"]);
    expect(groups[0].items[0]).toEqual({ date: "2025年5月", text: "賞B" });
    expect(groups[1].items[0]).toEqual({ text: "資格A" });
  });
});

describe("mapProfile", () => {
  it("欠けている項目を知らせる", () => {
    expect(mapProfile([{ topics_id: 1, subject: "p", lead: "a" }]).errors).toHaveLength(3);
    expect(mapProfile([]).errors[0]).toMatch(/1件も/);
  });
});

describe("decodeEntities", () => {
  it("文字参照を戻す", () => {
    expect(decodeEntities("TODAY&#039;S &amp; &lt;b&gt;")).toBe("TODAY'S & <b>");
  });
});
