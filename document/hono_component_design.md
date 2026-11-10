# hono ポートフォリオサイト — コンポーネント設計書（Next.js × Kuroco）

作成日: 2026-10-31
更新日: 2026-11-01（ステップ1の決定事項、Kuroco のコンテンツ定義と API の作成結果、実装で変えた点を反映）
ステータス: 第2版。実装に入る前の設計図
置き場所: GitHub `hono-hono/photographer` の `document/`
前提資料: `document/hono_design_brief.md`（デザイン依頼書・最優先）、`document/hono_site_spec.md`（ページ仕様書）、claude.ai プロジェクト内の `要件定義`

---

## 0. この設計書の要点

- **作品・実績・プロフィール文は Kuroco（ヘッドレスCMS）で管理する。** 管理画面から写真を追加・並べ替えでき、コードを触らずにサイトを更新できる
- **Kuroco のデータは「ビルドのとき」だけ取りに行く。** 閲覧者のブラウザは Kuroco に直接アクセスしない（お問い合わせの送信を除く）。表示が速く、Kuroco の利用料も無料枠に収まりやすい
- **公開先は GitHub Pages（無料）。** Next.js は静的書き出し（`output: 'export'`）で作り、Kuroco で更新すると GitHub Actions が自動でビルドし直して公開する
- **お問い合わせは Kuroco のフォーム機能で受ける。** 外部のフォームサービスを増やさずに済み、受信内容も Kuroco の管理画面で見られる
- 写真の並べ方 `JustifiedRows`、写真を大きく見せる `PhotoViewer` は、トップと Gallery・作品詳細で共通の部品にする

### 全体の流れ

```
[hono さん] ── 写真・文章を登録 ──▶ [Kuroco 管理画面]
                                        │ 更新をきっかけに通知
                                        ▼
                              [GitHub Actions（自動ビルド）]
                                1. Kuroco API から作品データを取得
                                2. 写真をダウンロードして縮小・寸法を取得
                                3. Next.js で静的HTMLを書き出し
                                        │
                                        ▼
                              [GitHub Pages（公開）] ◀── 閲覧者

[閲覧者] ── お問い合わせ送信 ──▶ [Kuroco フォームAPI] ──▶ 通知メール
```

---

## 1. 技術の選び方

| 項目 | 採用 | 理由 |
|---|---|---|
| フレームワーク | Next.js（App Router）+ TypeScript | 要件どおり |
| CMS | **Kuroco** | 国産で管理画面が日本語。無料枠があり、フォーム機能と GitHub Actions 連携を標準で持つ |
| 公開方法 | 静的書き出し → GitHub Pages | 無料。サーバー不要なので壊れにくい |
| スタイル | CSS Modules + CSS変数（デザイントークン） | 追加のライブラリ不要。Figmaの変数名とそのまま対応させられる |
| フォント | `@fontsource/noto-serif-jp`（400）・`@fontsource/noto-sans-jp`（400・500） | サイト自身から配信できる。ビルド時に Google へ取りに行かないので、通信の制限がある環境でもビルドが止まらない（実装時に `next/font/google` から変更） |
| 画像 | ビルド時に Kuroco から取得 → 縮小してサイトに同梱 | 寸法を自動で取得でき、閲覧時に Kuroco の転送量を使わない（→ 7章） |
| お問い合わせ | Kuroco フォーム（InquiryForm）API | 静的サイトでも送信でき、受信・通知メールを Kuroco で管理できる |
| テスト | Vitest（計算・変換ロジックのみ） | 並べ方・前後移動・Kurocoデータの変換は、壊れると気づきにくい |
| コード整形 | ESLint + Prettier | 読みやすさをそろえる |

> 💡 **補足：Kuroco の料金**
> Kuroco は完全従量課金で、**月12ドル（税込）相当の利用までは無料**です。この設計では閲覧者が Kuroco に直接アクセスしないため、使うのは「ビルド時のAPI取得」「写真の保管」「お問い合わせの受信」だけで、無料枠に収まる見込みです。

> 💡 **補足：Tailwind CSS を使わない理由**
> このサイトは部品数が少なく、値の大半がトークン（色・余白）で決まっています。CSS Modules なら「Figmaの変数名 = CSS変数名」で対応が一目で分かり、数年後に読み返したときにも迷いません。

---

## 2. フォルダ構成

