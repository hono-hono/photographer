/**
 * 写真を「高さをそろえた行」に分ける計算（設計書 7.1）。
 * 返すのは各行の枚数と、最後の行を伸ばさないときの「残りの幅（縦横比の単位）」だけ。
 */
export type RowLayout = {
  /** 各行の枚数 */
  counts: number[];
  /** 最後の行の右側に空ける幅（縦横比の合計の単位）。0 なら最後の行も幅いっぱい */
  lastRest: number;
};

/** 縦横比の合計が target に達したら改行する。最後の行が target の6割未満なら伸ばさない */
export function groupRows(ratios: number[], target: number): RowLayout {
  const counts: number[] = [];
  let count = 0;
  let sum = 0;
  for (const r of ratios) {
    count += 1;
    sum += r;
    if (sum >= target) {
      counts.push(count);
      count = 0;
      sum = 0;
    }
  }
  let lastRest = 0;
  if (count > 0) {
    counts.push(count);
    if (sum < target * 0.6) lastRest = round(target - sum);
  }
  return { counts, lastRest };
}

/** 枚数を決め打ちで分ける（MV: PC 4・3・3、SP 2×5） */
export function fixedRows(total: number, pattern: number[]): RowLayout {
  const counts: number[] = [];
  let left = total;
  let i = 0;
  while (left > 0) {
    const n = Math.min(pattern[i % pattern.length], left);
    counts.push(n);
    left -= n;
    i += 1;
  }
  return { counts, lastRest: 0 };
}

/** 行の最後の写真の位置（0始まり。全体の最後は含めない） */
export function rowEnds(layout: RowLayout): Set<number> {
  const ends = new Set<number>();
  let index = -1;
  layout.counts.slice(0, -1).forEach((n) => {
    index += n;
    ends.add(index);
  });
  return ends;
}

/** Gallery の行の目安（縦横比の合計） */
export const GALLERY_TARGET = { pc: 4.0, sp: 2.0 } as const;

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
