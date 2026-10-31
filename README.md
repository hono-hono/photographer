# hono — Photographer Portfolio

写真家 hono のポートフォリオサイト。

## 技術スタック

- Next.js 15 (App Router)
- TypeScript
- CSS Modules

---

## ローカルで表示する手順（初心者向け）

`http://localhost:3000/` でサイトを見るには、**Node.js のインストール → 準備 → サーバー起動** の3ステップが必要です。

### 全体の流れ

```
① Node.js をインストール
      ↓
② プロジェクトの準備（npm install）
      ↓
③ 開発サーバーを起動（npm run dev）
      ↓
ブラウザで http://localhost:3000/ を開く
```

---

### ステップ 1：Node.js をインストール

Node.js がないと `npm` コマンドが使えず、サイトを起動できません。

#### おすすめ：公式サイトから入れる（いちばん簡単）

1. ブラウザで [https://nodejs.org/ja](https://nodejs.org/ja) を開く
2. **「LTS（推奨版）」** のダウンロードボタンをクリック
3. ダウンロードした `.pkg` ファイルを開き、画面の指示どおりにインストール
4. **ターミナルを一度閉じて、新しく開き直す**（重要）

#### インストールできたか確認する

ターミナルで次を入力して Enter：

```bash
node -v
```

`v20.x.x` や `v22.x.x` のようにバージョンが表示されれば OK です。

```bash
npm -v
```

こちらも `10.x.x` などが表示されれば OK です。

> **補足：** Homebrew（`brew install node`）は環境によってエラーになることがあります。うまくいかない場合は、上記の公式インストーラーを使うのが確実です。

---

### ステップ 2：プロジェクトの準備

ターミナルで、プロジェクトのフォルダに移動します。

```bash
cd "/Users/hono/Documents/プライベート/portfolio_site"
```

次に、必要なライブラリをインストールします（初回のみ、数分かかることがあります）。

```bash
npm install
```

完了すると、フォルダ内に `node_modules` というディレクトリができます。

---

### ステップ 3：開発サーバーを起動

同じフォルダで次を実行します。

```bash
npm run dev
```

成功すると、ターミナルにだいたい次のような表示が出ます。

```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

**この状態でターミナルは閉じないでください。** 閉じるとサーバーが止まり、サイトが見えなくなります。

---

### ステップ 4：ブラウザで確認

Chrome や Safari で次の URL を開きます。

```
http://localhost:3000/
```

写真家 hono のトップページが表示されれば成功です。

---

### うまくいかないとき

| 症状 | 原因と対処 |
|------|-----------|
| `command not found: node` | Node.js が未インストール → ステップ 1 をやり直す |
| `command not found: npm` | 同上。ターミナルを開き直してから再確認 |
| `npm install` でエラー | インターネット接続を確認して再実行 |
| ブラウザで「接続できない」 | `npm run dev` が動いているか確認。ターミナルに `Ready` と出ているか見る |
| ポート使用中のエラー | 別の `npm run dev` が動いている可能性。ターミナルで `Ctrl + C` で止めてから再起動 |

---

### サーバーを止めるとき

ターミナルで `Ctrl + C` を押すと停止します。

---

### Cursor からやる場合

1. Cursor で `portfolio_site` フォルダを開く
2. メニュー **Terminal → New Terminal** でターミナルを開く
3. 上記の `npm install` → `npm run dev` を順に実行

---

## ビルド

```bash
npm run build
```

静的ファイルは `out/` ディレクトリに出力されます（GitHub Pages 向け）。

## GitHub Pages デプロイ

1. リポジトリの Settings → Pages で「GitHub Actions」をソースに設定
2. `main` ブランチへの push で自動デプロイ
3. `NEXT_PUBLIC_BASE_PATH` をリポジトリ名に合わせて `.github/workflows/deploy.yml` で調整

ユーザーサイト（`username.github.io`）の場合は `NEXT_PUBLIC_BASE_PATH` を空文字にしてください。

## 画像の差し替え

`public/images/` のプレースホルダー画像を実際の作品に差し替え、`src/data/photos.ts` のパスを更新してください。

## サイト構成

3ページ構成です（2026-10 確定）。Profile と Contact はトップの中に置きます。

- `/` — トップ（MV → すべての写真を見る → Profile `#profile` → Contact `#contact`）
- `/gallery?category=all|works|family|anniversary` — Gallery（タブで絞り込み）
- `/gallery/[slug]` — 作品詳細（写真だけを大きく表示）

作品・実績・プロフィール文は CMS（Kuroco）で管理する予定です。

## ドキュメント

設計・仕様は `document/` にあります。

| ファイル | 内容 |
|---|---|
| [document/hono_site_spec.md](./document/hono_site_spec.md) | ページ仕様書 |
| [document/hono_design_brief.md](./document/hono_design_brief.md) | デザイン依頼書 |
| [document/hono_component_design.md](./document/hono_component_design.md) | コンポーネント設計書（Next.js × Kuroco） |
| [document/learning/](./document/learning/) | 学習メモ |
