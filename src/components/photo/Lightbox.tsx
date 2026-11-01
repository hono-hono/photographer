"use client";

import { useEffect, useRef } from "react";
import { withBase } from "@/lib/site";
import type { Photo } from "@/types/content";
import { PhotoViewer } from "./PhotoViewer";
import styles from "./Lightbox.module.css";

type Props = {
  photos: Photo[];
  /** 表示中の写真の位置。null なら閉じている */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

/**
 * 暗い面を重ねて写真だけを大きく見せる（設計書 7.2）。
 * HTML 標準の <dialog> で、Esc で閉じる・背面を操作させない、を手に入れる。
 * 前後移動は渡された写真の中だけ（ループしない）。URL は変えない。
 */
export function Lightbox({ photos, index, onChange, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const returnTo = document.activeElement as HTMLElement | null;
      const root = document.documentElement;
      const prevOverflow = root.style.overflow;
      root.style.overflow = "hidden"; // 開いている間はページのスクロールを止める
      dialog.showModal();
      return () => {
        if (dialog.open) dialog.close();
        root.style.overflow = prevOverflow;
        returnTo?.focus({ preventScroll: true }); // 閉じたら押した写真にフォーカスを戻す
      };
    }
  }, [open]);

  // 隣の写真を先に読み込んでおく
  useEffect(() => {
    if (index === null) return;
    for (const i of [index - 1, index + 1]) {
      const p = photos[i];
      if (p) new Image().src = withBase(p.src);
    }
  }, [index, photos]);

  const prev = index !== null && index > 0 ? () => onChange(index - 1) : null;
  const next = index !== null && index < photos.length - 1 ? () => onChange(index + 1) : null;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="写真の拡大表示"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" && prev) {
          e.preventDefault();
          prev();
        } else if (e.key === "ArrowRight" && next) {
          e.preventDefault();
          next();
        }
      }}
      onClick={(e) => {
        // 写真とボタン以外（写真の外側）を押したら閉じる
        if (!(e.target as HTMLElement).closest("img, button")) onClose();
      }}
    >
      {index !== null && photos[index] && (
        <div className={styles.body}>
          <div className={styles.bar}>
            <button type="button" className={styles.close} onClick={onClose} autoFocus>
              <span aria-hidden="true">✕</span>閉じる
            </button>
          </div>
          <div className={styles.viewer}>
            <PhotoViewer photo={photos[index]} onPrev={prev} onNext={next} tone="dark" />
          </div>
        </div>
      )}
    </dialog>
  );
}
