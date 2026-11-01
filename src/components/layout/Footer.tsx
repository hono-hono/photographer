import { COCONALA_URL } from "@/lib/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <small className={styles.copy}>© hono</small>
        <a href={COCONALA_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Coconala <span aria-hidden="true">↗</span>
          <span className="visually-hidden">（新しいタブで開きます）</span>
        </a>
      </div>
    </footer>
  );
}
