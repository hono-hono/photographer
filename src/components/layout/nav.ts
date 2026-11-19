export type NavKey = "gallery" | "profile" | "contact";

export type NavItem = { key: NavKey; label: string; ja: string; href: string };

/** ヘッダーのナビ3項目。「Home」は置かず、ロゴでトップへ戻る */
export const NAV_ITEMS: NavItem[] = [
  { key: "gallery", label: "Gallery", ja: "作品", href: "/gallery" },
  { key: "profile", label: "Profile", ja: "プロフィール", href: "/#profile" },
  { key: "contact", label: "Contact", ja: "お問い合わせ", href: "/#contact" },
];