```
src/
├─ app/                          … ページ（URLと1対1）
│  ├─ layout.tsx                 … 全ページ共通の枠（フォント、ヘッダー、フッター）
│  ├─ page.tsx                   … トップ（/）
│  ├─ not-found.tsx              … 404
│  └─ gallery/
│     ├─ page.tsx                … Gallery（/gallery）
│     └─ [slug]/page.tsx         … 作品詳細（/gallery/xxx）
│
├─ components/                   … 2か所以上で使う部品
│  ├─ layout/   Header / NavLinks / MobileMenu / Footer
│  ├─ photo/    JustifiedRows / PhotoTile / PhotoViewer / Lightbox
│  └─ ui/       Button / SectionHeading / FadeIn
│
├─ features/                     … 特定のページでしか使わない部品
│  ├─ home/     MainVisual / ProfileSection / AchievementList
│  ├─ gallery/  GalleryTabs
│  ├─ work/     WorkNav
│  └─ contact/  ContactSection / ContactForm / validate.ts / submit.ts
│
├─ lib/
│  ├─ kuroco/                    … Kuroco とのやり取りはここに閉じ込める
│  │  ├─ client.ts               … API の呼び出し（URL・認証・エラー処理）
│  │  ├─ types.ts                … Kuroco から返ってくる生のデータの型
│  │  └─ mappers.ts              … 生データ → サイト用の型（Work など）への変換
│  ├─ content.ts                 … ページが使う窓口: getWorks() / getMainVisual() / getProfile() / getAchievements()
│  ├─ rows.ts                    … 写真を行に分ける計算
│  ├─ works.ts                   … 絞り込み・前後の作品を探す
│  └─ categories.ts              … カテゴリの定義と URL の値の検証
│
├─ types/content.ts              … サイト用の型（Work / Profile / AchievementGroup）
│
└─ styles/
   ├─ tokens.css                 … 色・余白・角丸・書体の変数
   └─ globals.css                … リセット、基本の文字組み

scripts/
├─ fetch-content.ts              … ビルド前に Kuroco からデータと写真を取得・縮小・寸法取得し、.content/content.json に書き出す
├─ dummy-content.ts              … トークンがないとき（手元での確認）に使うダミーのデータ
└─ make-brand-images.mjs         … 共有用の画像とアイコンを作り直す
```

**分け方のルール**
- `components/` … 2か所以上で使う、またはページに依存しない部品
- `features/` … 1つのページ専用の部品。そのページを消すときはフォルダごと消せる
- `lib/kuroco/` … **Kuroco に関するコードはここだけ。** ページや部品は Kuroco の存在を知らない
- `lib/content.ts` … ページがデータを受け取る唯一の窓口。中身は `scripts/fetch-content.ts` が書き出した `.content/content.json` を読むだけ（Kuroco への問い合わせはビルド1回につき1回）

> 💡 **補足：Kuroco を `lib/kuroco/` に閉じ込める理由**
> 部品が Kuroco のデータ形式に直接依存すると、Kuroco 側の項目名を変えただけで画面のあちこちを直すことになります。変換（`mappers.ts`）を1か所に置けば、変更はそこだけで済みます。将来 CMS を乗り換える場合も、`lib/kuroco/` を差し替えるだけです。

---

## 3. ルーティング

| URL | ファイル | 作り方 | 備考 |
|---|---|---|---|
| `/` | `app/page.tsx` | ビルド時にHTML化 | `#profile` `#contact` へのアンカーを持つ |
| `/gallery?category=…` | `app/gallery/page.tsx` | ビルド時にHTML化 | カテゴリの切り替えはブラウザ側で行う |
| `/gallery/[slug]?category=…` | `app/gallery/[slug]/page.tsx` | Kuroco の全作品分をビルド時にHTML化（`generateStaticParams`） | `category` は前後移動の範囲を決めるために使う |
| それ以外 | `app/not-found.tsx` | 〃 | 静かな404。トップへのリンクのみ |

> ⚠️ **注意：静的書き出しではURLのクエリ（`?category=works`）をサーバー側で読めない**
> そのため Gallery と作品詳細では、カテゴリの読み取りをブラウザ側（クライアントコンポーネント）で行います。

> ⚠️ **注意：作品を追加・削除したら再ビルドが必要**
> 作品詳細のページはビルド時にしか作られません。Kuroco で作品を追加しても、再ビルドが終わるまではそのページは存在しません（自動化の方法は → 10章）。

> ⚠️ **注意：GitHub Pages のURL**
> リポジトリ名を `ユーザー名.github.io` にすると `https://ユーザー名.github.io/` で公開されます。それ以外の名前だと `https://ユーザー名.github.io/リポジトリ名/` になり、`basePath` の設定が必要です。独自ドメインならどちらでも不要です。

---

## 4. Kuroco の設計（コンテンツ構造）

Kuroco では、コンテンツの入れ物を「コンテンツ定義（トピックグループ）」と呼び、標準の項目に加えて「拡張項目」を自由に足せます。

### 4.1 コンテンツ定義の一覧（2026-11-01 作成済み）

Kuroco の Admin MCP（claude.ai のコネクタ「Kuroco Admin」）から作成した。サイトキーは `hono-portfolio`。3つとも本文の欄はなし（入力方法「カスタム」）で、下の項目だけで入力する。

| コンテンツ定義 | ID | 件数 | 用途 |
|---|---|---|---|
| **作品** | 7 | 増えていく | Gallery・作品詳細・MV |
| **実績** | 8 | 増えていく | Profile の実績リスト |
| **プロフィール** | 9 | 1件だけ | Profile のリード文・本文・ポートレート |

### 4.2 「作品」の項目（ID 7）

