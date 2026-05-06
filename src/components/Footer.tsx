import Link from "next/link";
import { APP_VERSION, APP_YEAR } from "@/config/version";
import { SOCIAL, SITE } from "@/config/constants";
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              </a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
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
