"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import styles from "./Header.module.css";

/**
 * 画面上部に固定するヘッダー。背景色＋下端の罫線。
 * トップでは MV に重なっている間だけ背景を透かし、文字を白にする（MV に没入できるように）。
 * MV を過ぎたら、いつもの背景色に戻る。
 */
export function Header() {
  const isTop = usePathname() === "/";
  // 書き出した HTML でも最初から透かしておく（読み込み時のちらつきを防ぐ）
  const [overMv, setOverMv] = useState(isTop);

  useEffect(() => {
    if (!isTop) {
      setOverMv(false);
      return;
    }
    const mv = document.querySelector<HTMLElement>("[data-mv]");
    if (!mv) {
      setOverMv(false);
      return;
    }
    const update = () => {
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 48;
      setOverMv(mv.getBoundingClientRect().bottom > headerH);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isTop]);

  return (
    <header className={styles.header} data-overlay={(isTop && overMv) || undefined}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          hono
        </Link>
        <NavLinks />
        <MobileMenu />
      </div>
    </header>
  );
}
