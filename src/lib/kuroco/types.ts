/** Kuroco API（API 2「hono build」）から返ってくる生のデータの型。OpenAPI の定義に合わせている */

export type KurocoSelect<K extends string = string> = { key: K; label: string } | null;

export type KurocoFile = {
  id?: string;
  url?: string;
  url_org?: string;
  desc?: string;
} | null;

type KurocoBase = {
  topics_id: number;
  subject: string;
  slug?: string | null;
  update_ymdhi?: string;
};

export type KurocoWork = KurocoBase & {
  category?: KurocoSelect;
  photo?: KurocoFile;
  alt?: string;
  mv?: boolean | null;
  mv_order?: number | string | null;
};

export type KurocoAchievement = KurocoBase & {
  group?: KurocoSelect;
  period?: string;
};

export type KurocoProfile = KurocoBase & {
  lead?: string;
  history?: string;
  portrait?: KurocoFile;
  portrait_alt?: string;
};

export type KurocoList<T> = {
  list: T[];
  pageInfo?: { totalCnt?: number; perPage?: number; totalPageCnt?: number };
  errors?: unknown[];
};
