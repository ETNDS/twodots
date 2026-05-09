"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "@styles/navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isConfigura = pathname === "/configura";

  function handleIniziaOra() {
    if (isConfigura) {
      const ok = window.confirm("Se vai alla pagina di configurazione perderai le scelte fatte finora. Continuare?");
      if (!ok) return;
    }
    router.push("/configura");
  }

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
          <Link href="/hum-pet">You &amp; Pet</Link>
          <Link href="/configura">Configura</Link>
          <Link href="/il-progetto">Il progetto</Link>
        </div>
        <button className={styles.cta} onClick={handleIniziaOra}>
          Inizia ora
        </button>
      </div>
    </nav>
  );
}
