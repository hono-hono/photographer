"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavKey } from "./nav";

/**
 * いま下線を付けるナビ項目を返す。
 * - Gallery・作品詳細では「Gallery」
 * - トップでは、画面の中ほどにあるセクション（Profile / Contact）
 */
export function useActiveNav(): NavKey | null {
  const pathname = usePathname();
  const isTop = pathname === "/";
  const [section, setSection] = useState<NavKey | null>(null);

  useEffect(() => {
    if (!isTop) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"));
    if (targets.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.navSection!;
          if (entry.isIntersecting) visible.add(key);
          else visible.delete(key);
        }
        // 画面の中央の線にかかっているセクション（並び順で後ろのものを優先）
        const current = targets
          .map((el) => el.dataset.navSection as NavKey)
          .filter((key) => visible.has(key))
          .pop();
        setSection(current ?? null);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      setSection(null);
    };
  }, [isTop]);

  if (pathname.startsWith("/gallery")) return "gallery";
  return isTop ? section : null;
}
