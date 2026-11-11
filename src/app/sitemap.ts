import type { MetadataRoute } from "next";
import { getWorks } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

// 静的書き出しで sitemap.xml を作る（Google Search Console に登録して使う）
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), priority: 1 },
    { url: absoluteUrl("/gallery/"), priority: 0.8 },
    ...getWorks().map((w) => ({ url: absoluteUrl(`/gallery/${w.slug}/`), priority: 0.5 })),
  ];
}
