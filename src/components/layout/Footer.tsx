import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.copyright}>
          &copy; {currentYear} hono. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
