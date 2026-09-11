import Image from "next/image";
import { heroPhoto } from "@/data/photos";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="代表作品">
      <div className={styles.imageWrapper}>
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt}
          width={heroPhoto.width}
          height={heroPhoto.height}
          priority
          className={styles.image}
          sizes="100vw"
        />
      </div>
      <div className={`container ${styles.content}`}>
        <p className={styles.label}>Photographer</p>
        <h1 className={styles.title}>hono</h1>
        <p className={styles.tagline}>
          心が動いた瞬間を、写真として残す。
        </p>
      </div>
    </section>
  );
}
