import Link from "next/link";
import { APP_VERSION, APP_YEAR } from "@/config/version";
import { SOCIAL, SITE } from "@/config/constants";
import IconInstagram from "@/components/IconInstagram";
import IconFacebook from "@/components/IconFacebook";
import styles from "@styles/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.logo}>{SITE.name} · {SITE.city}</span>
        <span className={styles.tagline}>{SITE.tagline}</span>
        <div className={styles.right}>
          <div className={styles.links}>
            <div className={styles.social}>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <IconInstagram size={16} />
              </a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <IconFacebook size={16} />
              </a>
            </div>
            <Link href="/contatti">Contatti</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <span className={styles.version}>ver. {APP_VERSION} · {APP_YEAR}</span>
        </div>
      </div>
    </footer>
  );
}
