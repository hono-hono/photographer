import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
};

/** 静かな404。トップへのリンクだけ */
export default function NotFound() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>ページが見つかりません</h1>
      <p className={styles.text}>お探しのページは、移動または削除された可能性があります。</p>
      <p className={styles.link}>
        <Link href="/">トップへ戻る</Link>
      </p>
    </main>
  );
}