| 項目 | Kuroco での種類 | Slug | 必須 | 説明 |
|---|---|---|---|---|
| タイトル | 標準項目 | `subject` | ○ | 管理画面で見分けるためだけに使う。**サイトには表示しない** |
| スラッグ | 標準項目 | `slug` | ○ | URLに使う。英小文字・数字・ハイフン。例: `shimotsui-line-01` |
| カテゴリ | 標準項目（カテゴリ） | `contents_type` | ○ | Gallery のタブ。種類は［コンテンツ定義］→「作品」の行の［カテゴリ設定］で管理（2026-11-09 から） |
| 写真 | 画像（jpg / png / webp） | `photo` | ○ | 現像済みの写真（長辺3000px程度まで） |
| 代替テキスト | テキスト（120字まで） | `alt` | | 画面には出ない短い説明。任意（2026-11-10 から）。空ならサイト側で「hono の写真（カテゴリ名）」にする |
| MVに使う | はい／いいえ（使う／使わない） | `mv` | | 初期値は「使わない」 |
| MVの順番 | 数値（整数 1〜10） | `mv_order` | | |
| 公開 | 標準項目 | `topics_flg` | ○ | 非公開にするとサイトから消える |

- **Gallery の並び順は、Kuroco の一覧で並べた順（表示順）をそのまま使う。** 管理画面で並べ替えれば、サイトにも反映される
  - Kuroco の一覧は初期状態だと「新しい順」に並ぶ。API では並び順を明示し、表示順を設定していない作品は登録順（topics_id の昇順）にする（API 作成時に確定）
- **MVは「MVに使う」が「使う」の作品を「MVの順番」で並べる。** ビルド時にちょうど10件でなければビルドを止めて知らせる（間違ったままの公開を防ぐ）
- **カテゴリは Kuroco の標準の「カテゴリ」機能で管理する（2026-11-09 に変更）。** Kuroco だけでカテゴリの追加・名前の変更・並べ替え・削除ができる
  - カテゴリ名 → Gallery のタブの表示名、スラッグ → URL の `?category=` の値、表示順（大きい順）→ タブの並び順
  - スラッグは英数字とアンダースコアだけ。`all` は「すべて」のタブで使うので使えない。スラッグが空だとビルドを止めて知らせる
  - 作品が1件もないカテゴリはタブに出さない。非公開にしたカテゴリの作品があるとビルドを止める
  - 現在のカテゴリ（表示順の大きい順）: Works（ID 15、`works`、仕事の撮影）・Personal（ID 20、`personal`、個人の作品）・Family（ID 18、`family`）・Anniversary（ID 19、`anniversary`）
  - 以前の選択の項目「カテゴリ」（`category`、ext 1）は 2026-11-10 までに管理画面で削除済み

> 💡 **補足：MVを別のコンテンツ定義にしない理由**
> MV用に写真を二重登録すると、片方だけ差し替えて食い違うことが起きます。作品にチェックを付けるだけにすれば、写真は常に1か所で管理できます。

### 4.3 「実績」の項目（ID 8）

| 項目 | Kuroco での種類 | Slug | 必須 | 説明 |
|---|---|---|---|---|
| 内容 | 標準項目（タイトル） | `subject` | ○ | 例: 第63回 富士フイルムフォトコンテスト 最終選考通過 |
| 区分 | 選択（ラジオボタン） | `group` | ○ | 値は `awards`（受賞・選出）/ `talks`（講演・活動）/ `qualifications`（資格） |
| 時期 | テキスト（30字まで） | `period` | | 例: 2025年5月、現在。空なら年月の欄を空ける |

- 並び順は Kuroco の表示順をそのまま使う（日付で自動並べ替えはしない。「現在」や年月なしの行を正しく並べるのが難しいため）
- 区分の並び（受賞・選出 → 講演・活動 → 資格）は、サイト側で選択肢の順に固定する
- 初期データ: 仕様書 5.4 の8行をそのまま登録する（「2023/2025」は「2023年度/2025年度」と書く案）

### 4.4 「プロフィール」の項目（ID 9、1件だけ）

| 項目 | Kuroco での種類 | Slug | 必須 |
|---|---|---|---|
| リード文 | テキストエリア | `lead` | ○ |
| 写真歴 | テキストエリア | `history` | ○ |
| ポートレート | 画像（jpg / png / webp） | `portrait` | ○ |
| ポートレートの代替テキスト | テキスト（120字まで） | `portrait_alt` | ○ |

> ⚠️ **注意：本文はリッチテキスト（装飾つき入力）にしない**
> 太字や色を自由に付けられると、サイトの文字組みが崩れる原因になります。プレーンなテキストエリアにし、改行だけを反映します。

### 4.5 API（エンドポイント）

Kuroco の API は `https://{サイトキー}.g.kuroco.app/rcms-api/{API番号}/{パス}` の形になります。2つのAPIに分けます。

| API | エンドポイント | 操作 | 使う場面 | 認証 |
|---|---|---|---|---|
| ビルド用 | `works` | 作品の一覧 | ビルド時のみ | **アクセストークンあり**（GitHub の秘密情報に保存） |
| ビルド用 | `achievements` | 実績の一覧 | 〃 | 〃 |
| ビルド用 | `profile` | プロフィールの詳細 | 〃 | 〃 |
| 公開用 | `contact` | お問い合わせの送信 | 閲覧者のブラウザから | なし（送信のみ許可） |

- ビルド用APIにトークンを付けるのは、**公開前の作品や非公開の作品を外部から読まれないようにする**ため。トークンは GitHub Actions の Secrets にだけ置き、ブラウザには出さない
- 公開用APIには、Kuroco の設定で「受け付ける送信元（CORS）」にサイトのドメインだけを登録し、流量制限（例: 1分に数回）を付ける

