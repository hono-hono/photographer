import { Children, Fragment, type ReactNode } from "react";
import { rowEnds, type RowLayout } from "@/lib/rows";
import styles from "./JustifiedRows.module.css";

type Props = {
  /** 各写真の縦横比（幅÷高さ）。children と同じ順 */
  ratios: number[];
  /** PC（768px以上）と SP の行の分け方 */
  pc: RowLayout;
  sp: RowLayout;
  children: ReactNode;
  className?: string;
};

/**
 * 高さをそろえた行で写真を並べる（設計書 7.1）。
 * 1行の中で各写真の伸び率を縦横比にすると、高さが自然にそろい、行の両端もそろう。
 * HTML は1種類で、行の切れ目に「PCだけ」「SPだけ」で効く改行用の要素を挟む。
 */
export function JustifiedRows({ ratios, pc, sp, children, className }: Props) {
  const items = Children.toArray(children);
  const pcEnds = rowEnds(pc);
  const spEnds = rowEnds(sp);

  return (
    <div className={[styles.rows, className].filter(Boolean).join(" ")}>
      {items.map((child, i) => {
        const brPc = pcEnds.has(i);
        const brSp = spEnds.has(i);
        const breakClass =
          brPc && brSp
            ? styles.break
            : brPc
              ? `${styles.break} ${styles.pcOnly}`
              : brSp
                ? `${styles.break} ${styles.spOnly}`
                : null;
        return (
          <Fragment key={i}>
            <div className={styles.item} style={{ "--r": ratios[i] } as React.CSSProperties}>
              {child}
            </div>
            {breakClass && <div aria-hidden="true" className={breakClass} />}
          </Fragment>
        );
      })}
      {/* 最後の行が短いときは伸ばさず、右側を空ける */}
      {pc.lastRest > 0 && (
        <div
          aria-hidden="true"
          className={`${styles.rest} ${styles.pcOnly}`}
          style={{ "--r": pc.lastRest } as React.CSSProperties}
        />
      )}
      {sp.lastRest > 0 && (
        <div
          aria-hidden="true"
          className={`${styles.rest} ${styles.spOnly}`}
          style={{ "--r": sp.lastRest } as React.CSSProperties}
        />
      )}
    </div>
  );
}
