import styles from "./SectionHeading.module.css";

type Props = {
  id?: string;
  level?: 1 | 2;
  children: React.ReactNode;
};

/** 明朝のセクション見出し（字間 12%） */
export function SectionHeading({ id, level = 2, children }: Props) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <Tag id={id} className={styles.heading}>
      {children}
    </Tag>
  );
}
