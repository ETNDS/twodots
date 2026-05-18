"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundLogo from "@/components/BackgroundLogo";
import { getAnimaliPubblicati, Animale } from "@/lib/animali";
import styles from "@styles/collezione.module.css";

export default function Collezione() {
  const [animali, setAnimali] = useState<Animale[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function carica() {
      try {
        const data = await getAnimaliPubblicati();
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
              <div
                key={animale.id}
                className={styles.card}
                onClick={() => router.push(`/collezione/${animale.id}`)}
                style={{ cursor: "pointer" }}
              >
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
                <div className={styles.info}>
                  <h2 className={styles.nome}>{animale.nome}</h2>
                  <p className={styles.forma}>{animale.forma}</p>
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