**作成済みの設定（2026-11-01）**

| API | API ID | 認証 | エンドポイント | 中身 |
|---|---|---|---|---|
| hono build | 2 | 静的トークン | `GET /rcms-api/2/works` | 作品（定義 7）を最大500件、topics_id の昇順 |
| 〃 | 〃 | 〃 | `GET /rcms-api/2/achievements` | 実績（定義 8）を最大100件、topics_id の昇順 |
| 〃 | 〃 | 〃 | `GET /rcms-api/2/profile` | プロフィール（定義 9）を1件 |
| 〃 | 〃 | 〃 | `GET /rcms-api/2/categories` | 作品のカテゴリ（定義 7）。Gallery のタブになる（2026-11-09 追加） |
| hono contact | 3 | なし | `POST /rcms-api/3/contact` | フォーム ID 3 に送信。1時間に10回まで |

- 呼び出し先の例: `https://hono-portfolio.g.kuroco.app/rcms-api/2/works`（ヘッダー `X-RCMS-API-ACCESS-TOKEN` にトークン）
- hono contact の受け付ける送信元（CORS）は `https://hono-hono.github.io` と `http://localhost:3000`、メソッドは POST と OPTIONS
- フォーム ID 3「お問い合わせ」: 項目は `name`（お名前）・`email`（メールアドレス）・`message`（お問い合わせ内容、3000字まで）、すべて必須。`category` は非表示。通知は photographer.hono@gmail.com に全項目つき、自動返信あり
- 最初から入っていた API 1「Default」・フォーム 1「Default」・メルマガ「Default」は使わないため削除した（2026-11-08。削除前にサイト全体をバックアップ）

---

## 5. サイト側のデータの型

Kuroco の生データは `lib/kuroco/mappers.ts` でこの形に変換してから、部品に渡します。

```ts
// lib/categories.ts（カテゴリの種類は Kuroco で管理するので、コードには持たない）
export type Category = string;                    // Kuroco のカテゴリのスラッグ
export type CategoryFilter = Category | 'all';
export type CategoryDef = { slug: string; label: string };  // タブ1つ分

// types/content.ts
export type Photo = {
  src: string;      // サイトに同梱した縮小済み画像のパス
  width: number;    // ビルド時に画像から自動取得
  height: number;
  alt: string;
};

export type Work = {
  slug: string;
  category: Category;
  photo: Photo;
};

export type MainVisual = Work[];   // ちょうど10件

// SiteContent.categories: CategoryDef[]   // タブの並び（Kuroco の表示順）

export type Profile = {
  lead: string;
  history: string;
  portrait: Photo;
};

export type Achievement = { date?: string; text: string };
export type AchievementGroup = { label: string; items: Achievement[] };
```

**設計の判断**
- 写真の幅・高さは**ビルド時に画像ファイルから自動で読み取る**。Kuroco で手入力させないので、間違いでレイアウトが崩れることがない（仕様書「各写真の幅と高さをデータに持たせる」を自動化）
- 作品のタイトルは型に含めない。サイトに表示しないものを部品に渡さないため
- 変換の時点で検査する（スラッグの重複、未知のカテゴリ、写真の未登録、MVが10件でない）。問題があればビルドを失敗させ、何が悪いかをログに出す

---

## 6. コンポーネント一覧

「サーバー」= ビルド時にHTMLになる部品（ブラウザにJavaScriptを送らない）。「クライアント」= ブラウザで動く部品。**クライアントは操作が必要な最小限の部品だけにする。**

### 6.1 共通

| 部品 | 種類 | 役割 | 主な受け取る値 |
|---|---|---|---|
| `Header` | サーバー | 固定ヘッダーの枠。ロゴとナビを並べる | なし |
| `NavLinks` | クライアント | ナビ3項目。トップでは表示中のセクションに下線 | `items` |
| `MobileMenu` | クライアント | SPの「Menu」ボタンと開閉 | `items` |
| `Footer` | サーバー | 「© hono」と「Coconala ↗」 | なし |
| `Button` | サーバー | 角丸10pxのボタン。リンク・送信の両方に使う | `variant: 'tile' \| 'solid'`、`href?` |
| `SectionHeading` | サーバー | 明朝のセクション見出し | `children`、`id` |
| `FadeIn` | クライアント | スクロールで静かにフェードイン | `children` |

### 6.2 写真まわり（このサイトの中心）

| 部品 | 種類 | 役割 | 使う場所 |
|---|---|---|---|
| `JustifiedRows` | サーバー | 高さをそろえた行で写真を並べる | MV、Gallery |
| `PhotoTile` | サーバー | 1枚分の写真。押せる（リンク or ボタン） | `JustifiedRows` の中 |
| `PhotoViewer` | クライアント | 写真を画面の高さに収めて大きく表示＋前後移動 | 拡大表示、作品詳細 |
| `Lightbox` | クライアント | 暗い面を重ねて `PhotoViewer` を出す | MV |

### 6.3 ページ専用

