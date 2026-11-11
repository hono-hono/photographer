# hono — Photographer Portfolio

写真家 hono のポートフォリオサイト。

## 技術スタック

- Next.js 15 (App Router、静的書き出し) + TypeScript
- CSS Modules + CSS変数（`src/styles/tokens.css`）
- CMS: Kuroco（作品・実績・プロフィール・お問い合わせ）
- 公開: GitHub Pages（GitHub Actions で自動ビルド）
- テスト: Vitest（並べ方・前後移動・Kuroco データの変換・入力チェック）

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

> 💡 **補足：手元ではダミー写真で表示されます**
> `npm run dev` は最初に `npm run content` を実行して、表示するデータを `.content/` に、縮小した写真を `public/photos/` に用意します。Kuroco のAPIトークンがなければ `dummy-photos/` のダミーを使います。
> Kuroco のデータで確かめたいときは、`.env.local` に `KUROCO_API_TOKEN=トークン` を書いてから起動します（このファイルは GitHub に上がりません）。

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

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 手元で表示（http://localhost:3000/） |
| `npm run build` | 公開用のファイルを `out/` に書き出す |
| `npm test` | テストを実行 |
| `npm run typecheck` / `npm run lint` | 型と書き方のチェック |
| `npm run content` | データと写真だけを取り直す |

## 公開の仕組み

`.github/workflows/deploy.yml` が次のときに動き、Kuroco からデータと写真を取ってビルドし、GitHub Pages に公開します。

- `main` に push したとき
- Kuroco で保存したとき（Kuroco の GitHub 連携から。`kuroco_front.json` は連携に必要なため置いている）
- Actions の画面から手動で実行したとき

> ⚠️ **注意**
> リポジトリの Settings → Secrets に `KUROCO_API_TOKEN` がないとビルドを止めます（ダミー写真のまま公開されるのを防ぐため）。

## 写真と文章の更新

写真・実績・プロフィール文は **Kuroco の管理画面**で更新します。コードを触る必要はありません。保存すると数分でサイトに反映されます。

Gallery のタブ（カテゴリ）は、Kuroco の［コンテンツ定義］→「作品」の行の［カテゴリ設定］で増やしたり、名前や並び順を変えたりできます。カテゴリ名がタブの表示名、スラッグ（英数字）が URL の `?category=` になります。作品のカテゴリは、作品の編集画面の標準の「カテゴリ」で選びます。

MV（トップの10枚）は、作品の「MVに使う」を「使う」にし、「MVの順番」に1〜10を入れます。ちょうど10件でないとビルドが止まり、Actions のログに理由が出ます。

## サイト構成

3ページ構成です（2026-10 確定）。Profile と Contact はトップの中に置きます。

- `/` — トップ（MV → すべての写真を見る → Profile `#profile` → Contact `#contact`）
- `/gallery?category=all|works|family|anniversary` — Gallery（タブで絞り込み）
- `/gallery/[slug]` — 作品詳細（写真だけを大きく表示）


## ドキュメント

設計・仕様は `document/` にあります。

| ファイル | 内容 |
|---|---|
| [document/hono_site_spec.md](./document/hono_site_spec.md) | ページ仕様書 |
| [document/hono_design_brief.md](./document/hono_design_brief.md) | デザイン依頼書 |
| [document/hono_component_design.md](./document/hono_component_design.md) | コンポーネント設計書（Next.js × Kuroco） |
| [document/launch_checklist.md](./document/launch_checklist.md) | 公開までの手順 |
| [document/operation_manual.md](./document/operation_manual.md) | 運用マニュアル（作品・カテゴリ・MVの更新、ビルドが止まったとき） |
| [document/learning/](./document/learning/) | 学習メモ |
