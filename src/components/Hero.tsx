"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@styles/hero.module.css";

export default function Hero() {
  const [numSoggetti, setNumSoggetti] = useState<number | null>(null);
  const [numCristalli, setNumCristalli] = useState<number | null>(null);

  useEffect(() => {
    getDocs(collection(db, "animali")).then(snap => {
      const pubblicati = snap.docs.filter(d => d.data().pubblicato).length;
      setNumSoggetti(pubblicati);
    });
    getDocs(collection(db, "cristalli")).then(snap => {
      const attivi = snap.docs.filter(d => d.data().attivo).length;
      setNumCristalli(attivi);
    });
  }, []);

return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <h1 className={styles.tagline}>
          Non è solo un ciondolo. È il vostro segno.
        </h1>
        <p className={styles.sub}>
          Un pezzo unico che racconta il legame con il tuo animale.
          Lo configuri tu — soggetto, colori, incisione.
          Lo stesso segno per te e per il tuo pet.
        </p>
        <p className={styles.stats}>
          {numSoggetti !== null ? numSoggetti : "—"} soggetti · {numCristalli !== null ? numCristalli : "—"} colori Swarovski · incisione personalizzata · aggiungi il PET al tuo bijoux
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/configura">
            <button className={styles.cta}>Crea il tuo bijoux</button>
          </Link>
          <Link href="/bijoux-coppia" className={styles.ctaSecondary}>
            Scopri You &amp; Pet
          </Link>
        </div>
      </div>
      <div className={styles.image}>
        <Image
          src="/images/hero-main.svg"
          alt="Donna con il suo animale — bijoux 2dots al collo"
          width={400}
          height={500}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </section>
  );
}
