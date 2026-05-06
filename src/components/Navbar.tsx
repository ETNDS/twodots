import Link from "next/link";
import Image from "next/image";
import styles from "@styles/navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/images/twodots-logo-transparent.png"
              alt="Two Dots"
              width={30}
              height={30}
              priority
            />
          </Link>
        </div>
        <div className={styles.links}>
          <Link href="/collezione">Collezione</Link>
          <Link href="/hum-pet">Hum &amp; Pet</Link>
          <Link href="/configura">Configura</Link>
          <Link href="/il-progetto">Il progetto</Link>
        </div>
        <Link href="/contatti">
          <button className={styles.cta}>Crea il tuo</button>
        </Link>
      </div>
    </nav>
  );
}
