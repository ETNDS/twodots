"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import styles from "@styles/collezione.module.css";

function primaRiga(testo: string): string {
  const righe = testo.split("\n");
  for (const riga of righe) {
    const pulita = riga.replace(/\*\*/g, "").replace(/\*/g, "").trim();
    if (pulita && !pulita.startsWith("#")) return pulita;
  }
  return "";
}

export default function Collezione() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carica() {
      try {
        const data = await getAnimaliPubblicati();
        const ordinati = data.slice().sort((a, b) => a.nome.localeCompare(b.nome, "it"));
        setAnimali(ordinati);
        setLoading(false);
      } catch (e) {
        console.error("Errore:", e);
        setLoading(false);
      }
    }
    carica();
  }, []);

  return (
    <>
      <BackgroundLogo />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.label}>COLLEZIONE</p>
          <h1 className={styles.title}>Gli animali 2dots</h1>
          <p className={styles.sub}>
            Scegli il soggetto che senti più tuo e personalizzalo nei dettagli.
          </p>
        </div>
        {loading ? (
          <div className={styles.loading}>Caricamento...</div>
        ) : (
          <div className={styles.grid}>
            {animali.map((animale) => (
              <Link
                key={animale.id}
                href={`/collezione/${animale.id}`}
                className={styles.cardLink}
              >
                <div className={styles.card}>
                  <div className={styles.imageWrapper}>
                    {animale.immagineDisegno ? (
                      <img
                        src={animale.immagineDisegno}
                        alt={`Ciondolo ${animale.nome} — bijoux artigianale Two Dots`}
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.placeholder}>
                        <span>{animale.nome[0]}</span>
                      </div>
                    )}
                  </div>
                  {animale.inEvidenza && (
                    <div className={styles.badge}>Più scelto</div>
                  )}
                  <div className={styles.info}>
                    <h2 className={styles.nome}>{animale.nome}</h2>
                    <p className={styles.forma}>{primaRiga(animale.storia)}</p>
                    <p className={styles.disponibile}>Disponibile in versione YOU o YOU &amp; PET</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.ctaProponi}>
          <p className={styles.ctaProponiTitolo}>Non hai trovato quello che cercavi?</p>
          <p className={styles.ctaProponiSub}>Scrivici il soggetto che hai in mente: valutiamo insieme fattibilità e tempi.</p>
          <Link href="/contatti">
            <button className={styles.ctaProponiBtn}>Scrivici</button>
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}
