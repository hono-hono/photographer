import { describe, expect, it } from "vitest";
import { fixedRows, groupRows, rowEnds } from "./rows";

describe("groupRows", () => {
  it("縦横比の合計が目安に達したら改行する", () => {
    // 1.5 + 1.5 + 1.5 = 4.5 ≥ 4 → 3枚で1行
    expect(groupRows([1.5, 1.5, 1.5, 1.5, 1.5, 1.5], 4).counts).toEqual([3, 3]);
  });

  it("縦位置が多い行は枚数が増える", () => {
    expect(groupRows([0.67, 0.67, 0.67, 0.67, 0.67, 0.67], 4).counts).toEqual([6]);
  });

  it("最後の行が目安の6割未満なら伸ばさず、残りの幅を返す", () => {
    const layout = groupRows([1.5, 1.5, 1.5, 1], 4);
    expect(layout.counts).toEqual([3, 1]);
    expect(layout.lastRest).toBe(3);
  });

  it("最後の行が目安の6割以上なら幅いっぱいに伸ばす", () => {
    const layout = groupRows([2, 2, 1.5, 1], 4);
    expect(layout.counts).toEqual([2, 2]);
    expect(layout.lastRest).toBe(0);
  });

  it("写真がなければ行もない", () => {
    expect(groupRows([], 4)).toEqual({ counts: [], lastRest: 0 });
  });
});

describe("fixedRows", () => {
  it("MVの PC は 4・3・3", () => {
    expect(fixedRows(10, [4, 3, 3]).counts).toEqual([4, 3, 3]);
  });
  it("MVの SP は 2 × 5", () => {
    expect(fixedRows(10, [2]).counts).toEqual([2, 2, 2, 2, 2]);
  });
  it("枚数が足りなくても途中で止まる", () => {
    expect(fixedRows(5, [4, 3, 3]).counts).toEqual([4, 1]);
  });
});

describe("rowEnds", () => {
  it("行の切れ目の位置を返す（全体の最後は含めない）", () => {
    expect([...rowEnds({ counts: [4, 3, 3], lastRest: 0 })]).toEqual([3, 6]);
  });
});
