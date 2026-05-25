"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getRecensioniApprovate, Recensione } from "@/lib/recensioni";
import { distanzaTemporale } from "@/lib/distanzaTemporale";
import styles from "@styles/recensioni.module.css";

const PER_PAGINA = 10;

function Stelle({ n }: { n: number }) {
  return (
    <span className={styles.stelle}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= n ? styles.stellaPiena : styles.stellaVuota}>★</span>
      ))}
    </span>
  );
}

export default function Recensioni() {
  const [tutte, setTutte] = useState<Recensione[]>([]);
  const [visibili, setVisibili] = useState(PER_PAGINA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecensioniApprovate().then(r => {
      const ordinate = r.slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      setTutte(ordinate);
      setLoading(false);
    });
  }, []);

  const recensioniVisibili = tutte.slice(0, visibili);
  const haAltre = visibili < tutte.length;

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.listaHeader}>
          <h1 className={styles.titolo}>Cosa dicono di noi</h1>
          <Link href="/recensioni/scrivi">
            <button className={styles.scriviBtn}>Scrivi una recensione</button>
          </Link>
        </div>

        <div className={styles.lista}>
          {loading ? (
            <p className={styles.loading}>Caricamento...</p>
          ) : tutte.length === 0 ? (
            <p className={styles.vuoto}>Ancora nessuna recensione.</p>
          ) : (
            <>
              {recensioniVisibili.map(r => (
                <div key={r.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNome}>{r.nome}</span>
                    <Stelle n={r.stelle} />
                  </div>
                  <p className={styles.cardCommento}>{r.commento}</p>
                  {r.immagineUrl && (
                    <img src={r.immagineUrl} alt="Foto recensione" className={styles.thumbGrande} />
                  )}
                  {r.createdAt && (
                    <p className={styles.cardData}>{distanzaTemporale(r.createdAt)}</p>
                  )}
                </div>
              ))}
              {haAltre && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={() => setVisibili(v => v + PER_PAGINA)}
                >
                  Carica altre recensioni
                </button>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
