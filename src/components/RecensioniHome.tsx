"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecensioniApprovate, Recensione } from "@/lib/recensioni";
import { distanzaTemporale } from "@/lib/distanzaTemporale";
import styles from "@styles/recensioni.module.css";

export default function RecensioniHome() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);

  useEffect(() => {
    getRecensioniApprovate().then(r => {
      setRecensioni(r.slice(0, 4));
    });
  }, []);

  if (recensioni.length === 0) return null;

  return (
    <section className={styles.homeSection}>
      <p className={styles.homeLabel}>RECENSIONI</p>
      <h2 className={styles.homeTitolo}>Storie reali.</h2>
      <div className={styles.homeGrid}>
        {recensioni.map(r => (
          <div key={r.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNome}>{r.nome}</span>
              <span className={styles.stelle}>{"★".repeat(r.stelle)}</span>
            </div>
            <p className={styles.cardCommento}>{r.commento}</p>
            {r.immagineUrl && (
              <img src={r.immagineUrl} alt="Foto recensione" className={styles.thumbPiccola} />
            )}
            {r.createdAt && <p className={styles.cardData}>{distanzaTemporale(r.createdAt)}</p>}
          </div>
        ))}
      </div>
      <div className={styles.homeCta}>
        <Link href="/recensioni">
          <button className={styles.homeCtaBtn}>Vedi tutte le recensioni</button>
        </Link>
        <Link href="/recensioni/scrivi" className={styles.homeCtaSecondary}>
          Scrivi una recensione →
        </Link>
      </div>
    </section>
  );
}
