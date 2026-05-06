"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import styles from "@styles/collezione.module.css";

export default function Collezione() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carica() {
            try {
                console.log("Inizio caricamento...");
                const data = await getAnimaliPubblicati();
                console.log("Dati ricevuti:", data);
                setAnimali(data);
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
            Ogni ciondolo ha la sua forma, il suo tratto, la sua storia.
          </p>
        </div>

        {loading ? (
          <div className={styles.loading}>Caricamento...</div>
        ) : (
          <div className={styles.grid}>
            {animali.map((animale) => (
              <div key={animale.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {animale.immagineDisegno ? (
                    <img
                      src={animale.immagineDisegno}
                      alt={animale.nome}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>{animale.nome[0]}</span>
                    </div>
                  )}
                </div>
                <div className={styles.info}>
                    <h2 className={styles.nome}>{animale.nome}</h2>
                    <p className={styles.forma}>{animale.forma}</p>
                    <div className={styles.storia}>
                        <ReactMarkdown>{animale.storia}</ReactMarkdown>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
