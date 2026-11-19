import { FadeIn } from "@/components/ui/FadeIn";
import type { ThemeTag, Work } from "@/types/content";
import { TagGroup } from "./TagGroup";
import styles from "./Themes.module.css";

/** 撮り続けている被写体（Kuroco のタグ「Themes」）。タグごとに新しい作品を4枚 */
export function Themes({ themes }: { themes: (ThemeTag & { works: Work[] })[] }) {
  if (themes.length === 0) return null;
  return (
    <section aria-labelledby="themes" className={styles.section}>
      <FadeIn>
        <div className={styles.head}>
          <h2 id="themes" className={styles.heading}>
            Themes
          </h2>
          <span className={styles.sub}>撮り続けている被写体</span>
        </div>
        <div className={styles.groups}>
          {themes.map((t) => (
            <TagGroup key={t.slug} theme={t} works={t.works} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
