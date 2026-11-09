import type { KurocoAchievement, KurocoCategory, KurocoList, KurocoProfile, KurocoWork } from "./types";

/**
 * Kuroco API の呼び出し。ビルド時（scripts/fetch-content.ts）にだけ使う。
 * トークンは GitHub Actions の Secrets（KUROCO_API_TOKEN）から渡し、ブラウザには出さない。
 */
export type KurocoConfig = {
  baseUrl: string;
  token: string;
  /** ビルド用 API の番号 */
  apiId: number;
};

export function kurocoConfigFromEnv(env: NodeJS.ProcessEnv = process.env): KurocoConfig | null {
  const token = env.KUROCO_API_TOKEN?.trim();
  if (!token) return null;
  return {
    baseUrl: (env.KUROCO_API_BASE ?? "https://hono-portfolio.g.kuroco.app").replace(/\/$/, ""),
    token,
    apiId: Number(env.KUROCO_BUILD_API_ID ?? 2),
  };
}

async function getList<T>(config: KurocoConfig, path: string): Promise<T[]> {
  const url = `${config.baseUrl}/rcms-api/${config.apiId}/${path}`;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "X-RCMS-API-ACCESS-TOKEN": config.token, Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // 認証エラーなどは何度やっても同じなので、すぐに止める
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new KurocoError(`Kuroco API ${path} が ${res.status} を返しました: ${body.slice(0, 300)}`, false);
        }
        throw new KurocoError(`Kuroco API ${path} が ${res.status} を返しました`, true);
      }
      const json = (await res.json()) as KurocoList<T>;
      if (!Array.isArray(json.list)) throw new KurocoError(`Kuroco API ${path} の返り値に list がありません`, false);
      const total = json.pageInfo?.totalCnt;
      if (typeof total === "number" && total > json.list.length) {
        throw new KurocoError(
          `Kuroco API ${path} は ${total} 件ありますが ${json.list.length} 件しか取得できませんでした。エンドポイントの cnt を増やしてください`,
          false,
        );
      }
      return json.list;
    } catch (error) {
      lastError = error;
      if (error instanceof KurocoError && !error.retryable) throw error;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastError;
}

export class KurocoError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "KurocoError";
  }
}

export const fetchCategories = (c: KurocoConfig) => getList<KurocoCategory>(c, "categories");
export const fetchWorks = (c: KurocoConfig) => getList<KurocoWork>(c, "works");
export const fetchAchievements = (c: KurocoConfig) => getList<KurocoAchievement>(c, "achievements");
export const fetchProfile = (c: KurocoConfig) => getList<KurocoProfile>(c, "profile");
