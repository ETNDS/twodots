"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecensioniApprovate, Recensione } from "@/lib/recensioni";
import styles from "@styles/recensioni.module.css";

export default function RecensioniHome() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);

  useEffect(() => {
    getRecensioniApprovate().then(r => setRecensioni(r.slice(0, 4)));
  }, []);

  return (
    <section className={styles.homeSection}>
      <p className={styles.homeLabel}>RECENSIONI</p>
      <h2 className={styles.homeTitolo}>Cosa dicono di noi</h2>
      {recensioni.length > 0 && (
        <div className={styles.homeGrid}>
          {recensioni.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardNome}>{r.nome}</span>
                <span className={styles.stelle}>{"★".repeat(r.stelle)}</span>
              </div>
              <p className={styles.cardCommento}>{r.commento}</p>
            </div>
          ))}
        </div>
      )}
      <div className={styles.homeCta}>
        <Link href="/recensioni">
          <button className={styles.homeCtaBtn}>Scrivi una recensione</button>
        </Link>
      </div>
    </section>
  );
}
