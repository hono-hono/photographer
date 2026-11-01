export type NavKey = "gallery" | "profile" | "contact";

export type NavItem = { key: NavKey; label: string; href: string };

/** ヘッダーのナビ3項目。「Home」は置かず、ロゴでトップへ戻る */
export const NAV_ITEMS: NavItem[] = [
  { key: "gallery", label: "Gallery", href: "/gallery" },
  { key: "profile", label: "Profile", href: "/#profile" },
  { key: "contact", label: "Contact", href: "/#contact" },
];
