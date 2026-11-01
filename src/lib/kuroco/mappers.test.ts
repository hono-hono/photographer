import { describe, expect, it } from "vitest";
import { decodeEntities, mapAchievements, mapProfile, mapWorks, pickMainVisual } from "./mappers";
import type { KurocoWork } from "./types";

const work = (id: number, over: Partial<KurocoWork> = {}): KurocoWork => ({
  topics_id: id,
  subject: `作品${id}`,
  slug: `place-${String(id).padStart(2, "0")}`,
  category: { key: "works", label: "Works" },
  photo: { url: `https://example.com/${id}.jpg` },
  alt: "説明",
  mv: false,
  mv_order: null,
  ...over,
});

describe("mapWorks", () => {
  it("正しい作品を変換する", () => {
    const { works, errors } = mapWorks([work(1, { mv: true, mv_order: 3 })]);
    expect(errors).toEqual([]);
    expect(works[0]).toMatchObject({ slug: "place-01", category: "works", alt: "説明", mvOrder: 3 });
  });

  it("MVに使わない作品は順番を無視する", () => {
    expect(mapWorks([work(1, { mv: false, mv_order: 3 })]).works[0].mvOrder).toBeNull();
  });

  it("スラッグの重複・形式、代替テキスト、カテゴリ、写真の欠けを知らせる", () => {
    const { errors } = mapWorks([
      work(1),
      work(2, { slug: "place-01" }),
      work(3, { slug: "Place 03" }),
      work(4, { alt: "  " }),
      work(5, { category: { key: "other", label: "?" } }),
      work(6, { photo: null }),
    ]);
    expect(errors).toHaveLength(5);
    expect(errors.join("\n")).toMatch(/重複/);
    expect(errors.join("\n")).toMatch(/英小文字/);
    expect(errors.join("\n")).toMatch(/代替テキスト/);
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
