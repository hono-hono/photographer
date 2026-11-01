/** サイト全体で使う固定の値 */

export const SITE_NAME = "hono";
export const SITE_TITLE = "hono | Photographer";
export const SITE_DESCRIPTION =
  "写真家 hono のポートフォリオ。廃線や廃墟、古い建物など、人の気配や暮らしの名残を感じる風景を、静かに記録しています。";

/** 公開URL（末尾スラッシュなし）。OGP などの絶対URLに使う */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hono-hono.github.io/photographer").replace(
  /\/$/,
  "",
);

/** 絶対URL（OGP・canonical 用）。path は basePath なしで渡す */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** GitHub Pages ではリポジトリ名の下に置かれる（例: /photographer） */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const EMAIL = "photographer.hono@gmail.com";
export const COCONALA_URL = "https://coconala.com/users/2362314";

/** お問い合わせの送信先（Kuroco API 3 の contact） */
export const CONTACT_ENDPOINT =
  process.env.NEXT_PUBLIC_KUROCO_CONTACT_URL ?? "https://hono-portfolio.g.kuroco.app/rcms-api/3/contact";

/**
 * public/ 以下のファイルのURLを作る。
 * next/link は basePath を自動で付けるが、<img src> などは付かないため、ここで付ける。
 */
export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
