"use client";

import Link from "next/link";
import { NAV_ITEMS } from "./nav";
import { useActiveNav } from "./useActiveNav";
import styles from "./NavLinks.module.css";

/** PC のナビ3項目。いま見ている場所に下線が左から伸びる */
export function NavLinks() {
  const active = useActiveNav();
  return (
    <nav aria-label="メインメニュー" className={styles.nav}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={styles.link}
                aria-current={isActive ? (item.key === "gallery" ? "page" : "location") : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
