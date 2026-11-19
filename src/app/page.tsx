import { Button } from "@/components/ui/Button";
import { ContactSection } from "@/features/contact/ContactSection";
import { MainVisual } from "@/features/home/MainVisual";
import { ProfileSection } from "@/features/home/ProfileSection";
import { Themes } from "@/features/home/Themes";
import { getAchievements, getMainVisual, getProfile, getThemes } from "@/lib/content";
import { galleryHref } from "@/lib/works";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main>
      <h1 className="visually-hidden">hono — 写真家のポートフォリオ</h1>
      <MainVisual works={getMainVisual()} />
      <div className={styles.inner}>
        <div className={styles.more}>
          <Button variant="soft" href={galleryHref("all")}>
            すべての写真を見る<span aria-hidden="true">→</span>
          </Button>
        </div>
        <Themes themes={getThemes()} />
        <ProfileSection profile={getProfile()} achievements={getAchievements()} />
        <ContactSection />
      </div>
    </main>
  );
}
