"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import styles from "@styles/animals.module.css";

export default function Animals() {
  const [animali, setAnimali] = useState<Animale[]>([]);

  useEffect(() => {
    getAnimaliPubblicati().then((data) => setAnimali(data.slice(0, 6)));
  }, []);

  if (animali.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ogni animale racconta una storia</h2>
        <Link href="/collezione" className={styles.link}>Vedi tutti →</Link>
      </div>
      <div className={styles.grid}>
        {animali.map((animale) => (
          <div key={animale.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              {animale.immagineDisegno ? (
                <img
                  src={animale.immagineDisegno}
                  alt={animale.nome}
                  style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
                />
              ) : (
                <span className={styles.placeholder}>{animale.nome[0]}</span>
              )}
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{animale.nome}</p>
              <p className={styles.story}>{animale.storia.replace(/\*\*/g, "").replace(/\*/g, "").slice(0, 80)}...</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
