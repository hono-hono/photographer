import { Button } from "@/components/ui/Button";
import { ContactSection } from "@/features/contact/ContactSection";
import { MainVisual } from "@/features/home/MainVisual";
import { ProfileSection } from "@/features/home/ProfileSection";
import { getAchievements, getMainVisual, getProfile } from "@/lib/content";
import { galleryHref } from "@/lib/works";
import styles from "./page.module.css";

export default function HomePage() {
  const mv = getMainVisual();
  return (
    <main className={styles.main}>
      <h1 className="visually-hidden">hono — 写真家のポートフォリオ</h1>
      <section aria-label="代表作">
        <MainVisual works={mv} />
        <div className={styles.more}>
          <Button variant="solid" href={galleryHref("all")}>
            すべての写真を見る<span aria-hidden="true">→</span>
          </Button>
        </div>
      </section>
      <ProfileSection profile={getProfile()} achievements={getAchievements()} />
      <ContactSection />
    </main>
  );
}
