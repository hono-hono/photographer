import Image from "next/image";
import Link from "next/link";
import { featuredPhotos } from "@/data/photos";
import styles from "./FeaturedGallery.module.css";

export function FeaturedGallery() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="featured-heading">
      <div className="container">
        <div className={styles.header}>
          <p className="section__label">Featured</p>
          <h2 id="featured-heading" className="section__title">
            Gallery
          </h2>
        </div>

        <div className={styles.grid}>
          {featuredPhotos.map((photo, index) => (
            <figure
              key={photo.id}
              className={`${styles.item} ${styles[`item--${index + 1}`]}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </figure>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/gallery" className="link-subtle">
            View all works
          </Link>
        </div>
      </div>
    </section>
  );
}
