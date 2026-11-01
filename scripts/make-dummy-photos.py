"""ダミー写真を作るスクリプト。

本物の写真が決まるまで、デザイン・Kuroco・実装の確認に使う灰色の画像を作る。
縦横比と濃さをばらばらにして、「高さをそろえた行」の並び方を確かめられるようにする。

使い方:
    python3 scripts/make-dummy-photos.py

出力: dummy-photos/ に JPEG 21枚と、一覧の manifest.json
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "dummy-photos"
LONG_EDGE = 1600  # ダミーなので軽めにする（本番の写真は長辺3000px程度まで）

# 写真の仮置き色（デザイン依頼書 4章）
TONES = ["#B8B6B0", "#D9D9D6", "#8C8C89", "#4A4A47"]

# (スラッグ, カテゴリ, 縦横比 幅:高さ, 代替テキスト)
WORKS = [
    ("dummy-works-01", "works", (3, 2), "ダミー写真（横位置）"),
    ("dummy-works-02", "works", (2, 3), "ダミー写真（縦位置）"),
    ("dummy-works-03", "works", (4, 5), "ダミー写真（縦位置）"),
    ("dummy-works-04", "works", (16, 9), "ダミー写真（横長）"),
    ("dummy-works-05", "works", (1, 1), "ダミー写真（正方形）"),
    ("dummy-works-06", "works", (3, 2), "ダミー写真（横位置）"),
    ("dummy-works-07", "works", (2, 3), "ダミー写真（縦位置）"),
    ("dummy-works-08", "works", (4, 3), "ダミー写真（横位置）"),
    ("dummy-works-09", "works", (3, 4), "ダミー写真（縦位置）"),
    ("dummy-works-10", "works", (3, 2), "ダミー写真（横位置）"),
    ("dummy-works-11", "works", (5, 4), "ダミー写真（横位置）"),
    ("dummy-works-12", "works", (2, 3), "ダミー写真（縦位置）"),
    ("dummy-family-01", "family", (3, 2), "ダミー写真（横位置）"),
    ("dummy-family-02", "family", (4, 5), "ダミー写真（縦位置）"),
    ("dummy-family-03", "family", (1, 1), "ダミー写真（正方形）"),
    ("dummy-family-04", "family", (3, 2), "ダミー写真（横位置）"),
    ("dummy-anniversary-01", "anniversary", (2, 3), "ダミー写真（縦位置）"),
    ("dummy-anniversary-02", "anniversary", (3, 2), "ダミー写真（横位置）"),
    ("dummy-anniversary-03", "anniversary", (16, 9), "ダミー写真（横長）"),
    ("dummy-anniversary-04", "anniversary", (4, 5), "ダミー写真（縦位置）"),
]

# MVに使う10枚（順番どおり）。縦横の混ざり方が PC の 4・3・3 行で偏らないように選ぶ
MAIN_VISUAL = [
    "dummy-works-01", "dummy-works-02", "dummy-works-04", "dummy-works-03",
    "dummy-family-01", "dummy-works-07", "dummy-works-08",
    "dummy-anniversary-01", "dummy-works-10", "dummy-works-05",
]

PORTRAIT = ("dummy-portrait", (2, 3), "ダミーのポートレート")


def size_for(ratio):
    w, h = ratio
    if w >= h:
        return LONG_EDGE, round(LONG_EDGE * h / w)
    return round(LONG_EDGE * w / h), LONG_EDGE


def text_color(tone):
    # 濃い灰色には明るい文字、明るい灰色には暗い文字
    return "#F7F7F6" if tone in ("#8C8C89", "#4A4A47") else "#4A4A47"


def make(slug, ratio, tone, label):
    w, h = size_for(ratio)
    img = Image.new("RGB", (w, h), tone)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 40)
    text = f"{label}\n{ratio[0]}:{ratio[1]}  {w}x{h}"
    draw.multiline_text((48, h - 140), text, fill=text_color(tone), font=font, spacing=12)
    path = OUT / f"{slug}.jpg"
    img.save(path, "JPEG", quality=80)
    return w, h


def main():
    OUT.mkdir(exist_ok=True)
    manifest = {"works": [], "mainVisual": MAIN_VISUAL, "portrait": None}
    for i, (slug, category, ratio, alt) in enumerate(WORKS):
        tone = TONES[i % len(TONES)]
        w, h = make(slug, ratio, tone, slug)
        manifest["works"].append(
            {"slug": slug, "category": category, "file": f"{slug}.jpg",
             "width": w, "height": h, "alt": alt}
        )
    slug, ratio, alt = PORTRAIT
    w, h = make(slug, ratio, "#B8B6B0", slug)
    manifest["portrait"] = {"file": f"{slug}.jpg", "width": w, "height": h, "alt": alt}

    assert len(MAIN_VISUAL) == 10
    assert set(MAIN_VISUAL) <= {s for s, *_ in WORKS}
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"{len(WORKS)} works + 1 portrait -> {OUT}")


if __name__ == "__main__":
    main()
