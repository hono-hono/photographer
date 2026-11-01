import type { AchievementGroup } from "@/types/content";
import styles from "./AchievementList.module.css";

/** 実績の行リスト。区分ごとにまとめ、年月が分からない行は年月の欄を空ける */
export function AchievementList({ groups }: { groups: AchievementGroup[] }) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`achievements-${group.key}`}>
          <h4 id={`achievements-${group.key}`} className={styles.label}>
            {group.label}
          </h4>
          <ul className={styles.list}>
            {group.items.map((item, i) => (
              <li key={i} className={styles.row}>
                <span className={styles.date}>{item.date ?? ""}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