| 部品 | 種類 | 役割 |
|---|---|---|
| `MainVisual` | クライアント | MVの10枚と `Lightbox` の開閉をまとめる |
| `ProfileSection` / `AchievementList` | サーバー | Profile の配置と実績の行リスト |
| `GalleryTabs` | クライアント | タブ、絞り込み、URLとの連動 |
| `WorkNav` | クライアント | 作品詳細の「← Gallery」と前後移動 |
| `ContactSection` / `ContactForm` | サーバー / クライアント | 案内文とフォーム |

### 6.4 ページごとの組み立てとデータの受け渡し

```
layout.tsx
├─ Header（NavLinks / MobileMenu）
├─ {各ページ}
└─ Footer

page.tsx（トップ）            ← getMainVisual() / getProfile() / getAchievements()
├─ MainVisual
│   ├─ JustifiedRows（PhotoTile ×10、押すと拡大）
│   └─ Lightbox → PhotoViewer
├─ Button「すべての写真を見る →」
├─ ProfileSection（SectionHeading / ポートレート / AchievementList）
└─ ContactSection（SectionHeading / ContactForm）

gallery/page.tsx              ← getWorks()
└─ GalleryTabs
    └─ JustifiedRows（PhotoTile、押すと作品詳細へ）

gallery/[slug]/page.tsx       ← getWorks()（generateStaticParams でも使う）
└─ WorkNav → PhotoViewer
```

- **データを取りに行くのはページ（`page.tsx`）だけ。** 部品は受け取った値を表示するだけにする。部品を仮データで確認しやすくなり、テストも簡単になる
- 同じビルドの中で `getWorks()` が何度呼ばれても、Kuroco への問い合わせは1回で済むようにする（結果を使い回す）

---

## 7. 主要な仕組みの設計

### 7.1 高さをそろえた行（`JustifiedRows`）

**考え方**: 1行の中で、各写真の「伸び率」を縦横比（幅÷高さ）にすると、全写真の高さが自然にそろい、行の両端もぴったりそろう。CSS の `flex` だけで実現でき、JavaScriptで寸法を計算しない。

```css
.rows  { display: flex; flex-wrap: wrap; column-gap: var(--photo-gap); }
.tile  { flex: var(--ratio) 1 0; aspect-ratio: var(--ratio); }   /* --ratio = 幅÷高さ */
.break { flex-basis: 100%; height: var(--photo-gap); }           /* ここで改行 */
```

**手順**
1. `lib/rows.ts` の `groupRows()` が、写真を何枚ずつの行に分けるかを決める（PC用・SP用の2通り）
2. `JustifiedRows` は写真を1列に並べ、行の切れ目に「改行用の空要素」を挟む
3. 改行用の要素に「PCだけで効く」「SPだけで効く」の印をつけ、CSSの画面幅条件で切り替える

**行の分け方**
- MV … 決め打ち（PC: 4・3・3、SP: 2×5）
- Gallery … 縦横比の合計が目安（PC: 約4.0、SP: 約2.0）に達したら改行。縦位置の多い行は枚数が増え、横位置の多い行は減るので、行の高さが極端にばらつかない

> 💡 **補足：この方式を選んだ理由**
> - HTMLは1種類で、PCとSPの両方に対応できる（写真を二重に出さない）
> - ビルド時点で寸法が決まるので、**読み込み中にレイアウトが動かない**
> - JavaScriptが止まっていても写真は正しく並ぶ

> ⚠️ **注意：最後の行**
> Gallery の最後の行が1〜2枚だけだと、横幅いっぱいまで引き伸ばされて巨大になります。最後の行は「縦横比の合計が目安の6割未満なら伸ばさない」（右側を空ける）ようにします。

### 7.2 拡大表示（`Lightbox` + `PhotoViewer`）

- HTML標準の `<dialog>` 要素を使う。**Escで閉じる・背面を操作させない・閉じたら押した写真にフォーカスを戻す**、がブラウザ標準で手に入る
- 前後移動はMVの10枚の中だけ。←→キー対応。PCは写真の左右に矢印、SPは写真の下に Prev / Next
- 閉じ方は「✕ 閉じる」、Esc、写真の外側を押す
- 開いている間はページのスクロールを止め、閉じたら元の位置のまま
- URLは変えない（共有したいときは作品詳細のURLがあるため）

> 💡 **補足：重ね表示に決めた理由（2026-11-01 決定）**
> 別ページにすると、前後移動の範囲が「MVの10枚」ではなく「カテゴリ内」になり、仕様とずれます。また重ね表示なら、閉じたときにトップの元の位置へ戻る動きが確実です。

### 7.3 Gallery のタブ（`GalleryTabs`）

**手順**
1. ビルド時に全作品のデータを `GalleryTabs` に渡す（数百枚程度までなら問題ない量）
2. ブラウザで URL の `?category=` を読み、選択中のタブを決める。不正な値やクエリなしは `all`
3. タブを押したら、表示を即座に絞り込み、URLを `history.replaceState` で書き換える

- ARIA の tablist / tab / tabpanel の役割を付ける。←→キーでタブ間を移動、Home / End で先頭・末尾へ
- URLを「置き換え」にする理由: タブを押すたびに履歴が増えると、ブラウザの戻るで何度もタブを戻ることになるため
- 写真のリンクは `/gallery/[slug]?category=選択中のカテゴリ` にする（作品詳細で前後移動の範囲を決めるため）

