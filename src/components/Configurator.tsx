"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@styles/configurator.module.css";

export default function Configurator() {
  const [numCristalli, setNumCristalli] = useState<number | null>(null);

  useEffect(() => {
    getDocs(collection(db, "cristalli")).then(snap => {
      setNumCristalli(snap.size);
    });
  }, []);

  const steps = [
    { num: "01", name: "Animale", desc: "Scegli il soggetto che senti più tuo." },
    { num: "02", name: "Colori", desc: "Definisci base e combinazione visiva." },
    { num: "03", name: "Swarovski", desc: numCristalli !== null ? `${numCristalli} colori di brillanti per gli occhi.` : "Colori di brillanti per gli occhi." },
    { num: "04", name: "Dedica", desc: "Completa il pezzo con un'incisione." },
  ];

  return (
    <section className={styles.section}>
      <p className={styles.label}>COME FUNZIONA</p>
      <h2 className={styles.title}>Un bijoux che prende forma scelta dopo scelta.</h2>
      <p className={styles.sub}>Lo costruisci passo dopo passo, scegliendo solo ciò che conta davvero.</p>
      <div className={styles.grid}>
        {steps.map((s) => (
          <div key={s.num} className={styles.step}>
            <p className={styles.num}>{s.num}</p>
            <p className={styles.name}>{s.name}</p>
            <p className={styles.desc}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div className={styles.cta}>
        <Link href="/configura">
          <button className={styles.btn}>Inizia a configurare</button>
        </Link>
      </div>
    </section>
  );
}
