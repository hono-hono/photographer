import Link from "next/link";
import { withBase } from "@/lib/site";
import type { Photo } from "@/types/content";
import styles from "./PhotoTile.module.css";

type Common = {
  photo: Photo;
  /** 読み込みを優先する（MVの最初の行など） */
  priority?: boolean;
  /** 押したときの動きを伝える読み上げ用の文 */
  label: string;
};

type Props =
  | (Common & { href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void })
  | (Common & { href?: undefined; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void });

/** 1枚分の写真。角丸・ホバー演出なし。押すと作品詳細へ移動、または拡大表示 */
export function PhotoTile(props: Props) {
  const { photo, priority, label } = props;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- 静的書き出しのため Next.js の画像最適化は使わない
    <img
      className={styles.img}
      src={withBase(photo.src)}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
    />
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={styles.tile} aria-label={label} onClick={props.onClick} scroll>
        {img}
      </Link>
    );
  }
  return (
    <button type="button" className={styles.tile} aria-label={label} onClick={props.onClick}>
      {img}
    </button>
  );
}
