import Link from "next/link";
import styles from "./ContactPreview.module.css";

export function ContactPreview() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="contact-heading">
      <div className={`container container--narrow ${styles.inner}`}>
        <p className="section__label">Get in touch</p>
        <h2 id="contact-heading" className="section__title">
          Contact
        </h2>
        <p className={styles.description}>
          撮影のご依頼やお問い合わせは、
          お気軽にご連絡ください。
        </p>
        <Link href="/contact" className="link-subtle">
          Send a message
        </Link>
      </div>
    </section>
  );
}
