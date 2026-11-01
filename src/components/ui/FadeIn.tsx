"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FadeIn.module.css";

/**
 * 画面に入ったら、透明度0→1と数pxの上移動で静かに表示する。一度表示したら二度と動かさない。
 * OS の「視差効果を減らす」がオンなら最初から表示。JavaScript が動かなくても中身は見える。
 */
export function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // すでに画面に入っている（または通り過ぎた）ものは動かさない
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={[styles.fade, className].filter(Boolean).join(" ")} data-state={state}>
      {children}
    </div>
  );
}