> ⚠️ **注意：初回表示の一瞬**
> HTMLは All の状態で書き出され、ブラウザでURLを読んでから絞り込みます。`?category=family` を直接開いたとき、ごく一瞬 All が見える可能性があるため、URLを読み終えるまでグリッドを非表示にしておきます（数十ミリ秒の差なので体感はほぼない）。

### 7.4 作品詳細（`WorkNav` + `PhotoViewer`）

- `lib/works.ts` の `getNeighbors(slug, category)` が、同じカテゴリ内の前後の作品を返す
- **前後移動は履歴を「置き換え」にする。** 履歴を積むと、10枚見たあと Gallery に戻るのに10回かかるため。置き換えなら、何枚見てもブラウザの戻る1回で Gallery に帰れる
- 「← Gallery」は、Gallery から来た場合はブラウザの戻ると同じ動き（タブとスクロール位置がそのまま復元される）。URLを直接開いた場合は `/gallery?category=…` へのリンクとして動く
- 写真は `object-fit: contain` で画面の高さに収め、縦位置も横位置も切らない

### 7.5 ヘッダーとナビ

- 見出しが固定ヘッダーに隠れないよう、`#profile` `#contact` に `scroll-margin-top: var(--header-h)` を付ける（JavaScript不要）
- 下線: トップでは `IntersectionObserver` で今見えているセクションを判定し、ナビの項目に `aria-current="location"` を付けて下線を表示。Gallery・作品詳細では「Gallery」に下線
- 下線は左から右へ滑らかに伸びる（`transform: scaleX` の変化。仕様の「動きは一方向のみ」）
- SPメニュー: ボタンに `aria-expanded` と `aria-controls`。項目を選ぶ、Escを押す、のどちらでも閉じる

### 7.6 お問い合わせ（`ContactForm` → Kuroco フォーム）

**Kuroco 側の準備**
1. 管理画面の［キャンペーン］→［フォーム］で、フォームを「初期設定で追加」する（お名前・メールアドレス・本文の3項目が最初から入っている。仕様の3項目と一致）
2. 自動返信メールと、hono さんへの通知メール（送り先: photographer.hono@gmail.com）を設定する
3. API に送信用のエンドポイント `contact` を作り、受け付ける送信元をサイトのドメインに限定、流量制限を付ける

**サイト側の送信の流れ**
1. 入力欄から離れたとき・送信時に、ブラウザ側で入力チェック（`features/contact/validate.ts`）
2. 問題があれば、その項目の直下に文章で表示し、入力欄と `aria-describedby` で結びつける
3. 問題がなければ `features/contact/submit.ts` が Kuroco の `contact` に送信
4. Kuroco 側の入力チェックで返ってきたエラーも、同じく項目の直下に表示する
5. 成功したらフォームを「送信しました」の文面に置き換える（ページ移動なし）。通信に失敗したら再送を促す文面を出す

- 迷惑送信対策として、人には見えない入力欄（ハニーポット）を1つ置き、入力されていたら送信しない
- 送信先のURLは環境変数 `NEXT_PUBLIC_KUROCO_CONTACT_URL` に入れる（公開されても問題ない値だが、変更を1か所で済ませるため）

- フォームの下に、連絡先として `photographer.hono@gmail.com` を文字で表示する（`ContactSection`）。押すとメールアプリが開く `mailto:` リンクにする

> ⚠️ **注意：メールアドレスを画面に載せること**
> 画面に載せたアドレスは、迷惑メール業者のプログラムに集められることがあります。Gmail の迷惑メールフィルタで大半は防げますが、迷惑メールが増えたら、表示をやめてフォームだけにする選択肢があります。

> ⚠️ **注意：送信ボタンの二重押し**
> 送信中はボタンを押せなくし、「送信中…」と表示します。通信が遅いときに何度も押されて、同じ問い合わせが複数届くのを防ぎます。

### 7.7 動き（`FadeIn`）

- セクションが画面に入ったら、透明度0→1と数pxの上移動を0.6秒ほどで行う。**一度表示したら二度と動かさない**
- OSの「視差効果を減らす」設定（`prefers-reduced-motion`）がオンなら、動かさずに最初から表示
- 写真のグリッド・タブ切り替え・前後移動には使わない（仕様どおり）

---

## 8. 画像の扱い

**方針: 写真の原本は Kuroco に置き、サイトにはビルド時に縮小したものを同梱する。**

**手順（`scripts/fetch-content.ts`、`npm run build` / `npm run dev` の直前に自動で実行）**
1. Kuroco API から作品とプロフィールの一覧を取得する
2. 写真を1枚ずつダウンロードし、長辺2400px・JPEG品質80前後に縮小する（`sharp` を使用）
3. 縮小後の幅と高さを読み取り、データに付け加える
4. `public/photos/works/{スラッグ}.jpg`（ポートレートは `public/photos/profile/portrait.jpg`）に保存する。URL の末尾に `?v=…` を付け、写真を差し替えたときに古い画像が表示され続けないようにする
5. 前回のビルドから変わっていない写真は処理を飛ばす（GitHub Actions のキャッシュを使用）

- `next.config.ts` は `images.unoptimized: true`（静的書き出しでは Next.js の自動最適化が使えないため）
- MVの最初の行の写真だけ「優先読み込み」にし、それ以外は画面に近づいてから読み込む

