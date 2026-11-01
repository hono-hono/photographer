import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { withBase } from "@/lib/site";
import type { AchievementGroup, Profile } from "@/types/content";
import { AchievementList } from "./AchievementList";
import styles from "./ProfileSection.module.css";

/** PC は左にポートレート（縦位置）、右に文章。SP は見出し → ポートレート（横長） → 文章 */
export function ProfileSection({ profile, achievements }: { profile: Profile; achievements: AchievementGroup[] }) {
  const { portrait } = profile;
  return (
    <section aria-labelledby="profile" className={styles.section} data-nav-section="profile">
      <FadeIn className={styles.layout}>
        <div className={styles.heading}>
          <SectionHeading id="profile">Profile</SectionHeading>
        </div>
        <div className={styles.portrait}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 静的書き出しのため */}
          <img
            src={withBase(portrait.src)}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            loading="lazy"
            decoding="async"
            className={styles.portraitImg}
          />
        </div>
        <div className={styles.body}>
          <p className={styles.lead}>{profile.lead}</p>
          <h3 className={styles.subheading}>写真歴</h3>
          <p className={styles.text}>{profile.history}</p>
          <h3 className={`${styles.subheading} ${styles.achievementsHeading}`}>実績</h3>
          <AchievementList groups={achievements} />
        </div>
      </FadeIn>
    </section>
  );
}
