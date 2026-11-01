"use client";

import { useState } from "react";
import { JustifiedRows } from "@/components/photo/JustifiedRows";
import { Lightbox } from "@/components/photo/Lightbox";
import { PhotoTile } from "@/components/photo/PhotoTile";
import { fixedRows } from "@/lib/rows";
import type { Work } from "@/types/content";

const PC_PATTERN = [4, 3, 3];
const SP_PATTERN = [2];

/** 代表作10枚。押すとトップの上に重ねて拡大表示（前後移動はこの10枚の中だけ） */
export function MainVisual({ works }: { works: Work[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const photos = works.map((w) => w.photo);

  return (
    <>
      <JustifiedRows
        ratios={photos.map((p) => p.width / p.height)}
        pc={fixedRows(works.length, PC_PATTERN)}
        sp={fixedRows(works.length, SP_PATTERN)}
      >
        {works.map((w, i) => (
          <PhotoTile
            key={w.slug}
            photo={w.photo}
            label={`${w.photo.alt}を拡大して見る`}
            priority={i < PC_PATTERN[0]}
            onClick={() => setIndex(i)}
          />
        ))}
      </JustifiedRows>
      <Lightbox photos={photos} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
