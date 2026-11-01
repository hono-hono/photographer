"use client";

/**
 * Gallery ⇄ 作品詳細の行き来で、選んでいたタブとスクロール位置を戻すための小さな記憶。
 * ページ移動はブラウザ内で行われる（再読み込みしない）ので、モジュールの変数で十分。
 */
type GalleryReturn = { url: string; scrollY: number };

let galleryReturn: GalleryReturn | null = null;
let lastPopstate = 0;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    lastPopstate = Date.now();
  });
}

/** Gallery で写真を押したときに、いまの場所を覚える */
export function rememberGallery() {
  galleryReturn = { url: location.pathname + location.search, scrollY: window.scrollY };
}

/** 作品詳細が Gallery から開かれたか（「← Gallery」をブラウザの戻ると同じにするため） */
export function cameFromGallery(): boolean {
  return galleryReturn !== null;
}

/** ブラウザの戻るで Gallery に帰ってきたときだけ、覚えていた位置を返して忘れる */
export function takeGalleryScroll(): number | null {
  const entry = galleryReturn;
  galleryReturn = null;
  if (!entry) return null;
  const isBack = Date.now() - lastPopstate < 2000;
  if (!isBack || entry.url !== location.pathname + location.search) return null;
  return entry.scrollY;
}
