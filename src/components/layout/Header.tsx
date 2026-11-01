import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import styles from "./Header.module.css";

/** 画面上部に固定するヘッダー。背景色＋下端の罫線 */
export function Header() {
  return (
    <header className={styles.header}>
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