> 💡 **補足：Kuroco の画像URLをそのまま表示しない理由**
> - 閲覧のたびに Kuroco の転送量がかかり、写真中心のサイトでは無料枠を超えやすい
> - 画像の寸法がビルド時に確定しないと、読み込み中にレイアウトが動く
> - 同梱すれば、GitHub Pages の配信網（無料）から表示できる

> 💡 **補足：表示速度をさらに上げたい場合**
> 手順2でサイズ違い（例: 800px / 1600px / 2400px）を作り、画面幅に合ったものを出し分ける仕組みを後から足せます。最初は1サイズで公開し、遅いと感じたら追加するのが効率的です。

> ⚠️ **注意：GitHub Pages の容量**
> GitHub Pages のサイトは1GBまでです。長辺2400pxのJPEGは1枚あたり0.5〜1MB程度なので、**数百枚までは問題ありません**。それを超えそうになったら、縮小サイズを下げるか、配信先の変更を検討します。

---

## 9. デザイントークン（`styles/tokens.css`）

Figmaの変数（`hono/Color`、`hono/Space`）と名前を対応させる。

```css
:root {
  /* Color */
  --color-bg: #F7F7F6;      --color-surface: #FFFFFF;
  --color-ink: #1C1C1A;     --color-ink-soft: #4A4A47;
  --color-muted: #8C8C89;   --color-line: #D9D9D6;
  --color-tile: #F1F1EF;

  /* Space（基準8px） */
  --margin: 64px;           --section-gap: 120px;
  --photo-gap: 8px;         --header-h: 48px;
  --radius-button: 10px;

  /* Font */
  --font-serif: var(--font-noto-serif-jp), serif;
  --font-sans:  var(--font-noto-sans-jp), sans-serif;
}
@media (max-width: 767px) {
  :root { --margin: 20px; --section-gap: 72px; --photo-gap: 6px; --header-h: 44px; }
}
```

- 画面幅の切り替えは **768px の1か所だけ**。条件を増やすと確認の手間が増えるため
- 色や余白の値は、部品のCSSに直接書かず必ず変数を使う

---

## 10. 公開と更新の流れ（Kuroco → GitHub Actions → GitHub Pages）

### 10.1 初回の公開

**手順**
1. GitHub にリポジトリを作る（無料プランでは**公開リポジトリ**にする）
2. Kuroco の APIトークンを、リポジトリの Settings → Secrets に `KUROCO_API_TOKEN` として登録する
3. `next.config.ts` に `output: 'export'` と `images.unoptimized: true` を書く
4. GitHub Actions のワークフロー（既存の `.github/workflows/deploy.yml`）に、Kuroco からの通知で動くきっかけを足す。動くきっかけは次の3つ
   - `main` に push したとき（コードの変更）
   - Kuroco から通知が来たとき（コンテンツの更新。Kuroco の GitHub 連携が `workflow_dispatch` でワークフローを動かす）
   - 手動実行（念のため）
5. リポジトリの Settings → Pages で、公開元を「GitHub Actions」にする

### 10.2 Kuroco で更新したときの自動公開

**手順（Kuroco 側の設定）**
1. Kuroco の［KurocoFront］→［GitHub］で GitHub と連携し、リポジトリ `hono-hono/photographer` を選ぶ。連携にはリポジトリの直下に `kuroco_front.json` が必要なので置いてある（KurocoFront では公開しないため、中身は空の設定）
2. 同じ画面の「GitHub 連携先」で、ワークフローを `deploy.yml`、ブランチを `main` にする
3. カスタム処理 `hono_github_deploy_insert`・`hono_github_deploy_update`・`hono_github_deploy_delete`（中身は `{github_deploy result_var='res'}`）に、トリガー「コンテンツの追加後・更新後・削除後」と対象「作品・実績・プロフィール」を設定し、公開にする。これで、記事ごとに「GitHub Actions ワークフロー」を選ばなくても、保存のたびに `deploy.yml` が動く
4. 管理画面で作品を保存 → 数分後にサイトへ反映される

> 💡 **補足：反映までの時間**
> ビルドは写真の数によって2〜5分程度かかる見込みです。何枚もまとめて登録するときに毎回ビルドが走らないよう、**ビルドの依頼を数分まとめて1回にする**設定（GitHub Actions の同時実行制御）を入れます。

> ⚠️ **注意：公開リポジトリに含まれるもの**
> リポジトリが公開になっても、**APIトークンは Secrets に入れるので外部からは見えません**。写真の原本は Kuroco に置き、リポジトリには入れません（ビルドのたびに取得する）。コードと設定ファイルだけが公開されます。

> ⚠️ **注意：非公開のまま公開したい場合**
> 無料プランでは、リポジトリを非公開にすると GitHub Pages は使えません。コードを非公開にしたい場合は GitHub Pro（月4ドル）が必要です。

> 💡 **補足：別の公開先**
> Kuroco には自前のホスティング（KurocoFront）もあり、Vercel・Netlify・Cloudflare Pages などにも同じ仕組みで通知を送れます。静的書き出しで作っておけば、どこにでも移せます。

---

## 11. アクセシビリティの要点

