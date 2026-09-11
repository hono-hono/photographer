import Image from "next/image";
import Link from "next/link";
import styles from "./ProfilePreview.module.css";

export function ProfilePreview() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="profile-heading">
      <div className={`container container--narrow ${styles.inner}`}>
        <div className={styles.imageWrapper}>
          <Image
            src="/images/placeholder-profile.svg"
            alt="写真家 hono のプロフィール写真"
            width={400}
            height={500}
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <p className="section__label">About</p>
          <h2 id="profile-heading" className="section__title">
            Profile
          </h2>
          <p className={styles.description}>
            人の面影や物語を感じる風景から、大切な人との時間まで。
            心が動いた瞬間を写真として残しています。
          </p>
          <Link href="/profile" className="link-subtle">
            Read more
          </Link>
        </div>
      </div>
    </section>
  );
}
