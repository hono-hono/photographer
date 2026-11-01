/**
 * 共有用の画像（OGP）とアイコンを作り直すスクリプト。結果は src/app/ に保存してリポジトリに入れる。
 * 実行: node scripts/make-brand-images.mjs（Playwright の Chromium を使う）
 */
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
// playwright はプロジェクトに入れていないので、グローバルに入っているものを使う（npm i -g playwright）
const require = createRequire(import.meta.url);
const { chromium } = require(
  require.resolve("playwright", { paths: [root, ...(process.env.NODE_PATH ?? "").split(":")] }),
);
const font = (pkg, file) => pathToFileURL(path.join(root, "node_modules/@fontsource", pkg, "files", file)).href;

const css = `
@font-face { font-family: Serif; src: url(${font("noto-serif-jp", "noto-serif-jp-latin-400-normal.woff2")}); }
@font-face { font-family: Sans; src: url(${font("noto-sans-jp", "noto-sans-jp-latin-400-normal.woff2")}); }
html, body { margin: 0; }
`;

const og = `<style>${css}
.og { width: 1200px; height: 630px; background: #F7F7F6; color: #1C1C1A; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.logo { font-family: Serif; font-size: 112px; letter-spacing: 0.14em; margin-right: -0.14em; line-height: 1; }
.line { width: 48px; height: 1px; background: #D9D9D6; margin: 44px 0 28px; }
.sub { font-family: Sans; font-size: 22px; letter-spacing: 0.24em; margin-right: -0.24em; color: #4A4A47; }
</style><div class="og"><div class="logo">hono</div><div class="line"></div><div class="sub">PHOTOGRAPHER</div></div>`;

const icon = (size) => `<style>${css}
.icon { width: ${size}px; height: ${size}px; background: #1C1C1A; color: #F7F7F6; display: flex; align-items: center; justify-content: center; }
.h { font-family: Serif; font-size: ${Math.round(size * 0.62)}px; line-height: 1; transform: translateY(-4%); }
</style><div class="icon"><div class="h">h</div></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
const shots = [
  { html: og, w: 1200, h: 630, out: "src/app/opengraph-image.png" },
  { html: icon(512), w: 512, h: 512, out: "src/app/icon.png" },
  { html: icon(180), w: 180, h: 180, out: "src/app/apple-icon.png" },
];
for (const s of shots) {
  await page.setViewportSize({ width: s.w, height: s.h });
  await page.setContent(s.html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, s.out), clip: { x: 0, y: 0, width: s.w, height: s.h } });
  console.log(`wrote ${s.out}`);
}
await browser.close();
