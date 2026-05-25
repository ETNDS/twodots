"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import styles from "@styles/rassicurazioniHome.module.css";

export default function RassicurazioniHome() {
  const [maxPezzi, setMaxPezzi] = useState<number | null>(null);

  useEffect(() => {
    getDoc(doc(db, "configuratore", "impostazioni")).then((snap) => {
      if (snap.exists()) {
        setMaxPezzi(snap.data().maxPezzi || 5);
      }
    });
  }, []);

  return (
    <section className={styles.section}>
      <p className={styles.label}>PRIMA DI ORDINARE</p>
      <h2 className={styles.titolo}>Le cose pratiche da sapere</h2>
      <div className={styles.grid}>
        <div className={styles.item}>
          <p className={styles.itemTitolo}>Realizzato su richiesta.</p>
          <p className={styles.itemTesto}>Ogni bijoux viene creato dopo l&apos;ordine, uno per uno.</p>
        </div>
        <div className={styles.item}>
          <p className={styles.itemTitolo}>Dopo l&apos;ordine.</p>
          <p className={styles.itemTesto}>Ricevi una conferma via email e, quando il pacco parte, la mail del corriere.</p>
        </div>
        <div className={styles.item}>
          <p className={styles.itemTitolo}>Set personalizzabili.</p>
          <p className={styles.itemTesto}>
            Puoi ordinare uno YOU da solo oppure aggiungere uno o più PET. Puoi anche creare più set nello stesso ordine
            {maxPezzi !== null ? `, fino a ${maxPezzi} pezzi` : ""}; se ti serve una quantità maggiore, puoi richiedere un preventivo{" "}
            <Link href="/contatti" className={styles.link}>dalla pagina contatti</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