- フォーカス枠は消さない。無彩色の方針に合わせ、`--color-ink` の2px枠で表示する
- 作品の代替テキストは任意。空のときは「hono の写真（カテゴリ名）」を入れ、読み上げで何もない画像にならないようにする（ポートレートの代替テキストは必須のまま）
- 拡大表示・タブ・メニュー・フォームは、キーボードだけで最後まで操作できることを確認する
- 補助文字 `#8C8C89` は背景 `#F7F7F6` に対してコントラストが約3.1:1で、本文に求められる4.5:1に届かない。**本文や入力欄のラベルには使わず**、著作権表記など小さな補助情報に限る

---

## 12. 実装の順番

1. Kuroco のアカウント作成、コンテンツ定義（作品・実績・プロフィール）、仮の作品を5〜10件登録
2. Next.js プロジェクト作成、ESLint / Prettier、`tokens.css`、フォント、`layout.tsx`
3. `lib/kuroco/` と `scripts/fetch-content.ts`（データ取得・変換・画像の縮小）＋テスト
4. `JustifiedRows` / `PhotoTile` → Gallery を表示
5. `GalleryTabs`（絞り込み・URL連動・キーボード操作）
6. `PhotoViewer` → 作品詳細 → `Lightbox` → MV
7. `Header` / `NavLinks` / `MobileMenu` / `Footer`
8. Profile、Contact（Kuroco フォームと接続）
9. `FadeIn`、404、ページごとのタイトルと説明文
10. GitHub Actions で公開 → Kuroco からの自動公開を設定 → 実機（PC・スマホ）で確認

> 💡 **補足：Kuroco を最初に作る理由**
> データの形が決まらないと部品の受け取る値も決まりません。最初に Kuroco へ実際の写真を数枚入れておくと、仮の灰色の箱ではなく本物の写真で並び方や余白を確かめながら作れます。

---

## 12.5 実装メモ（2026-11-01、ステップ5）

- **トークンがないときはダミーで動く。** 手元（`npm run dev`）では `dummy-photos/` を使う。GitHub Actions では `KUROCO_REQUIRED=true` にしてあり、トークンがなければビルドを止める（ダミーのまま公開されるのを防ぐ）
- **ビルドを止める条件**: スラッグの空欄・形式違い・重複、カテゴリの未選択・スラッグの空欄や重複、写真の未登録、MVがちょうど10件でない、MVの順番の重複、プロフィールの欠け。理由は Actions のログに日本語で出る
- **書き出しは `trailingSlash: true`**（`/gallery/` を `gallery/index.html` として書き出す）。GitHub Pages でフォルダとファイルの名前がぶつからないようにするため
- **Gallery の戻り方**: 写真を押したときの場所（URL とスクロール位置）を覚え、作品詳細の「← Gallery」はブラウザの戻ると同じ動きにした。ブラウザの戻るで帰ったときだけスクロール位置を戻す（`src/lib/navigation.ts`）
- **拡大表示の閉じ方**: 「✕ 閉じる」、Esc、写真とボタン以外の場所を押す。閉じると押した写真にフォーカスが戻り、スクロール位置もそのまま
- **お問い合わせの送信**: Kuroco の項目名は `name`・`email`・`body`（お問い合わせ内容）。Kuroco が返す入力エラーは、該当する項目の下に表示する。送信が多すぎるとき（429）と通信の失敗は、フォームの下に文章で伝える
- **共有用の画像とアイコン**: `src/app/opengraph-image.png`（1200×630）・`icon.png`・`apple-icon.png`。作品詳細の共有画像は、その作品の写真
- 動作は Playwright で PC（1440px）と SP（390px）を確認済み（タブの矢印キー操作・URL連動、前後移動、戻ったときのタブとスクロール位置、拡大表示の開閉とフォーカス、SPメニュー、フォームの入力チェックと送信結果）

---

## 13. この設計で新たに決めたいこと

- [x] リポジトリ: `hono-hono/photographer`（公開URLは `https://hono-hono.github.io/photographer/`。`basePath` は既存の `deploy.yml` で `/photographer` に設定済み）
- [x] 独自ドメイン → 使わない
- [x] 作品のスラッグ → 場所名-連番（例: `shimotsui-line-01`。英小文字・数字・ハイフンのみ、連番は2桁）
- [x] 拡大表示 → 重ね表示
- [ ] Gallery の行の目安（PC 約4.0 / SP 約2.0）を実際の写真で確認して調整
- [x] Web用写真の縮小サイズ → 長辺2400px・JPEG品質80（`scripts/fetch-content.ts` の `LONG_EDGE` / `QUALITY`）
- [x] お問い合わせの自動返信メールの文面 → 仕様書 5.5
- [x] 画像拡張項目の返り値の形 → `{ id, url, url_org, desc }`（OpenAPI で確認。`url_org` を使う）
- [x] Kuroco の GitHub 連携 → ［KurocoFront］→［GitHub］で連携し、連携先を `deploy.yml`・`main` に。保存時の実行はカスタム処理＋トリガーで行う（2026-11-07 動作確認済み。Kuroco からは `workflow_dispatch` で動く）
- [ ] 一覧の表示順（管理画面での並べ替え）を使うか。今は登録順（topics_id の昇順）
