export type PhotoCategory = "personal" | "family" | "anniversary";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: PhotoCategory;
  width: number;
  height: number;
}

export const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  personal: "Personal Works",
  family: "Family",
  anniversary: "Anniversary",
};

// プレースホルダー画像 — 実際の作品に差し替えてください
export const photos: Photo[] = [
  {
    id: "hero-01",
    src: "/images/placeholder-hero.svg",
    alt: "光に包まれた風景",
    category: "personal",
    width: 1600,
    height: 1067,
  },
  {
    id: "featured-01",
    src: "/images/placeholder-01.svg",
    alt: "静かな朝の光",
    category: "personal",
    width: 800,
    height: 1000,
  },
  {
    id: "featured-02",
    src: "/images/placeholder-02.svg",
    alt: "家族の笑顔",
    category: "family",
    width: 800,
    height: 600,
  },
  {
    id: "featured-03",
    src: "/images/placeholder-03.svg",
    alt: "記念日のひととき",
    category: "anniversary",
    width: 800,
    height: 1000,
  },
];

export const heroPhoto = photos[0];

export const featuredPhotos = photos.slice(1, 4);
