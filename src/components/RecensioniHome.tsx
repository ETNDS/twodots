"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecensioniApprovate, Recensione } from "@/lib/recensioni";
import styles from "@styles/recensioni.module.css";

const placeholder: Recensione[] = [
  {
    id: "p1",
    nome: "Martina R.",
    email: "",
    stelle: 5,
    commento: "L'ho regalato alla mia migliore amica. Ha scelto ogni dettaglio — è unico, non trovi niente di simile.",
    stato: "approvata",
    createdAt: null,
  },
  {
    id: "p2",
    nome: "Giulia T.",
    email: "",
    stelle: 5,
    commento: "Gli occhi Swarovski sono bellissimi. Piccolo ma di grande qualità.",
    stato: "approvata",
    createdAt: null,
  },
  {
    id: "p3",
    nome: "Sara M.",
    email: "",
    stelle: 5,
    commento: "Arrivato nella scatolina di cartoncino, tutto curato. Un regalo perfetto.",
    stato: "approvata",
    createdAt: null,
  },
];

export default function RecensioniHome() {
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getRecensioniApprovate().then(r => {
      setRecensioni(r.slice(0, 4));
      setLoaded(true);
    });
  }, []);

  const items = loaded && recensioni.length > 0 ? recensioni : placeholder;

  return (
    <section className={styles.homeSection}>
      <p className={styles.homeLabel}>RECENSIONI</p>
      <h2 className={styles.homeTitolo}>Cosa dicono di noi</h2>
      <div className={styles.homeGrid}>
        {items.map(r => (
          <div key={r.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardNome}>{r.nome}</span>
              <span className={styles.stelle}>{"★".repeat(r.stelle)}</span>
            </div>
            <p className={styles.cardCommento}>{r.commento}</p>
          </div>
        ))}
      </div>
      <div className={styles.homeCta}>
        <Link href="/recensioni">
          <button className={styles.homeCtaBtn}>Scrivi una recensione</button>
        </Link>
      </div>
    </section>
  );
}
