import { describe, expect, it } from "vitest";
import { parseCategoryFilter, type Category } from "./categories";
import { filterWorks, getNeighbors, workHref } from "./works";

const w = (slug: string, category: Category) => ({ slug, category });
const works = [w("a", "works"), w("b", "family"), w("c", "works"), w("d", "anniversary"), w("e", "works")];

describe("filterWorks", () => {
  it("all はすべて", () => expect(filterWorks(works, "all")).toHaveLength(5));
  it("カテゴリで絞り込む", () => expect(filterWorks(works, "works").map((x) => x.slug)).toEqual(["a", "c", "e"]));
});

describe("getNeighbors", () => {
  it("同じカテゴリの中で前後を返す", () => {
    const n = getNeighbors(works, "c", "works");
    expect(n.prev?.slug).toBe("a");
    expect(n.next?.slug).toBe("e");
  });
  it("All では全作品の並びで前後を返す", () => {
    const n = getNeighbors(works, "c", "all");
    expect(n.prev?.slug).toBe("b");
    expect(n.next?.slug).toBe("d");
  });
  it("端ではループしない", () => {
    expect(getNeighbors(works, "a", "works").prev).toBeNull();
    expect(getNeighbors(works, "e", "works").next).toBeNull();
  });
  it("カテゴリが合わないときは All で探す", () => {
    const n = getNeighbors(works, "b", "works");
    expect(n.filter).toBe("all");
    expect(n.prev?.slug).toBe("a");
  });
});

describe("parseCategoryFilter", () => {
  it("不正な値や指定なしは all", () => {
    expect(parseCategoryFilter(null)).toBe("all");
    expect(parseCategoryFilter("WORKS")).toBe("all");
    expect(parseCategoryFilter("family")).toBe("family");
  });
});

describe("workHref", () => {
  it("All のときはクエリを付けない", () => {
    expect(workHref("a", "all")).toBe("/gallery/a");
    expect(workHref("a", "family")).toBe("/gallery/a?category=family");
  });
});
