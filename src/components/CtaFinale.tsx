"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@styles/ctaFinale.module.css";

const destinatari = [
  "Per chi ha un pet e lo ama troppo",
  "Per chi porta un animale nell'anima",
  "Per l'amica che parla ai gatti come se capissero tutto",
  "Per chi ha imparato la fedeltà da un cane",
  "Per chi porta uno spirito guida con le zampe",
  "Per chi considera il proprio cane un membro della famiglia",
  "Per chi regala pezzi di sé",
];

export default function CtaFinale() {
  const [indice, setIndice] = useState(0);
  const [visibile, setVisibile] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibile(false);
      setTimeout(() => {
        setIndice((i) => (i + 1) % destinatari.length);
        setVisibile(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.section}>

      {/* Primo nel DOM = primo su mobile = centro su desktop */}
      <div className={styles.bloccoCentrale}>
        <p className={styles.label}>IL TUO BIJOUX</p>
        <h3 className={styles.titoloCentrale}>Crea il tuo bijoux</h3>
        <p className={styles.sub}>Tu scegli ogni dettaglio. Noi lo realizziamo su misura.</p>
        <div className={styles.ctas}>
          <Link href="/configura">
            <button className={styles.btnPrimary}>Crea il tuo bijoux</button>
          </Link>
          <Link href="/collezione">
            <button className={styles.btnSecondary}>Scopri la collezione</button>
          </Link>
        </div>
      </div>

      <div className={styles.bloccoSinistra}>
        <p className={styles.label}>NUOVO SOGGETTO</p>
        <h3 className={styles.titolo}>Non trovi l&apos;animale per te?</h3>
        <p className={styles.sub}>Stiamo sempre aggiungendo nuovi soggetti. Scrivici.</p>
        <Link href="/contatti">
          <button className={styles.btnSecondary}>Scrivici</button>
        </Link>
      </div>

      <div className={styles.bloccoDestra}>
        <p className={styles.label}>UN REGALO</p>
        <h3 className={styles.titolo}>Regala twodots</h3>
        <div className={styles.carouselWrapper}>
          <p className={`${styles.carousel} ${visibile ? styles.visibile : styles.nascosto}`}>
            {destinatari[indice]}
          </p>
        </div>
        <Link href="/configura">
          <button className={styles.btnSecondary}>Scegli il regalo</button>
        </Link>
      </div>

    </section>
  );
}
