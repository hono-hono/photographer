# 学習メモ — Next.js 入門（第1回）

> このフォルダ（`document/learning/`）は、Next.js などの技術学習用メモです。  
> サイトの仕様書は `document/hono_site_spec.md` を参照してください。  
> 最終更新: 2026-09-12

---

## 第1回：Next.js とは何か？（このプロジェクトを例に）

### 1. まず全体像 — ウェブサイトはどう動いている？

ブラウザ（Chrome など）が **URL** を開くと、サーバー（またはビルド済みのファイル）から **HTML・CSS・JavaScript** が届き、画面が表示されます。

```
ユーザーが URL を開く
    ↓
サーバー（または静的ファイル）がページを返す
    ↓
ブラウザが HTML / CSS / JS を解釈して画面を描画
```

**Next.js** は、この「ページを作って届ける仕組み」を楽にしてくれる **フレームワーク（枠組み）** です。  
React（画面の部品を組み立てるライブラリ）の上に乗っています。

| 用語 | ひとことで |
|------|-----------|
| **HTML** | ページの骨組み（見出し・段落・画像の置き場所） |
| **CSS** | 見た目（色・余白・フォント） |
| **JavaScript (JS)** | 動き（クリック・タブ切り替えなど） |
| **React** | 画面を「部品（コンポーネント）」に分けて作る仕組み |
| **Next.js** | React で作ったサイトを、ページ構成・公開・最適化まで面倒見てくれる枠組み |
| **TypeScript** | JavaScript に「型（データの種類）」を付けて、ミスを減らす言語（このプロジェクトで使用中） |

---

### 2. Next.js がしてくれること（初学者向け）

1. **ページと URL を自動で対応させる**  
   フォルダ名がそのまま URL になる（App Router 方式）。

2. **コンポーネントを再利用しやすくする**  
   ヘッダー・フッター・ヒーロー画像など、部品単位で書ける。

3. **画像の最適化**  
   `next/image` で読み込みを工夫できる（このサイトは GitHub Pages 向けに `unoptimized` 設定）。

4. **本番用ビルド**  
   `npm run build` で公開用ファイルを一括生成できる。

5. **開発サーバー**  
   `npm run dev` で、コードを変えるとブラウザが自動更新される。

---

### 3. このプロジェクトのフォルダ構成（重要な部分だけ）

```
portfolio_site/
├── package.json          … プロジェクト名・使うライブラリ・コマンド一覧
├── next.config.ts        … Next.js の設定（GitHub Pages 向けなど）
├── public/               … そのまま公開されるファイル（画像など）
│   └── images/
└── src/
    ├── app/              … ★ ページ（URL）の本体
    │   ├── layout.tsx    … 全ページ共通の枠（Header / Footer）
    │   ├── page.tsx      … トップページ（/）
    │   └── globals.css   … サイト全体の CSS
    ├── components/       … ★ 再利用する部品
    │   ├── home/         … トップページ専用の部品
    │   └── layout/       … Header, Footer など
    └── data/             … 写真データなど（photos.ts）
```

**覚え方:**  
- `src/app/` → 「どの URL に何を表示するか」  
- `src/components/` → 「画面の部品」  
- `public/` → 「そのまま配信するファイル」

---

### 4. App Router — フォルダ = ページ

Next.js 15（このプロジェクト）では **App Router** を使います。

| ファイル | 役割 |
|---------|------|
| `src/app/page.tsx` | トップページ `/` |
| `src/app/layout.tsx` | すべてのページを包む共通レイアウト |
| `src/app/gallery/page.tsx` | （将来）`/gallery` ページ |

`page.tsx` という名前のファイルが「その URL の中身」になります。

---

### 5. 実際のコードで見る — トップページ

`src/app/page.tsx` は、部品を並べているだけです。

```tsx
import { Hero } from "@/components/home/Hero";
// …他の import

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedGallery />
      <ProfilePreview />
      <ContactPreview />
    </>
  );
}
```

- `export default function HomePage()` … このページのメイン関数  
- `<Hero />` … Hero コンポーネントを配置（自己終了タグ）  
- `@/components/...` … `@` は `src/` を指す省略記号（tsconfig で設定）

**コンポーネント** = 画面の「部品」。Lego のブロックのように組み合わせます。

---

### 6. レイアウト — 全ページ共通の枠

`src/app/layout.tsx` は Header と Footer で `<main>{children}</main>` を挟みます。

- `{children}` … 各ページ（`page.tsx`）の中身がここに入る  
- `<html lang="ja">` … 日本語サイトであることを宣言  
- `metadata` … 検索エンジンや SNS 用のタイトル・説明文

---

### 7. コンポーネントの例 — Hero

`src/components/home/Hero.tsx` では:

- `next/image` の `<Image>` で画像を表示  
- `Hero.module.css` で見た目を指定（CSS Modules = ファイル名.module.css）  
- `src/data/photos.ts` から写真データを import

部品ごとに **`.tsx`（見た目・構造）** と **`.module.css`（スタイル）** をペアにするのがこのプロジェクトの流儀です。

---

### 8. よく使うコマンド

| コマンド | 意味 |
|---------|------|
| `npm install` | 依存ライブラリを初回インストール |
| `npm run dev` | 開発サーバー起動（通常 http://localhost:3000） |
| `npm run build` | 本番用にビルド |
| `npm run start` | ビルド後のサイトをローカルで確認 |
| `npm run lint` | コードの書き方チェック |

---

### 9. このサイト特有の設定（next.config.ts）

- `output: "export"` … **静的エクスポート**（HTML ファイルを書き出して GitHub Pages などに置ける）  
- `images.unoptimized: true` … 静的ホスティング向けに画像最適化をオフ  
- `basePath` … リポジトリ名付き URL（例: `/portfolio_site/`）用

---

### 10. 第1回のまとめ（自分用チェックリスト）

- [ ] ウェブページ = HTML + CSS + JavaScript だと言える  
- [ ] React は「部品で UI を作る」、Next.js は「サイト全体の枠組み」だと言える  
- [ ] `src/app/page.tsx` がトップページ、`layout.tsx` が共通枠だと言える  
- [ ] `src/components/` に部品があると言える  
- [ ] `npm run dev` で開発できると言える  

---

## 未確認：「クロコ」について

第1回の質問に **「クロコ」** という言葉がありました。  
プロジェクト内には該当するライブラリ名は見当たりませんでした。

次のどれかを指している可能性があります。**どれか教えてもらえると、第2回以降で追記します。**

| 候補 | 説明 |
|------|------|
| **Cursor** | 今お使いの AI 付きコードエディタ |
| **React** | Next.js の土台（発音や入力の聞き間違い？） |
| **Chakra UI** | React 用の UI 部品ライブラリ（このプロジェクトでは未使用） |
| **Hono** | 別の Web フレームワーク（写真家 hono さんの名前と同じ綴り） |
| **その他** | 教材・記事・動画で見た名称など |

---

## 次回予定（案）

- React の基本（JSX、props、state）をこのプロジェクトの Hero / Header で説明  
- 「クロコ」の正体が分かり次第、そのトピックを追加  
- Gallery ページのルーティング（`/gallery?category=works`）の仕組み
