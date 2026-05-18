"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrello } from "@/lib/carrello";
import Dialog from "@/components/Dialog";
import styles from "@styles/navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isConfigura = pathname === "/configura";
  const { articoli } = useCarrello();
  const nArticoli = articoli.length;
  const [showDialog, setShowDialog] = useState(false);

  function handleIniziaOra() {
    if (isConfigura) {
      setShowDialog(true);
      return;
    }
    router.push("/configura");
  }

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          <div className={styles.logo}>
            <Link href="/home">
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
            <Link href="/bijoux-coppia">You &amp; Pet</Link>
            <Link href="/configura">Configura</Link>
            <Link href="/storia">Il progetto</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className={styles.actions}>
            {nArticoli > 0 && (
              <Link href="/carrello" className={styles.cartBtn}>
                <span className={styles.cartIcon}>🛒</span>
                <span className={styles.cartCount}>{nArticoli}</span>
              </Link>
            )}
            <button className={styles.cta} onClick={handleIniziaOra}>
              Inizia ora
            </button>
          </div>
        </div>
      </nav>

      {showDialog && (
        <Dialog
          titolo="Ricominciare la configurazione?"
          testo="Se procedi perderai le scelte fatte finora."
          confermaTesto="Sì, ricomincia"
          annullaTesto="Annulla"
          onConferma={() => { setShowDialog(false); router.push("/configura?reset=1"); }}
          onAnnulla={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
