import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EMAIL } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  return (
    <section aria-labelledby="contact" className={styles.section} data-nav-section="contact">
      <FadeIn>
        <SectionHeading id="contact">Contact</SectionHeading>
        <p className={styles.intro}>撮影のご相談や作品について、お気軽にお問い合わせください。</p>
        <ContactForm />
        <p className={styles.mail}>
          メールでのご連絡はこちら
          <br />
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
      </FadeIn>
    </section>
  );
}
